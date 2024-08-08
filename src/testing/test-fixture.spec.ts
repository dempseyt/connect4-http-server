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
          userName: "john@mail.com",
          password: "password",
        };
        const loginResponse = await testFixture.login(userCredentials);
        const inviteDetails = {
          inviter: "john@mail.com",
          invitee: "gerald@mail.com",
          authorization: loginResponse.header.authorization,
        };
        const inviteResponse = await testFixture.invite(inviteDetails);
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
          userName: "john@mail.com",
          password: "password",
        });
        await testFixture.invite({
          inviter: "john@mail.com",
          invitee: "gerald@mail.com",
          authorization: inviterLoginResponse.header.authorization,
        });
        const inviteeLoginResponse = await testFixture.login({
          userName: "gerald@mail.com",
          password: "password",
        });
        const response = await testFixture.inbox({
          email: "gerald@mail.com",
          authorization: inviteeLoginResponse.header.authorization,
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            inviter: "john@mail.com",
            invitee: "gerald@mail.com",
          })
        );
      });
    });
  });
});
