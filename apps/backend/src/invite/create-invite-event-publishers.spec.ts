import createInviteEventPublishers from "@/invite/create-invite-event-publishers";
import { InviteEvents } from "@/invite/types.d";

describe("create-invite-event-publishers", () => {
  describe("given an event publisher", () => {
    it("creates an event handler for each invite service event", () => {
      const mockEventPublisher = jest.fn();
      const eventHandlers = createInviteEventPublishers(mockEventPublisher);
      expect(eventHandlers).toEqual({
        [InviteEvents.INVITATION_CREATED]: expect.any(Function),
      });
    });
  });
});
