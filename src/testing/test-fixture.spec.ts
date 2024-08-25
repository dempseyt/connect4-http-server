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
        publishEvent: (queue, payload) => Promise.resolve(),
      },
    });
    testFixture = new TestFixture(app);
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
          email: "john@mail.com",
          password: "password",
        };

        const loginResponse = await testFixture.login(userCredentials);
        expect(loginResponse.header.authorization).not.toBeUndefined();
      });
    });
  });
  describe("sending an invite", () => {
    describe(`to an existing user`, () => {
      it(`it successfully sends the invite`, async () => {
        const userDetails = {
          email: "john@mail.com",
          password: "password",
        };
        const recipientDetails = {
          email: "gerald@mail.com",
          password: "password",
        };
        await testFixture.register(userDetails);
        await testFixture.register(recipientDetails);
        const userCredentials = {
          email: "john@mail.com",
          password: "password",
        };
        const loginResponse = await testFixture.login(userCredentials);
        const inviteDetails = {
          inviter: "john@mail.com",
          invitee: "gerald@mail.com",
          authorization: loginResponse.header.authorization,
        };
        const inviteResponse = await testFixture.sendInvite(inviteDetails);
        expect(inviteResponse.statusCode).toBe(201);
        expect(inviteResponse.body.invite).toEqual(
          expect.objectContaining({
            inviter: "john@mail.com",
            invitee: "gerald@mail.com",
          })
        );
      });
    });
  });
  describe(`receives an invite`, () => {
    describe(`given a user is logged in and has been sent one invite`, () => {
      it(`the given user can access their invite`, async () => {
        await testFixture.register({
          email: "john@mail.com",
          password: "password",
        });
        await testFixture.register({
          email: "gerald@mail.com",
          password: "password",
        });
        const inviterLoginResponse = await testFixture.login({
          email: "john@mail.com",
          password: "password",
        });
        await testFixture.sendInvite({
          inviter: "john@mail.com",
          invitee: "gerald@mail.com",
          authorization: inviterLoginResponse.header.authorization,
        });
        const inviteeLoginResponse = await testFixture.login({
          email: "gerald@mail.com",
          password: "password",
        });
        const response = await testFixture.getInvites({
          email: "gerald@mail.com",
          authorization: inviteeLoginResponse.header.authorization,
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.invites.length).toBeGreaterThanOrEqual(1);
      });
    });
  });
  describe(`register and login`, () => {
    it(`returns the authorization token`, async () => {
      const authorizationToken = await testFixture.registerAndLogin(
        "gerald@mail.com",
        "password"
      );
      expect(authorizationToken.slice(0, 5)).toEqual("Basic");
    });
  });
});
