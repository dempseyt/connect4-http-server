import {
  CreateInviteDetails,
  InviteDetails,
  InviteEvents,
  InviteParticipants,
  InviteRepository,
  InviteServiceEventPublishers,
  PersistedInvite,
} from "@/invite/types.d";
import UserService from "@/user/user-service";

interface InviteServiceInterface {
  create: (createInviteDetails: CreateInviteDetails) => Promise<InviteDetails>;
  getUsersInvites: (userEmail: string) => Promise<PersistedInvite[]>;
}

export class InvalidInvitationError extends Error {}

const lengthOfDayInMilliseconds = 1000 * 60 * 60 * 24;

class InviteService implements InviteServiceInterface {
  private userService: UserService;
  private inviteRepository: InviteRepository;
  private eventPublishers: InviteServiceEventPublishers;

  constructor(
    userService: UserService,
    inviteRepository: InviteRepository,
    eventPublishers: InviteServiceEventPublishers
  ) {
    this.userService = userService;
    this.inviteRepository = inviteRepository;
    this.eventPublishers = eventPublishers;
  }

  async create({ inviter, invitee }: InviteParticipants) {
    if (inviter === invitee) {
      throw new InvalidInvitationError(
        "Users cannot send invites to themselves"
      );
    }

    const doesInviteeNotExist = !(await this.userService.getDoesUserExist(
      invitee
    ));

    if (doesInviteeNotExist) {
      throw new InvalidInvitationError("Invitee does not exist");
    }

    const exp = Date.now() + lengthOfDayInMilliseconds;

    const inviteDetails = this.inviteRepository.create({
      inviter: inviter,
      invitee: invitee,
      exp: exp,
    });
    await this.eventPublishers[InviteEvents.INVITATION_CREATED](inviteDetails);

    return inviteDetails;
  }

  async getUsersInvites(userEmail: string) {
    return await this.inviteRepository.getUsersInvites(userEmail);
  }
}

export default InviteService;
