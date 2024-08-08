import { generateKeyPair } from "jose";
import appFactory from "../app";
import TestFixture from "./test-fixture";

describe("test-fixture", () => {
  let app;
  let jwtKeyPair;
  let testFixture;

  beforeAll(async () => {
    jwtKeyPair = await generateKeyPair("RS256");
  });

  beforeEach(async () => {
    testFixture = new TestFixture();
    app = appFactory({
      routerParameters: {
        stage: "test",
        keySet: {
          jwtPublicKey: jwtKeyPair.publicKey,
          jwtPrivateKey: jwtKeyPair.privateKey,
        },
      },
    });
  });

  describe("given defaults", () => {
    it("creates an app", () => {
      const testFixture = new TestFixture();
      expect(testFixture).toBeInstanceOf(TestFixture);
    });
  });
  describe("registering a user", () => {
    describe("when given valid user details", () => {
      it("successfully registers the user", async () => {
        const userDetails = {
          email: "john@mail.com",
          password: "password",
        };
        const registerResponse = await testFixture.register(userDetails);
        expect(registerResponse.body).toEqual(
          expect.objectContaining({
            firstName: "John",
            lastName: "Doe",
            email: "john@mail.com",
            // @ts-ignore
            uuid: expect.toBeUuid(),
          })
        );
        expect(registerResponse.headers["content-type"]).toMatch(/json/);
      });
    });
    describe("when given user details that already exist", () => {
      it(`does not register the user`, async () => {
        const userDetails = {
          email: "john@mail.com",
          password: "password",
        };
        await testFixture.register(userDetails);
        const failedRegisterResponse = await testFixture.register(userDetails);
        expect(failedRegisterResponse.body.errors).toEqual([
          "A user with that email already exists",
        ]);
        expect(failedRegisterResponse.statusCode).toBe(403);
      });
    });
  });
  describe(`logging in`, () => {
    describe(`given user details that exist`, () => {
      it(`successfully logs the user in`, async () => {
        jest.useFakeTimers({
          doNotFake: ["setImmediate"],
        });
        const currentTime = Date.now();
        jest.setSystemTime(currentTime);

        const userDetails = {
          email: "john@mail.com",
          password: "password",
        };
        await testFixture.register(userDetails);
        const userCredentials = {
          email: "john@mail.com",
          password: "password",
        };
        const { protectedHeader, payload } = await testFixture.login(
          userCredentials
        );

        expect(protectedHeader).toEqual({
          alg: "RSA-OAEP-256",
          typ: "JWT",
          enc: "A256GCM",
        });
        const durationOfDayInMilliseconds = 1000 * 24 * 60 * 60;
        const dateTimestampInSeconds = Math.trunc(currentTime / 1000);
        expect(payload).toEqual({
          iss: "connect4-http-server",
          iat: dateTimestampInSeconds,
          exp: dateTimestampInSeconds + durationOfDayInMilliseconds,
          sub: "dung.eater@gmail.com",
          nbf: dateTimestampInSeconds,
          username: "dung.eater@gmail.com",
          roles: [],
        });
        jest.useRealTimers();
      });
    });
  });
});
