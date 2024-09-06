import createServer from "@/create-server";
import TestFixture from "@/testing/test-fixture";
import { Express } from "express";
import { Server as HTTPServer } from "http";
import { generateKeyPair } from "jose";
import { Server } from "socket.io";
import { io as ioc, Socket } from "socket.io-client";

describe(`invite-notification-integration.ts`, () => {
  let app: Express;
  let httpServer: HTTPServer;
  let socketServer: Server;
  let fixture: TestFixture;
  let connectionAddress: string;
  let authority: string;
  let inviteeSocket: Socket;
  let thirdPartySocket: Socket;
  let token;

  beforeAll(async () => {
    const jwtKeyPair = await generateKeyPair("RS256");
    ({ app, httpServer, socketServer, authority } = createServer({
      stage: "test",
      keySet: {
        jwtPrivateKey: jwtKeyPair.privateKey,
        jwtPublicKey: jwtKeyPair.publicKey,
      },
    }));
    fixture = new TestFixture(app);
    connectionAddress = `ws://${authority}/invite`;
  }, 100000);
  afterEach(() => {
    inviteeSocket?.disconnect();
    thirdPartySocket?.disconnect();
  });

  describe(`given a user is logged in`, () => {
    describe(`when another user sends them an invite`, () => {
      beforeEach(async () => {
        await fixture.register({
          email: "inviter@mail.com",
          password: "password",
        });
        await fixture.register({
          email: "invitee@mail.com",
          password: "password",
        });

        const inviteeLoginResponse = await fixture.login({
          email: "invitee@mail.com",
          password: "password",
        });

        const {
          body: {
            notification: { uri: inviteeUri },
          },
          headers: { authorization: inviteeToken },
        } = inviteeLoginResponse;
        token = inviteeToken;
        inviteeSocket = ioc(inviteeUri, {
          auth: {
            token: inviteeToken.split(" ")[1],
          },
        });
      });

      it.only(`they receive a new notification`, async () => {
        expect.assertions(1);
        inviteeSocket.connect();
        inviteeSocket.on("INVITE_RECEIVED", (inviteDetails) => {
          inviteeSocket.disconnect();
          expect(inviteDetails).toEqual({
            inviter: "inviter@mail.com",
            invitee: "invitee@mail.com",
            exp: expect.any(Number),
            uuid: expect.toBeUuid(),
            status: "PENDING",
          });
        });

        await fixture.sendInvite({
          inviter: "sender@mail.com",
          invitee: "recipient@mail.com",
          authorization: token,
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
          const thirdPartyLoginResponse = await testFixture.login({
            email: "thirdparty@mail.com",
            password: "password",
          });
          const {
            body: {
              notification: { thirdPartyUri },
            },
            headers: { thirdPartyToken },
          } = thirdPartyLoginResponse;

          const thirdPartySocket = ioc(thirdPartyUri, {
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
