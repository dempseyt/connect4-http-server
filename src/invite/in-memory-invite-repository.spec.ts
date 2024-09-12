import InMemoryInviteRepository from "@/invite/in-memory-invite-repository";
import { InviteStatus } from "@/invite/types.d";

const lengthOfDayInMilliseconds = 1000 * 60 * 60 * 24;

describe("in-memory-invite-repository", () => {
  describe("given defaults of an invite", () => {
    it("creates the invite", async () => {
      jest.useFakeTimers({ doNotFake: ["setImmediate"] });
      const currentTime = Date.now();
      jest.setSystemTime(currentTime);

      const inMemoryInviteRepository = new InMemoryInviteRepository();
      const expiration = currentTime + lengthOfDayInMilliseconds;
      const inviteDetails = {
        inviter: "john@mail.com",
        invitee: "gerald@mail.com",
        exp: expiration,
      };
      const createdInvite = await inMemoryInviteRepository.create(
        inviteDetails
      );

      expect(createdInvite).toEqual({
        inviter: "john@mail.com",
        invitee: "gerald@mail.com",
        exp: expiration,
        uuid: expect.toBeUuid(),
        status: "PENDING",
      });
      jest.useRealTimers();
    });
  });
  describe("given an existing user email", () => {
    it("retrieves the invites for that user", async () => {
      jest.useFakeTimers();
      const currentTime = Date.now();
      jest.setSystemTime();
      const inviteRepository = new InMemoryInviteRepository();

      inviteRepository.create({
        inviter: "john@mail.com",
        invitee: "gerald@mail.com",
        exp: currentTime + lengthOfDayInMilliseconds,
      });
      inviteRepository.create({
        inviter: "john@mail.com",
        invitee: "sarah@mail.com",
        exp: currentTime + lengthOfDayInMilliseconds,
      });
      const invites = await inviteRepository.getUsersInvites("gerald@mail.com");
      expect(invites).toEqual([
        {
          uuid: expect.toBeUuid(),
          inviter: "john@mail.com",
          invitee: "gerald@mail.com",
          exp: currentTime + lengthOfDayInMilliseconds,
          status: InviteStatus.PENDING,
        },
      ]);
      jest.useRealTimers();
    });
  });
});
