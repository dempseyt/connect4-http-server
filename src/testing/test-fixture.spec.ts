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
    app = appFactory({
      routerParameters: {
        stage: "test",
        keySet: {
          jwtPublicKey: jwtKeyPair.publicKey,
          jwtPrivateKey: jwtKeyPair.privateKey,
        },
      },
    });
    testFixture = new TestFixture(app);
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
        const userDetails = {
          email: "john@mail.com",
          password: "password",
        };
        await testFixture.register(userDetails);
        const userCredentials = {
          userName: "john@mail.com",
          password: "password",
        };

        const loginResponse = await testFixture.login(userCredentials);
        expect(loginResponse.header.authorization).not.toBeUndefined();
      });
    });
  });
});
