import appFactory from "@/app";
import TestFixture from "@/testing/test-fixture";
import { Express } from "express";
import { generateKeyPair } from "jose";
import { io as ioc } from "socket.io-client";

describe("notification-integration", () => {
  let app: Express;
  let testFixture: TestFixture;

  beforeEach(async () => {
    const jwtKeyPair = await generateKeyPair("RS256");
    app = appFactory({
      routerParameters: {
        stage: "test",
        keySet: {
          jwtPrivateKey: jwtKeyPair.privateKey,
          jwtPublicKey: jwtKeyPair.publicKey,
        },
        publishEvent: () => Promise.resolve(),
      },
    });
    testFixture = new TestFixture(app);
  });
  describe("given the user exists and is logged in", () => {
    describe("when the user connects to the notification endpoint", () => {
      it("the connection succeeds", async () => {
        const playerOneAuth = await testFixture.registerAndLogin(
          "player1@mail.com",
          "password"
        );

        const notificationSocket = ioc(`/notification`, {
          auth: {
            token: playerOneAuth.split(" ")[1],
          },
        });

        notificationSocket.connect();
        expect(notificationSocket.connected).toBe(true);
      });
    });
  });
});
