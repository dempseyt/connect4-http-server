import appFactory from "@/app";
import { Uuid } from "@/global.d";
import { InviteStatus } from "@/invite/types.d";
import TestFixture from "@/testing/test-fixture";
import { Express } from "express";
import halson from "halson";
import { generateKeyPair, GenerateKeyPairResult, KeyLike } from "jose";
import request from "supertest";

describe("invite-integration", () => {
  let app: Express;
  let jwtKeyPair: GenerateKeyPairResult<KeyLike>;
  let testFixture: TestFixture;
  let inviteUuid: Uuid;

  beforeAll(async () => {
    jwtKeyPair = await generateKeyPair("RS256");
  });

  beforeEach(async () => {
    app = appFactory({
      stage: "test",
      keySet: {
        jwtPublicKey: jwtKeyPair.publicKey,
        jwtPrivateKey: jwtKeyPair.privateKey,
      },
      internalEventPublisher: () => Promise.resolve(),
    });
    testFixture = new TestFixture(app);
  });

  describe("creating an invite", () => {
    describe("given the inviter is not logged in", () => {
      describe("when the inviter sends an invitation", () => {
        it("returns http status code 401", async () => {
          const inviteDetails = {
            inviter: "john@mail.com",
            invitee: "gerald@mail.com",
          };
          const response = await request(app)
            .post("/invite")
            .send(inviteDetails);
          expect(response.statusCode).toBe(401);
          expect(response.body.errors).toEqual([
            "You must be logged in to send an invite",
          ]);
        });
      });
    });

    describe("given an inviter that is an existing user", () => {
      describe("and an invitee that is an existing user", () => {
        describe("when the inviter sends an invite to the invitee", () => {
          it("creates an invitation", async () => {
            jest.useFakeTimers({ doNotFake: ["setImmediate"] });
            const currentTime = Date.now();
            jest.setSystemTime(currentTime);

            const inviterUserDetails = {
              firstName: "John",
              lastName: "Berry",
              email: "john@mail.com",
              password: "password",
            };
            const inviteeUserDetails = {
              firstName: "Gerald",
              lastName: "Butterscotch",
              email: "gerald@mail.com",
              password: "password",
            };
            await request(app).post("/user/register").send(inviterUserDetails);
            await request(app).post("/user/register").send(inviteeUserDetails);
            const inviterUserCredentials = {
              userName: "john@mail.com",
              password: "password",
            };
            const loginResponse = await request(app)
              .post("/user/login")
              .send(inviterUserCredentials);

            const response = await request(app)
              .post("/invite")
              .set("Authorization", loginResponse.headers.authorization)
              .send({
                inviter: "john@mail.com",
                invitee: "gerald@mail.com",
              });
            const lengthOfDayInMilliseconds = 1000 * 60 * 60 * 24;
            expect(response.statusCode).toBe(201);
            expect(response.body.invite).toEqual({
              uuid: expect.toBeUuid(),
              inviter: "john@mail.com",
              invitee: "gerald@mail.com",
              exp: currentTime + lengthOfDayInMilliseconds,
            });
            jest.useRealTimers();
          });
        });
        describe("when a different user sends an invite on behalf of the inviter", () => {
          it("returns http status code 403", async () => {
            const inviterUserDetails = {
              firstName: "Sam",
              lastName: "Bigfoot",
              email: "sam@mail.com",
              password: "password",
            };
            const inviteeUserDetails = {
              firstName: "John",
              lastName: "Doe",
              email: "john@mail.com",
              password: "password",
            };
            await request(app).post("/user/register").send(inviterUserDetails);
            await request(app).post("/user/register").send(inviteeUserDetails);
            const userDetails = {
              firstName: "Gerald",
              lastName: "Fitzgerald",
              email: "gerald@mail.com",
              password: "password",
            };
            const userCredentials = {
              userName: "gerald@mail.com",
              password: "password",
            };
            await request(app).post("/user/register").send(userDetails);
            const loginResponse = await request(app)
              .post("/user/login")
              .send(userCredentials);
            const inviteDetails = {
              inviter: "sam@mail.com",
              invitee: "john@mail.com",
            };
            const response = await request(app)
              .post("/invite")
              .set("Authorization", loginResponse.headers.authorization)
              .send(inviteDetails);
            expect(response.statusCode).toBe(403);
            expect(response.body.errors).toEqual([
              "You must be the authorized user to send an invitation",
            ]);
          });
        });
      });
      describe("when the inviter sends an invite to their self", () => {
        it("responds with http status code 403", async () => {
          const userDetails = {
            firstName: "John",
            lastName: "Doe",
            email: "john@mail.com",
            password: "password",
          };
          const userCredentials = {
            userName: "john@mail.com",
            password: "password",
          };
          await request(app).post("/user/register").send(userDetails);
          const loginResponse = await request(app)
            .post("/user/login")
            .send(userCredentials);
          const inviteDetails = {
            inviter: "john@mail.com",
            invitee: "john@mail.com",
          };
          const response = await request(app)
            .post("/invite")
            .set("Authorization", loginResponse.headers.authorization)
            .send(inviteDetails);
          expect(response.statusCode).toBe(403);
          expect(response.body.errors).toEqual([
            "Users cannot send invites to themselves",
          ]);
        });
      });
      describe("and an invitee that is not an existing user", () => {
        describe("when the inviter sends an invite to the invitee", () => {
          it("responds with http status code 403", async () => {
            const userDetails = {
              firstName: "John",
              lastName: "Doe",
              email: "john@mail.com",
              password: "password",
            };
            const userCredentials = {
              userName: "john@mail.com",
              password: "password",
            };
            const inviteDetails = {
              inviter: "john@mail.com",
              invitee: "gerald@mail.com",
            };
            await request(app).post("/user/register").send(userDetails);
            const loginResponse = await request(app)
              .post("/user/login")
              .send(userCredentials);

            const response = await request(app)
              .post("/invite")
              .set("Authorization", loginResponse.header.authorization)
              .send(inviteDetails);
            expect(response.statusCode).toBe(403);
            expect(response.body.errors).toEqual([
              "Invitation could not be sent",
            ]);
          });
        });
      });
    });
  });

  describe("retrieving received invites", () => {
    describe("given an invite exists", () => {
      describe("and a user is logged in as the invitee", () => {
        describe("when the user retrieves their received invites", () => {
          it("their invite will be retrieved", async () => {
            jest.useFakeTimers({ doNotFake: ["setImmediate"] });
            const currentTime = Date.now();
            jest.setSystemTime(currentTime);
            const lengthOfDayInMilliseconds = 1000 * 60 * 60 * 24;
            await Promise.allSettled([
              await request(app).post("/user/register").send({
                firstName: "John",
                lastName: "Doe",
                email: "john@mail.com",
                password: "password",
              }),
              await request(app).post("/user/register").send({
                firstName: "Gerald",
                lastName: "Longbottom",
                email: "gerald@mail.com",
                password: "password",
              }),
            ]);
            const inviterUserCredentials = {
              userName: "john@mail.com",
              password: "password",
            };
            const inviterLoginResponse = await request(app)
              .post("/user/login")
              .send(inviterUserCredentials);

            await request(app)
              .post("/invite")
              .set("Authorization", inviterLoginResponse.headers.authorization)
              .send({
                inviter: "john@mail.com",
                invitee: "gerald@mail.com",
              });

            const inviteeUserCredentials = {
              userName: "gerald@mail.com",
              password: "password",
            };

            const inviteeLoginResponse = await request(app)
              .post("/user/login")
              .send(inviteeUserCredentials);

            const response = await request(app)
              .get("/invite/inbox")
              .set("Authorization", inviteeLoginResponse.headers.authorization)
              .send();

            expect(response.statusCode).toBe(200);
            expect(response.body.invites).toEqual([
              {
                uuid: expect.toBeUuid(),
                inviter: "john@mail.com",
                invitee: "gerald@mail.com",
                exp: currentTime + lengthOfDayInMilliseconds,
                status: InviteStatus.PENDING,
                _links: {
                  accept: {
                    href: expect.stringContaining("accept"),
                    method: "POST",
                  },
                  decline: {
                    href: expect.stringContaining("decline"),
                    method: "POST",
                  },
                },
              },
            ]);
            jest.useRealTimers();
          });
        });
      });
    });
  });
  describe(`accepting an invite`, () => {
    describe(`given a user is logged in`, () => {
      describe(`and they have received a pending invite`, () => {
        beforeEach(async () => {
          await testFixture.register({
            email: "inviter@mail.com",
            password: "password",
          });
          await testFixture.register({
            email: "invitee@mail.com",
            password: "password",
          });

          const inviterToken = (
            await testFixture.login({
              email: "inviter@mail.com",
              password: "password",
            })
          ).headers.authorization;

          const inviteResponse = await testFixture.sendInvite({
            inviter: "inviter@mail.com",
            invitee: "invitee@mail.com",
            authorization: inviterToken,
          });
          inviteUuid = inviteResponse.body.invite.uuid;
        });
        describe(`when the invite is accepted`, () => {
          // TODO: I need to make sure this is working correctly
          it.skip(`accepts the invite and creates a new session`, async () => {
            const inviteeToken = (
              await testFixture.login({
                email: "invitee@mail.com",
                password: "password",
              })
            ).headers.authorization;

            const inviteReceivedResponse = await request(app)
              .get("/invite/inbox")
              .set("Authorization", inviteeToken)
              .send();

            const inviteAcceptLink =
              inviteReceivedResponse.body.invites[0]._links.accept.href;

            const response = await request(app)
              .post(inviteAcceptLink)
              .set("Authorization", inviteeToken)
              .send({});
            console.log("response", response.body);
            expect(response.body).toEqual({
              _links: {
                self: { href: `/invite/${inviteUuid}/accept` },
                related: [
                  {
                    href: expect.stringMatching(
                      new RegExp(
                        `^/session/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}`,
                      ),
                    ),
                  },
                ],
              },
            });
            const resource = halson(response.body);
            const inviteUri = resource.getLink("self", {
              href: "",
            }).href;
            const inviteResponse = await request(app)
              .get(inviteUri)
              .send({})
              .set("Authorization", inviteeToken);

            expect(inviteResponse.body.invite).toEqual({
              inviter: "inviter@mail.com",
              invitee: "invitee@mail.com",
              uuid: inviteUuid,
              exp: expect.any(Number),
              status: InviteStatus.ACCEPTED,
            });

            const sessionUri = resource.getLink("related", {
              href: "",
            }).href;
            const sessionResponse = await request(app)
              .get(sessionUri)
              .send({})
              .set("Authorization", inviteeToken);

            expect(sessionResponse.statusCode).toBe(200);
          });
        });
      });
    });
  });
});
