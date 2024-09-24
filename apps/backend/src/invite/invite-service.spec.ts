import createInviteEventPublishers from "@/invite/create-invite-event-publishers";
import InMemoryInviteRepository from "@/invite/in-memory-invite-repository";
import InviteService from "@/invite/invite-service";
import { InviteEvents, InviteStatus } from "@/invite/types.d";
import InMemoryUserRepository from "@/user/in-memory-user-repository";
import UserService from "@/user/user-service";
import { InvalidInvitationError } from "./errors";

const createUserServiceWithInviterAndInvitee = async () => {
  const userRepository = new InMemoryUserRepository();
  const userService = new UserService(userRepository);
  const inviterUserDetails = {
    firstName: "Player",
    lastName: "Huan",
    email: "inviter@mail.com",
    password: "password",
  };
  const inviteeUserDetails = {
    firstName: "Player",
    lastName: "Du",
    email: "invitee@mail.com",
    password: "password",
  };
  await Promise.allSettled([
    userService.create(inviterUserDetails),
    userService.create(inviteeUserDetails),
  ]);

  return userService;
};

describe("invite-service", () => {
  const currentTime = Date.now();
  const lengthOfDayInMilliseconds = 1000 * 60 * 60 * 24;
  let userService: UserService;
  let inviteRepository: InMemoryInviteRepository;
  let inviteService: InviteService;

  beforeEach(async () => {
    jest.useFakeTimers({ doNotFake: ["setImmediate"] });
    jest.setSystemTime(currentTime);
    inviteRepository = new InMemoryInviteRepository();
    userService = await createUserServiceWithInviterAndInvitee();
    inviteService = new InviteService(
      userService,
      inviteRepository,
      createInviteEventPublishers(() => Promise.resolve())
    );
  });

  afterEach(() => jest.useRealTimers());
  // TODO: Re structure test cases
  describe("given an inviter who is an existing user", () => {
    describe("and an invitee who is an existing user", () => {
      it("creates an invite", async () => {
        const inviteDetails = await inviteService.create({
          inviter: "inviter@mail.com",
          invitee: "invitee@mail.com",
        });
        expect(inviteDetails).toEqual({
          inviter: "inviter@mail.com",
          invitee: "invitee@mail.com",
          uuid: expect.toBeUuid(),
          exp: currentTime + lengthOfDayInMilliseconds,
          status: "PENDING",
        });
      });
      describe(`and the service was created with an invitation creation callback`, () => {
        it(`calls the callback with the details of the created invitation`, async () => {
          const mockInvitationCreationCallback = jest.fn();
          inviteService = new InviteService(userService, inviteRepository, {
            [InviteEvents.INVITATION_CREATED]: mockInvitationCreationCallback,
          });
          await inviteService.create({
            inviter: "inviter@mail.com",
            invitee: "invitee@mail.com",
          });
          expect(mockInvitationCreationCallback).toHaveBeenCalledWith({
            inviter: "inviter@mail.com",
            invitee: "invitee@mail.com",
            exp: expect.any(Number),
            status: "PENDING",
            uuid: expect.toBeUuid(),
          });
        });
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
          expect(
            await inviteService.getUsersInvites("gerald@mail.com")
          ).toEqual([
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
  describe(`accepting an invite`, () => {
    describe(`given a pending invite`, () => {
      it(`accepts the invite`, async () => {
        const inviteUuid = await inviteService.create({
          inviter: "inviter@mail.com",
          invitee: "invitee@mail.com",
        });
        expect(await inviteService.getUsersInvites("invitee@mail.com")).toEqual(
          [
            {
              invitee: "invitee@mail.com",
              inviter: "inviter@mail.com",
              exp: expect.any(Number),
              status: "PENDING",
              uuid: expect.toBeUuid(),
            },
          ]
        );
      });
    });
  });
});
