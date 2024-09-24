import { Uuid } from "@/global";
import {
  InviteEvents,
  InviteParticipants,
  InviteRepository,
  InviteServiceEventPublishers,
  InviteServiceInterface,
} from "@/invite/types.d";
import SessionService from "@/session/session-service";
import UserService from "@/user/user-service";
import { InvalidInvitationError } from "./errors";

const lengthOfDayInMilliseconds = 1000 * 60 * 60 * 24;

class InviteService implements InviteServiceInterface {
  private userService: UserService;
  private inviteRepository: InviteRepository;
  private eventPublishers: InviteServiceEventPublishers;
  private sessionService: SessionService;

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

  async acceptInvite(inviteUuid: Uuid) {
    const inviteDetails = await this.inviteRepository.getInviteDetails(
      inviteUuid
    );
    console.log("inviteDetails", inviteDetails);
    const inviteeUuid = await this.userService.getUserDetails(
      inviteDetails.invitee
    );
    const inviterUuid = await this.userService.getUserDetails(
      inviteDetails.inviter
    );
    console.log("inviterUuid", inviterUuid);
    console.log("inviteeUuid", inviteeUuid);
    const sessionCreationDetails = {
      inviteeUuid: inviteeUuid.uuid,
      inviterUuid: inviterUuid.uuid,
    };
    const sessionDetails = await this.sessionService.createSession(
      sessionCreationDetails
    );

    await this.inviteRepository.deleteInvite(inviteUuid);
    return sessionDetails.uuid;
  }
}

export default InviteService;
