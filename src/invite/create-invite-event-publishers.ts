import {
  InviteDetails,
  InviteEvents,
  InviteServiceEventPublishers,
} from "./invite-service-types.d";

const createInviteEventPublishers = (
  eventPublisher: (eventType: string, payload: unknown) => Promise<unknown>
): InviteServiceEventPublishers => {
  return {
    [InviteEvents.INVITATION_CREATED]: (inviteDetails: InviteDetails) =>
      eventPublisher(InviteEvents.INVITATION_CREATED, inviteDetails),
  };
};

export default createInviteEventPublishers;
