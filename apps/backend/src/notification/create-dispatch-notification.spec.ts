import appFactory from "@/app";
import { ExpressWithPortAndSocket } from "@/create-socket-server";
import createDispatchNotification from "@/notification/create-dispatch-notification";
import TestFixture from "@/testing/test-fixture";
import { generateKeyPair } from "jose";
import { Socket as ClientSocket, io as ioc } from "socket.io-client";

describe(`create-dispatch-notification`, () => {
  let testFixture: TestFixture;
  let app: ExpressWithPortAndSocket;
  let dispatchNotification;
  let callCreatedDispatchNotificationWhenPromiseResolves: (
    value: unknown,
  ) => void = () => {};

  beforeEach(async () => {
    const jwtKeyPair = await generateKeyPair("RS256");
    // httpServer = http.createServer().listen();
    // const port = (httpServer.address() as AddressInfo).port;
    app = appFactory({
      stage: "test",
      keySet: {
        jwtPrivateKey: jwtKeyPair.privateKey,
        jwtPublicKey: jwtKeyPair.publicKey,
      },
      internalEventPublisher: () => Promise.resolve(),
    });
    dispatchNotification = createDispatchNotification(app.server);
    testFixture = new TestFixture(app);
  });

  describe(`given a user connected to a socket`, () => {
    describe(`and no other users are connected`, () => {
      describe(`when a message is dispatched to the user`, () => {
        let recipientSocket: ClientSocket;
        afterEach(() => {
          recipientSocket.removeAllListeners();
          recipientSocket.disconnect();
        });
        it(`the user receives the message`, async () => {
          const singleUserPromise = new Promise((resolve) => {
            callCreatedDispatchNotificationWhenPromiseResolves = resolve;
          });
          let userResolver: (value: unknown) => void;
          const userPromise = new Promise((resolve) => {
            userResolver = resolve;
          });
          await testFixture.register({
            email: "player1@mail.com",
            password: "password",
          });

          const playerOneAuth = await testFixture.login({
            email: "player1@mail.com",
            password: "password",
          });

          const {
            body: {
              notification: { uri },
            },
            headers: { authorization },
          } = playerOneAuth;
          recipientSocket = ioc(uri, {
            auth: {
              token: authorization.split(" ")[1],
            },
          });

          recipientSocket.connect();
          recipientSocket
            .on("event", (details) => {
              userResolver(details);
            })
            .on("connection_established", () => {
              callCreatedDispatchNotificationWhenPromiseResolves("");
            });

          await singleUserPromise;

          dispatchNotification({
            recipient: "player1@mail.com",
            type: "event",
            payload: {
              message: "Hello",
            },
          });

          return expect(userPromise).resolves.toEqual({
            message: "Hello",
          });
        });
      });
      describe(`when multiple messages are dispatched to the user`, () => {
        let recipientSocket: ClientSocket;
        afterEach(() => {
          recipientSocket.removeAllListeners();
          recipientSocket.disconnect();
        });
        it(`the user receives all messages`, async () => {
          const singleUserPromise = new Promise((resolve) => {
            callCreatedDispatchNotificationWhenPromiseResolves = resolve;
          });
          let resolveUserReceivesMessagesPromise: (value: unknown) => void;
          const userReceivesMessagesPromise = new Promise((resolve) => {
            resolveUserReceivesMessagesPromise = resolve;
          });

          await testFixture.register({
            email: "player1@mail.com",
            password: "password",
          });

          const playerOneAuth = await testFixture.login({
            email: "player1@mail.com",
            password: "password",
          });

          const {
            body: {
              notification: { uri },
            },
            headers: { authorization },
          } = playerOneAuth;

          recipientSocket = ioc(uri, {
            auth: {
              token: authorization.split(" ")[1],
            },
          });

          recipientSocket.connect();
          const messages = [];
          let messagesReceived = 0;
          recipientSocket
            .on("event", (details) => {
              messagesReceived++;
              messages.push(details);
              if (messagesReceived === 2) {
                resolveUserReceivesMessagesPromise(messages);
              }
            })
            .on("connection_established", () => {
              callCreatedDispatchNotificationWhenPromiseResolves("");
            });

          await singleUserPromise;

          dispatchNotification({
            recipient: "player1@mail.com",
            type: "event",
            payload: {
              message: "Hello",
            },
          });

          dispatchNotification({
            recipient: "player1@mail.com",
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
        let recipientSocket: ClientSocket;
        let thirdPartySocket: ClientSocket;

        afterEach(() => {
          thirdPartySocket.removeAllListeners();
          thirdPartySocket.disconnect();
          recipientSocket.removeAllListeners();
          recipientSocket.disconnect();
        });
        it("only sends the message to the intended recipient", async () => {
          const firstUserConnectionPromise = new Promise((resolve) => {
            callCreatedDispatchNotificationWhenPromiseResolves = resolve;
          });
          let userResolver: (value: unknown) => void;
          const createUserResolver = new Promise((resolve) => {
            userResolver = resolve;
          });

          await testFixture.register({
            email: "player1@mail.com",
            password: "password",
          });

          const playerOneLoginResponse = await testFixture.login({
            email: "player1@mail.com",
            password: "password",
          });

          const {
            body: {
              notification: { uri: playerOneUri },
            },
            headers: { authorization: playerOneAuthorization },
          } = playerOneLoginResponse;

          recipientSocket = ioc(playerOneUri, {
            auth: {
              token: playerOneAuthorization.split(" ")[1],
            },
          });

          recipientSocket.connect();
          recipientSocket
            .on("event", (details) => {
              userResolver(details);
            })
            .on("connection_established", () => {
              callCreatedDispatchNotificationWhenPromiseResolves("");
            });

          await firstUserConnectionPromise;

          await testFixture.register({
            email: "thirdParty@mail.com",
            password: "password",
          });

          const thirdPartyLoginResponse = await testFixture.login({
            email: "thirdParty@mail.com",
            password: "password",
          });

          const {
            body: {
              notification: { uri: thirdPartyUri },
            },
            headers: { authorization: thirdPartyAuthorization },
          } = thirdPartyLoginResponse;

          thirdPartySocket = ioc(thirdPartyUri, {
            auth: {
              token: thirdPartyAuthorization.split(" ")[1],
            },
          });

          const secondUserConnectionPromise = new Promise((resolve) => {
            callCreatedDispatchNotificationWhenPromiseResolves = resolve;
          });

          thirdPartySocket.connect();
          thirdPartySocket
            .on("event", () => {
              expect(true).toBeFalsy();
            })
            .on("connection_established", () => {
              callCreatedDispatchNotificationWhenPromiseResolves("");
            });

          await secondUserConnectionPromise;
          dispatchNotification({
            recipient: "player1@mail.com",
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
          player1Socket.removeAllListeners();
          player2Socket.removeAllListeners();
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

          await testFixture.register({
            email: "player1@mail.com",
            password: "password",
          });
          const player1LoginResponse = await testFixture.login({
            email: "player1@mail.com",
            password: "password",
          });
          const {
            body: {
              notification: { uri: player1Uri },
            },
            headers: { authorization: player1Authorization },
          } = player1LoginResponse;

          await testFixture.register({
            email: "player2@mail.com",
            password: "password",
          });
          const player2LoginResponse = await testFixture.login({
            email: "player2@mail.com",
            password: "password",
          });
          const {
            body: {
              notification: { uri: player2Uri },
            },
            headers: { authorization: player2Authorization },
          } = player2LoginResponse;

          player1Socket = ioc(player1Uri, {
            auth: {
              token: player1Authorization.split(" ")[1],
            },
          });
          player2Socket = ioc(player2Uri, {
            auth: {
              token: player2Authorization.split(" ")[1],
            },
          });

          player1Socket.connect();
          player1Socket
            .on("event", (details) => {
              resolvePlayer1ReceivesMessagePromise(details);
            })
            .on("connection_established", () => {
              callCreatedDispatchNotificationWhenPromiseResolves("");
            });

          await firstUserConnectPromise;
          const secondUserConnectionPromise = new Promise((resolve) => {
            callCreatedDispatchNotificationWhenPromiseResolves = resolve;
          });

          player2Socket.connect();
          player2Socket
            .on("event", (details) => {
              resolvePlayer2ReceivesMessagePromise(details);
            })
            .on("connection_established", () => {
              callCreatedDispatchNotificationWhenPromiseResolves("");
            });

          await secondUserConnectionPromise;

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
