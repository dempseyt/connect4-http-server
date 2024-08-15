import { Subject } from "rxjs";
import { InviteDetails, InviteEvents } from "./invite-service-types.d";

export type InviteCreatedEvent = {
  type: InviteEvents.INVITATION_CREATED;
  payload: InviteDetails;
};

const createInviteEventListener = <T extends InviteCreatedEvent>(
  subscription: Subject<T>,
  notificationFn: (notification: {
    recipient: string;
    payload: object;
  }) => Promise<void>
) => {
  subscription.subscribe({
    next: (inviteCreatedEvent: InviteCreatedEvent) => {
      const { type, payload } = inviteCreatedEvent;
      if (type === InviteEvents.INVITATION_CREATED) {
        notificationFn({ recipient: payload.invitee, payload });
      }
    },
  });
};
export default createInviteEventListener;
