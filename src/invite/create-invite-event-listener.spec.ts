import { Subject } from "rxjs";
import createInviteEventListener, {
  InviteCreatedEvent,
} from "./create-invite-event-listener";
import { InviteEvents, InviteStatus } from "./invite-service-types.d";

describe(`create-invite-event-listener`, () => {
  describe(`given a event subscription`, () => {
    describe(`and an invite notification function`, () => {
      describe(`when an invite is sent`, () => {
        it(`notifies the invitee`, () => {
          const notificationFn = jest.fn();
          const subscription = new Subject<InviteCreatedEvent>();
          const inviteEventListener = createInviteEventListener(
            subscription,
            notificationFn
          );

          subscription.next({
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
            payload: {
              inviter: "john@mail.com",
              invitee: "gerald@mail.com",
              exp: expect.any(Number),
              // @ts-ignore
              uuid: expect.toBeUuid(),
              status: InviteStatus.PENDING,
            },
          });
        });
      });
    });
  });
});
