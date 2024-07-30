import UserService from "../user/user-service";
import { InviteRepository } from "./invite-repository";
import {
  CreateInviteDetails,
  InviteDetails,
  InviteStatus,
} from "./invite-service-types.d";

interface InviteServiceInterface {
  create: (createInviteDetails: CreateInviteDetails) => InviteDetails;
}

const lengthOfDayInMilliseconds = 1000 * 60 * 60 * 24;

class InviteService implements InviteServiceInterface {
  private userService: UserService;
  private inviteRepository: InviteRepository;

  constructor(userService: UserService, inviteRepository: InviteRepository) {
    this.userService = userService;
    this.inviteRepository = inviteRepository;
  }

  create({ inviter, invitee }: CreateInviteDetails) {
    const uuid = crypto.randomUUID();
    const exp = Date.now() + lengthOfDayInMilliseconds;

    return {
      uuid,
      exp,
      inviter,
      invitee,
      status: InviteStatus.PENDING,
    };
  }
}

export default InviteService;
