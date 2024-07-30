import InMemoryUserRepository from "../user/in-memory-user-repository";
import UserService from "../user/user-service";
import InMemoryInviteRepository from "./in-memory-invite-repository";
import InviteService from "./invite-service";

describe("invite-service", () => {
  describe("given an inviter who is an existing user", () => {
    describe("and an invitee who is an existing user", () => {
      it("creates an invite", async () => {
        jest.useFakeTimers({ doNotFake: ["setImmediate"] });
        const currentTime = Date.now();
        jest.setSystemTime(currentTime);
        const userRepository = new InMemoryUserRepository();
        const userService = new UserService(userRepository);
        const inviteRepository = new InMemoryInviteRepository();
        const inviteService = new InviteService(userService, inviteRepository);

        const inviteDetails = inviteService.create({
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
    });
  });
});
