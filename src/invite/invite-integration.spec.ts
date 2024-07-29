import { generateKeyPair } from "jose";
import request from "supertest";
import appFactory from "../app";

describe("invite-integration", () => {
  describe("given an inviter that is an existing user", () => {
    describe("and an invitee that is an existing user", () => {
      describe("when the inviter sends an invite to the invitee", () => {
        it("creates an invitation", async () => {
          jest.useFakeTimers({ doNotFake: ["setImmediate"] });
          const currentTime = Date.now();
          jest.setSystemTime(currentTime);
          const app = appFactory({
            routerParameters: {
              stage: "test",
              keySet: await generateKeyPair("RS256"),
            },
          });
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
          await request(app).post("/register").send(inviterUserDetails);
          await request(app).post("/register").send(inviteeUserDetails);
          const inviterUserCredentials = {
            userName: "john@mail.com",
            password: "password",
          };
          await request(app).post("/login").send(inviterUserCredentials);

          const response = await request(app).post("/invite").send({
            invitee: "player2@mail.com",
          });
          const lengthOfDayInMilliseconds = 1000 * 60 * 60 * 24;
          expect(response.statusCode).toBe(201);
          expect(response.body.invite).toEqual({
            uuid: expect.toBeUuid(),
            inviter: "john@mail.com",
            invitee: "gerald@mail.com",
            exp: currentTime + lengthOfDayInMilliseconds,
          });
        });
      });
    });
  });
});
