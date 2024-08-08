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
        const registerResponse = testFixture.register(userDetails);
        // expect(response.statusCode).toBe(201);
        expect(registerResponse.body).toEqual(
          expect.objectContaining({
            firstName: "John",
            lastName: "Doe",
            email: "johndoe@x.com",
            // @ts-ignore
            uuid: expect.toBeUuid(),
          })
        );
        expect(registerResponse.headers["content-type"]).toMatch(/json/);
      });
    });
  });
});
