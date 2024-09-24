import { InviteEvents, InviteStatus } from "@/invite/types.d";
import { Subject } from "rxjs";
import createInviteEventListener, {
  InviteCreatedEvent,
} from "./create-invite-event-listener";

describe(`create-invite-event-listener`, () => {
  describe(`given a event subscription`, () => {
    describe(`and an invite notification function`, () => {
      describe(`when an invite is sent`, () => {
        const subscription = new Subject<InviteCreatedEvent>();
        const notificationFn = jest.fn();
        it(`notifies the invitee`, () => {
          createInviteEventListener(subscription, notificationFn);

          subscription.next({
            recipient: "gerald@mail.com",
            type: InviteEvents.INVITATION_CREATED,
            payload: {
              inviter: "john@mail.com",
              invitee: "gerald@mail.com",
              exp: Date.now(),
              uuid: crypto.randomUUID(),
              status: InviteStatus.PENDING,
            },
          });

          expect(notificationFn).toHaveBeenCalledWith({
            recipient: "gerald@mail.com",
            type: InviteEvents.INVITATION_RECEIVED,
            payload: {
              inviter: "john@mail.com",
              invitee: "gerald@mail.com",
              exp: expect.any(Number),
              uuid: expect.toBeUuid(),
              status: InviteStatus.PENDING,
            },
          });
        });
      });
    });
  });
});
