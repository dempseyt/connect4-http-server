import appFactory from "@/app";
import { InviteDetails } from "@/invite/invite-service-types";
import TestFixture from "@/testing/test-fixture";
import {
  RabbitMQContainer,
  StartedRabbitMQContainer,
} from "@testcontainers/rabbitmq";
import amqp, { Channel, Connection } from "amqplib";
import { Express } from "express";
import http from "http";
import { generateKeyPair } from "jose";
import { AddressInfo } from "net";
import { Server, Socket as ServerSocket } from "socket.io";
import { Socket as ClientSocket, io as ioc } from "socket.io-client";

function waitFor(socket: ServerSocket | ClientSocket, event: string) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe(`invite-notification-integration.ts`, () => {
  let app: Express;
  let httpServer: http.Server;
  let server: Server;
  let connectionAddress: string;
  let rabbitMQContainer: StartedRabbitMQContainer;
  let connection: Connection;
  let channel: Channel;
  let testFixture: TestFixture;
  let resolveInviteDetailsReceivedPromise: (value: unknown) => void = () => {};

  beforeAll(async () => {
    rabbitMQContainer = await new RabbitMQContainer().start();
    connection = await amqp.connect(rabbitMQContainer.getAmqpUrl());
    channel = await connection.createChannel();

    const q = await channel.assertQueue("invite_created", { durable: false });
    httpServer = http.createServer(app);
    server = new Server(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      connectionAddress = `http://localhost:${port}`;
    });
  });

  beforeEach(async () => {
    const jwtKeyPair = await generateKeyPair("RS256");
    app = appFactory({
      routerParameters: {
        stage: "test",
        keySet: {
          jwtPublicKey: jwtKeyPair.publicKey,
          jwtPrivateKey: jwtKeyPair.privateKey,
        },
        publishEvent: (queue, content: InviteDetails) =>
          Promise.resolve(
            channel.sendToQueue(
              queue,
              Buffer.from(JSON.stringify(content, null, 2))
            )
          ),
      },
    });
    testFixture = new TestFixture(app);
  });

  afterAll(async () => {
    server.close();
    httpServer.close();
    await channel
      .close()
      .then(() => connection.close())
      .then(() => rabbitMQContainer.stop());
  });

  describe(`given a user is logged in`, () => {
    describe(`when another user sends them an invite`, () => {
      let recipientSocket: ClientSocket;

      afterEach(async () => {
        if (recipientSocket instanceof ClientSocket) {
          recipientSocket.disconnect();
        }
      });

      it.skip(`they receive a new notification`, async () => {
        expect.assertions(1);
        const inviteDetailsReceivedPromise = new Promise((resolve) => {
          resolveInviteDetailsReceivedPromise = resolve;
        });

        const recipientAuth = await testFixture.registerAndLogin(
          "recipient@mail.com",
          "password"
        );

        const recipientSocket = ioc(connectionAddress, {
          extraHeaders: {
            Authorization: recipientAuth,
          },
        });

        recipientSocket.connect();
        recipientSocket.on("invite_received", (inviteDetails) => {
          resolveInviteDetailsReceivedPromise(inviteDetails);
        });

        await testFixture.sendInvite({
          inviter: "sender@mail.com",
          invitee: "recipient@mail.com",
          authorization: recipientAuth,
        });
        return expect(inviteDetailsReceivedPromise).resolves.toEqual({
          inviter: "sender@mail.com",
          invitee: "recipient@mail.com",
          exp: expect.any(Number),
          uuid: expect.toBeUuid(),
          status: "PENDING",
        });
      });
      describe("when an inviter sends an invite to an invitee who is not the user", () => {
        it.skip("the user does not receive a notification", async () => {
          let resolveThirdPartyPromise: (value: unknown) => void;
          const mockedHandleInviteReceivedByThirdParty = jest.fn();
          await testFixture.register({
            email: "inviter@mail.com",
            password: "password",
          });
          await testFixture.register({
            email: "thirdparty@mail.com",
            password: "password",
          });
          const thirdPartyToken = (
            await testFixture.login({
              email: "thirdparty@mail.com",
              password: "password",
            })
          ).headers.authorization;

          const thirdPartySocket = ioc(connectionAddress, {
            extraHeaders: {
              Authorization: thirdPartyToken,
            },
          });

          const thirdPartyPromise = new Promise((resolve) => {
            resolveThirdPartyPromise = resolve;
          });

          const inviterToken = (
            await testFixture.login({
              email: "inviter@mail.com",
              password: "password",
            })
          ).headers.authorization;

          thirdPartySocket.connect();
          thirdPartySocket.on("invite_received", (inviteDetails) => {
            resolveThirdPartyPromise(inviteDetails);
            thirdPartySocket.disconnect();
          });

          await testFixture.sendInvite({
            inviter: "inviter@mail.com",
            invitee: "invitee@mail.com",
            authorization: inviterToken,
          });

          return expect(
            Promise.race([
              thirdPartyPromise,
              new Promise((ignore, reject) =>
                setTimeout(() => reject(new Error("Timed out")), 4000)
              ),
            ])
          ).rejects.toThrow("Timed out");
        });
      });
    });
  });
});
