import InMemoryUserRepository from "../user/in-memory-user-repository";
import UserService from "../user/user-service";
import InMemoryInviteRepository from "./in-memory-invite-repository";
import InviteService, { InvalidInvitationError } from "./invite-service";
import { InviteStatus } from "./invite-service-types";

describe("invite-service", () => {
  let userService;
  let inviteService;
  beforeEach(() => {
    const userRepository = new InMemoryUserRepository();
    userService = new UserService(userRepository);
    const inviteRepository = new InMemoryInviteRepository();
    inviteService = new InviteService(userService, inviteRepository);
  });
  describe("given an inviter who is an existing user", () => {
    describe("and an invitee who is an existing user", () => {
      it("creates an invite", async () => {
        jest.useFakeTimers({ doNotFake: ["setImmediate"] });
        const currentTime = Date.now();
        jest.setSystemTime(currentTime);
        await userService.create({
          firstName: "John",
          lastName: "Doe",
          email: "john@mail.com",
          password: "password",
        });
        await userService.create({
          firstName: "Gerald",
          lastName: "Longbottom",
          email: "gerald@mail.com",
          password: "password",
        });
        const inviteDetails = await inviteService.create({
          inviter: "john@mail.com",
          invitee: "gerald@mail.com",
        });
        const lengthOfDayInMilliseconds = 1000 * 60 * 60 * 24;
        expect(inviteDetails).toEqual({
          inviter: "john@mail.com",
          invitee: "gerald@mail.com",
          // @ts-ignore
          uuid: expect.toBeUuid(),
          exp: currentTime + lengthOfDayInMilliseconds,
          status: "PENDING",
        });
        jest.useRealTimers();
      });
      describe("and the inviter and invitee are the same user", () => {
        it("throws an 'Invalid invitation' error", async () => {
          await userService.create({
            firstName: "John",
            lastName: "Doe",
            email: "john@mail.com",
            password: "password",
          });
          const inviteDetails = {
            inviter: "john@mail.com",
            invitee: "john@mail.com",
          };
          expect(inviteService.create(inviteDetails)).rejects.toThrow(
            new InvalidInvitationError(
              "Users cannot send invites to themselves"
            )
          );
        });
      });
      describe("when the invitee retrieves their invite", () => {
        it("provides invitation details", async () => {
          jest.useFakeTimers();
          const currentTime = Date.now();
          jest.setSystemTime(currentTime);
          await userService.create({
            firstName: "Gerald",
            lastName: "Longbottom",
            email: "gerald@mail.com",
            password: "password",
          });
          await userService.create({
            firstName: "John",
            lastName: "Doe",
            email: "john@mail.com",
            password: "password",
          });
          const inviteDetails = {
            inviter: "john@mail.com",
            invitee: "gerald@mail.com",
          };
          await inviteService.create(inviteDetails);
          const lengthOfDayInMilliseconds = 1000 * 60 * 60 * 24;
          expect(inviteService.getUsersInvites("gerald@mail.com")).toEqual({
            //@ts-ignore
            uuid: expect.toBeUuid(),
            inviter: "john@mail.com",
            invitee: "gerald@mail.com",
            exp: currentTime + lengthOfDayInMilliseconds,
            status: InviteStatus.PENDING,
          });
          jest.useRealTimers();
        });
      });
    });
    describe("and an invitee who is not an existing user", () => {
      it("throws an 'Invalid invitation' error", async () => {
        await userService.create({
          firstName: "John",
          lastName: "Doe",
          email: "john@mail.com",
          password: "password",
        });
        const inviteDetails = {
          inviter: "john@mail.com",
          invitee: "gerald@mail.com",
        };
        expect(inviteService.create(inviteDetails)).rejects.toThrow(
          new InvalidInvitationError("Invitee does not exist")
        );
      });
    });
  });
});
