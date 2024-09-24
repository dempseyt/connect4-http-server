import InMemorySessionRepository from "@/session/in-memory-session-repository";
import { SessionCreationDetails } from "@/session/types.d";

describe("in-memory-session-repository", () => {
  const inMemorySessionRepository = new InMemorySessionRepository();

  describe("given details about a session", () => {
    it("creates the session", async () => {
      const sessionCreationDetails: SessionCreationDetails = {
        inviterUuid: "e4e363be-7418-463b-ad5b-21b97a7862d3",
        inviteeUuid: "7d9bdeb5-a159-4b61-ad42-948d73ff5574",
      };

      const createdSession = await inMemorySessionRepository.create(
        sessionCreationDetails
      );
      expect(createdSession).toEqual({
        uuid: expect.toBeUuid(),
        inviter: {
          uuid: "e4e363be-7418-463b-ad5b-21b97a7862d3",
        },
        invitee: {
          uuid: "7d9bdeb5-a159-4b61-ad42-948d73ff5574",
        },
        status: "IN_PROGRESS",
        games: [],
      });
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

        const retrievedSession = await inMemorySessionRepository.getSession(
          sessionUuid
        );

        expect(retrievedSession).toEqual(
          expect.objectContaining({
            uuid: sessionUuid,
            inviter: expect.objectContaining({
              uuid: "3e8dd93f-464b-478d-aa1d-11e8dabfbee7",
            }),
            invitee: expect.objectContaining({
              uuid: "2326d9a1-39b1-40ce-a87f-1ee1c230e0c8",
            }),
            status: "IN_PROGRESS",
            games: [],
          })
        );
      });
    });
  });
  describe(`updating session details`, () => {
    describe(`given the id of an existing session`, () => {
      describe(`and the uuid of a game to add to the session`, () => {
        it(`adds the game to the session's details`, async () => {
          const gameUuid = "3e3029fd-2a99-4fad-853d-13c7882be3bd";
          const inviteeUuid = "1d3bed08-325e-439d-ae32-c9bc95384e14";
          const inviterUuid = "4735e49b-223d-4081-aea9-ee92ab0e6364";
          const { uuid: sessionUuid } = await inMemorySessionRepository.create({
            inviteeUuid,
            inviterUuid,
          });

          await inMemorySessionRepository.addGame(
            sessionUuid,
            gameUuid,
            inviterUuid,
            inviteeUuid
          );
          const sessionDetails = await inMemorySessionRepository.getSession(
            sessionUuid
          );

          expect(sessionDetails.games).toEqual([
            {
              gameUuid,
              playerOneUuid: inviterUuid,
              playerTwoUuid: inviteeUuid,
            },
          ]);
        });
      });
      describe(`and the uuid of a game is set as the active game`, () => {
        it(`sets the session's active game`, async () => {
          const gameUuid = "795a90f9-a803-4990-8e66-f7171c9cccf6";
          const { uuid: sessionUuid } = await inMemorySessionRepository.create({
            inviterUuid: "8397f9f5-48e0-4a6c-8952-db00764dbb09",
            inviteeUuid: "16eb8e30-f588-4809-a4c7-bb7f170d234b",
          });
          await inMemorySessionRepository.setActiveGame(sessionUuid, gameUuid);
          const sessionDetails = await inMemorySessionRepository.getSession(
            sessionUuid
          );
          expect(sessionDetails.activeGameUuid).toEqual(gameUuid);
        });
      });
    });
  });
});
