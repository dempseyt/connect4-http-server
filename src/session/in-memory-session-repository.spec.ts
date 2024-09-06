import InMemorySessionRepository from "@/session/in-memory-session-repository";
import { SessionCreationDetails } from "@/session/session-service.d";

describe("in-memory-session-repository", () => {
  const inMemorySessionRepository = new InMemorySessionRepository();
  describe("given details about a session", () => {
    it("creates the session", async () => {
      const sessionDetails: SessionCreationDetails = {
        inviterUuid: "e4e363be-7418-463b-ad5b-21b97a7862d3",
        inviteeUuid: "7d9bdeb5-a159-4b61-ad42-948d73ff5574",
      };

      const createdSession = inMemorySessionRepository.create(sessionDetails);
      expect(createdSession).resolves.toEqual(
        expect.objectContaining({
          inviter: expect.objectContaining({
            uuid: "e4e363be-7418-463b-ad5b-21b97a7862d3",
          }),
          invitee: expect.objectContaining({
            uuid: "7d9bdeb5-a159-4b61-ad42-948d73ff5574",
          }),
        })
      );
    });
  });
  describe("given a session has been created", () => {
    describe(`when provided with the session id`, () => {
      it(`returns the session`, async () => {
        const sessionCreationDetails: SessionCreationDetails = {
          inviterUuid: "3e8dd93f-464b-478d-aa1d-11e8dabfbee7",
          inviteeUuid: "2326d9a1-39b1-40ce-a87f-1ee1c230e0c8",
        };
        const sessionUuid = (
          await inMemorySessionRepository.create(sessionCreationDetails)
        ).uuid;
        const retrievedSession =
          inMemorySessionRepository.getSession(sessionUuid);
        expect(retrievedSession).resolves.toEqual(
          expect.objectContaining({
            uuid: expect.toBeUuid(),
            inviter: expect.objectContaining({
              uuid: "3e8dd93f-464b-478d-aa1d-11e8dabfbee7",
            }),
            invitee: expect.objectContaining({
              uuid: "2326d9a1-39b1-40ce-a87f-1ee1c230e0c8",
            }),
          })
        );
      });
    });
  });
});
