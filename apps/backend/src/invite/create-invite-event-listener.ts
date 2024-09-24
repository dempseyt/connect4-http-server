import { InviteDetails, InviteEvents } from "@/invite/types.d";
import { Notification } from "@/notification/types.d";
import { Subject } from "rxjs";

export type InviteCreatedEvent = {
  recipient: string;
  type: InviteEvents.INVITATION_CREATED;
  payload: InviteDetails;
};

const createInviteEventListener = <T extends InviteCreatedEvent>(
  subscription: Subject<T>,
  notificationFn: (notification: Notification) => void
) => {
  subscription.subscribe({
    next: (inviteCreatedEvent: InviteCreatedEvent) => {
      const { type, payload } = inviteCreatedEvent;

      if (type === InviteEvents.INVITATION_CREATED) {
        notificationFn({
          recipient: payload.invitee,
          type: InviteEvents.INVITATION_RECEIVED,
          payload,
        });
      }
    },
  });
};
export default createInviteEventListener;
