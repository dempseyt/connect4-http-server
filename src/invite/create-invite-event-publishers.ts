import {
  InviteDetails,
  InviteEvents,
  InviteServiceEventPublishers,
} from "@/invite/types.d";
import { InviteCreatedEvent } from "./create-invite-event-listener";

const createInviteEventPublishers = (
  eventPublisher: (eventDetails: InviteCreatedEvent) => Promise<unknown>
): InviteServiceEventPublishers => {
  return {
    [InviteEvents.INVITATION_CREATED]: (inviteDetails: InviteDetails) =>
      eventPublisher({
        recipient: inviteDetails.invitee,
        type: InviteEvents.INVITATION_CREATED,
        payload: inviteDetails,
      }),
  };
};

export default createInviteEventPublishers;
