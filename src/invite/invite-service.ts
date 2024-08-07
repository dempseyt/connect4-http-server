import UserService from "../user/user-service";
import { InviteRepository, PersistedInvite } from "./invite-repository";
import {
  CreateInviteDetails,
  InviteDetails,
  InviteStatus,
} from "./invite-service-types.d";

interface InviteServiceInterface {
  create: (createInviteDetails: CreateInviteDetails) => Promise<InviteDetails>;
  getUsersInvites: (userEmail: string) => Promise<PersistedInvite[]>;
}

export class InvalidInvitationError extends Error {}

const lengthOfDayInMilliseconds = 1000 * 60 * 60 * 24;

class InviteService implements InviteServiceInterface {
  private userService: UserService;
  private inviteRepository: InviteRepository;

  constructor(userService: UserService, inviteRepository: InviteRepository) {
    this.userService = userService;
    this.inviteRepository = inviteRepository;
  }

  async create({ inviter, invitee }: CreateInviteDetails) {
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

    const uuid = crypto.randomUUID();
    const exp = Date.now() + lengthOfDayInMilliseconds;

    this.inviteRepository.create({
      inviter: inviter,
      invitee: invitee,
      exp: exp,
    });

    return {
      uuid,
      exp,
      inviter,
      invitee,
      status: InviteStatus.PENDING,
    };
  }

  async getUsersInvites(userEmail: string) {
    return await this.inviteRepository.getUsersInvites(userEmail);
  }
}

export default InviteService;
