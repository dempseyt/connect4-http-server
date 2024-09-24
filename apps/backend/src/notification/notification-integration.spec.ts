import appFactory from "@/app";
import { ExpressWithPortAndSocket } from "@/create-socket-server";
import TestFixture from "@/testing/test-fixture";
import http from "http";
import { generateKeyPair } from "jose";
import { AddressInfo } from "net";
import { io as ioc, Socket } from "socket.io-client";
import createDispatchNotification from "./create-dispatch-notification";

describe("notification-integration", () => {
  let app: ExpressWithPortAndSocket;
  let testFixture: TestFixture;
  let clientSocket: Socket;
  let dispatchNotification;

  beforeEach(async () => {
    const httpServer = http.createServer().listen();
    const port = (httpServer.address() as AddressInfo).port;
    const authority = `localhost:${port}`;
    const jwtKeyPair = await generateKeyPair("RS256");
    app = appFactory({
      stage: "test",
      keySet: {
        jwtPrivateKey: jwtKeyPair.privateKey,
        jwtPublicKey: jwtKeyPair.publicKey,
      },
      internalEventPublisher: () => Promise.resolve(),
    });
    testFixture = new TestFixture(app);
    dispatchNotification = createDispatchNotification(app.server);
  });

  afterEach(() => {
    clientSocket.disconnect();
    clientSocket.close();
  });

  describe("given the user exists and is logged in", () => {
    describe("when the user connects to the notification endpoint", () => {
      it("the connection succeeds", async () => {
        expect.assertions(1);
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

        clientSocket = ioc(uri, {
          auth: {
            token: authorization.split(" ")[1],
          },
        });

        let resolvePromiseWhenSocketConnects: (value: unknown) => void;
        const promiseToResolveWhenSocketConnects = new Promise((resolve) => {
          resolvePromiseWhenSocketConnects = resolve;
        });

        clientSocket.on("connect", () => {
          resolvePromiseWhenSocketConnects("Success!");
        });

        clientSocket.connect();

        return expect(promiseToResolveWhenSocketConnects).resolves.toBe(
          "Success!"
        );
      });
    });
    describe(`and they are connected to the notification endpoint`, () => {
      describe(`when a notification is dispatched to the user`, () => {
        it(`they receive the notification`, async () => {
          expect.assertions(1);

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

          clientSocket = ioc(uri, {
            auth: {
              token: authorization.split(" ")[1],
            },
          });

          let resolvePromiseWhenSocketReceivesEvent;
          const promiseToBeResolvedWhenSocketReceivesEvent = new Promise(
            (resolve) => {
              resolvePromiseWhenSocketReceivesEvent = resolve;
            }
          );

          let resolvePromiseWhenSocketConnects;
          const promiseToBeResolvedWhenSocketConnects = new Promise(
            (resolve) => {
              resolvePromiseWhenSocketConnects = resolve;
            }
          );

          clientSocket
            .on("connection_established", () => {
              resolvePromiseWhenSocketConnects();
            })
            .on("example_event", (payload) => {
              resolvePromiseWhenSocketReceivesEvent(payload);
            });

          await promiseToBeResolvedWhenSocketConnects;

          dispatchNotification({
            recipient: "player1@mail.com",
            type: "example_event",
            payload: {
              someData: "Good Job",
            },
          });

          return expect(
            promiseToBeResolvedWhenSocketReceivesEvent
          ).resolves.toEqual({
            someData: "Good Job",
          });
        });
      });
    });
  });
});
