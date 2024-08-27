import appFactory from "@/app";
import createDispatchNotification from "@/notification/create-dispatch-notification";
import TestFixture from "@/testing/test-fixture";
import { Express } from "express";
import http from "http";
import { generateKeyPair, jwtDecrypt } from "jose";
import { AddressInfo } from "net";
import { Server } from "socket.io";
import { Socket as ClientSocket, io as ioc } from "socket.io-client";

describe(`create-dispatch-notification`, () => {
  let testFixture: TestFixture;
  let app: Express;
  let httpServer: http.Server;
  let server: Server;
  let connectionAddress: string;
  let callCreatedDispatchNotificationWhenPromiseResolves: (
    value: unknown
  ) => void = () => {};

  beforeEach(async () => {
    const jwtKeyPair = await generateKeyPair("RS256");
    app = appFactory({
      routerParameters: {
        stage: "test",
        keySet: {
          jwtPublicKey: jwtKeyPair.publicKey,
          jwtPrivateKey: jwtKeyPair.privateKey,
        },
        publishEvent: (queue, payload) => Promise.resolve(),
      },
    });
    testFixture = new TestFixture(app);
    httpServer = http.createServer(app);
    server = new Server(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      connectionAddress = `http://localhost:${port}`;
    });
    server.on("connection", async (socket) => {
      const token = socket.handshake.auth.token;
      const { payload } = await jwtDecrypt(token, jwtKeyPair.privateKey);
      const { username } = payload;

      callCreatedDispatchNotificationWhenPromiseResolves("Resolved");
      socket.join(username as string);
    });
  });

  afterEach(() => {
    httpServer.close();
    server.close();
    httpServer.removeAllListeners();
  });

  describe(`given a user connected to a socket`, () => {
    let recipientSocket: ClientSocket;
    let thirdPartySocket: ClientSocket;

    afterEach(() => {
      if (recipientSocket instanceof ClientSocket) {
        recipientSocket.disconnect();
      }
      if (thirdPartySocket instanceof ClientSocket) {
        thirdPartySocket.disconnect();
      }
    });
    describe(`and no other users are connected`, () => {
      describe(`when a message is dispatched to the user`, () => {
        it(`the user receives the message`, async () => {
          const singleUserPromise = new Promise((resolve) => {
            callCreatedDispatchNotificationWhenPromiseResolves = resolve;
          });
          let userResolver: (value: unknown) => void;
          const userPromise = new Promise((resolve) => {
            userResolver = resolve;
          });
          const recipientAuth = await testFixture.registerAndLogin(
            "recipient@mail.com",
            "password"
          );

          recipientSocket = ioc(connectionAddress, {
            auth: {
              token: recipientAuth.split(" ")[1],
            },
          });

          recipientSocket.connect();
          recipientSocket.on("event", (details) => {
            userResolver(details);
          });

          await singleUserPromise;
          const dispatchNotification = createDispatchNotification(server);
          dispatchNotification({
            recipient: "recipient@mail.com",
            type: "event",
            payload: {
              message: "Hello",
            },
          });

          await expect(userPromise).resolves.toEqual({
            message: "Hello",
          });
        });
      });
      describe(`when multiple messages are dispatched to the user`, () => {
        it(`the user receives all messages`, async () => {
          const singleUserPromise = new Promise((resolve) => {
            callCreatedDispatchNotificationWhenPromiseResolves = resolve;
          });
          let resolveUserReceivesMessagesPromise: (value: unknown) => void;
          const userReceivesMessagesPromise = new Promise((resolve) => {
            resolveUserReceivesMessagesPromise = resolve;
          });

          const recipientAuth = await testFixture.registerAndLogin(
            "recipient@mail.com",
            "password"
          );
          recipientSocket = ioc(connectionAddress, {
            auth: {
              token: recipientAuth.split(" ")[1],
            },
          });

          recipientSocket.connect();
          const messages = [];
          let messagesReceived = 0;
          recipientSocket.on("event", (details) => {
            messagesReceived++;
            messages.push(details);
            if (messagesReceived === 2) {
              resolveUserReceivesMessagesPromise(messages);
            }
          });

          await singleUserPromise;
          const dispatchNotification = createDispatchNotification(server);

          dispatchNotification({
            recipient: "recipient@mail.com",
            type: "event",
            payload: {
              message: "Hello",
            },
          });

          dispatchNotification({
            recipient: "recipient@mail.com",
            type: "event",
            payload: {
              message: "Bye",
            },
          });

          await expect(userReceivesMessagesPromise).resolves.toEqual([
            { message: "Hello" },
            { message: "Bye" },
          ]);
        });
      });
    });
    describe(`and another user is connected to a socket`, () => {
      describe(`when a message is dispatched to the other user`, () => {
        it("only sends the message to the intended recipient", async () => {
          const firstUserConnectionPromise = new Promise((resolve) => {
            callCreatedDispatchNotificationWhenPromiseResolves = resolve;
          });
          let userResolver: (value: unknown) => void;
          const createUserResolver = new Promise((resolve) => {
            userResolver = resolve;
          });

          const recipientAuth = await testFixture.registerAndLogin(
            "recipient@mail.com",
            "password"
          );
          const thirdPartyAuth = await testFixture.registerAndLogin(
            "thirdParty@mail.com",
            "password"
          );

          recipientSocket = ioc(connectionAddress, {
            auth: {
              token: recipientAuth.split(" ")[1],
            },
          });
          thirdPartySocket = ioc(connectionAddress, {
            auth: {
              token: thirdPartyAuth.split(" ")[1],
            },
          });

          recipientSocket.on("event", (details) => {
            userResolver(details);
          });

          await firstUserConnectionPromise;
          const secondUserConnectionPromise = new Promise((resolve) => {
            callCreatedDispatchNotificationWhenPromiseResolves = resolve;
          });

          thirdPartySocket.on("event", () => {
            expect(true).toBeFalsy();
          });

          await secondUserConnectionPromise;
          const dispatchNotification = createDispatchNotification(server);

          dispatchNotification({
            recipient: "recipient@mail.com",
            type: "event",
            payload: {
              message: "Hello",
            },
          });

          await expect(createUserResolver).resolves.toEqual({
            message: "Hello",
          });
        });
      });
      describe(`when a message is dispatched to each user`, () => {
        let player1Socket: ClientSocket;
        let player2Socket: ClientSocket;

        afterEach(() => {
          player1Socket.disconnect();
          player2Socket.disconnect();
        });
        it(`each user receives a message`, async () => {
          const firstUserConnectPromise = new Promise((resolve) => {
            callCreatedDispatchNotificationWhenPromiseResolves = resolve;
          });
          let resolvePlayer1ReceivesMessagePromise: (value: unknown) => void;
          const player1ReceivedMessagePromise = new Promise((resolve) => {
            resolvePlayer1ReceivesMessagePromise = resolve;
          });
          let resolvePlayer2ReceivesMessagePromise: (value: unknown) => void;
          const player2ReceivedMessagePromise = new Promise((resolve) => {
            resolvePlayer2ReceivesMessagePromise = resolve;
          });

          const playerOneAuth = await testFixture.registerAndLogin(
            "player1@mail.com",
            "password"
          );
          const playerTwoAuth = await testFixture.registerAndLogin(
            "player2@mail.com",
            "password"
          );

          player1Socket = ioc(connectionAddress, {
            auth: {
              token: playerOneAuth.split(" ")[1],
            },
          });
          player2Socket = ioc(connectionAddress, {
            auth: {
              token: playerTwoAuth.split(" ")[1],
            },
          });

          player1Socket.on("event", (details) => {
            resolvePlayer1ReceivesMessagePromise(details);
          });

          await firstUserConnectPromise;
          const secondUserConnectionPromise = new Promise((resolve) => {
            callCreatedDispatchNotificationWhenPromiseResolves = resolve;
          });

          player2Socket.on("event", (details) => {
            resolvePlayer2ReceivesMessagePromise(details);
          });

          await secondUserConnectionPromise;
          const dispatchNotification = createDispatchNotification(server);

          dispatchNotification({
            recipient: "player1@mail.com",
            type: "event",
            payload: {
              message: "Hello Player 1!",
            },
          });

          dispatchNotification({
            recipient: "player2@mail.com",
            type: "event",
            payload: {
              message: "Hello Player 2!",
            },
          });

          await expect(player1ReceivedMessagePromise).resolves.toEqual({
            message: "Hello Player 1!",
          });
          await expect(player2ReceivedMessagePromise).resolves.toEqual({
            message: "Hello Player 2!",
          });
        });
      });
    });
  });
});
