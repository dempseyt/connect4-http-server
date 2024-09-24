import Game from "@/game/game";
import GameService from "@/game/game-service";
import InMemoryGameRepository from "@/game/in-memory-game-repository";
import { Uuid } from "@/global.d";
import {
  ActiveGameInProgressError,
  NoSuchSessionError,
} from "@/session/errors";
import InMemorySessionRepository from "@/session/in-memory-session-repository";
import SessionService from "@/session/session-service";

describe(`session-service`, () => {
  let sessionRepository: InMemorySessionRepository;
  let sessionService: SessionService;

  beforeEach(() => {
    sessionRepository = new InMemorySessionRepository();
    const gameRepository = new InMemoryGameRepository();
    const gameService = new GameService(
      gameRepository,
      (...args: ConstructorParameters<typeof Game>) => new Game(...args)
    );
    sessionService = new SessionService(sessionRepository, gameService);
  });

  describe(`creating a session service`, () => {
    describe(`given a session repository`, () => {
      it(`creates a session service`, () => {
        expect(sessionService).toBeInstanceOf(SessionService);
      });
    });
  });
  describe(`creating a session`, () => {
    describe(`given the identities of two players`, () => {
      it(`creates a session`, () => {
        const sessionDetails = sessionService.createSession({
          inviterUuid: "81a7e5d8-52bd-4288-b524-0eb3a1661a70",
          inviteeUuid: "df8e25c8-7374-415d-b3ca-e3b80c2d7f3c",
        });
        expect(sessionDetails).resolves.toEqual(
          expect.objectContaining({
            uuid: expect.toBeUuid(),
            inviter: expect.objectContaining({
              uuid: "81a7e5d8-52bd-4288-b524-0eb3a1661a70",
            }),
            invitee: expect.objectContaining({
              uuid: "df8e25c8-7374-415d-b3ca-e3b80c2d7f3c",
            }),
          })
        );
      });
    });
  });
  describe(`retrieving a session`, () => {
    describe(`given a session has been created`, () => {
      describe(`when provided with the id`, () => {
        it(`retrieves the details about the session`, async () => {
          const sessionDetails = sessionService.createSession({
            inviterUuid: "981e7d60-b787-4361-b705-bdaa7e308b55",
            inviteeUuid: "71259b1e-c0ee-498a-a683-b30da15c47e7",
          });
          const sessionUuid = (await sessionDetails).uuid;
          expect(sessionService.getSession(sessionUuid)).resolves.toEqual(
            expect.objectContaining({
              inviter: expect.objectContaining({
                uuid: "981e7d60-b787-4361-b705-bdaa7e308b55",
              }),
              invitee: expect.objectContaining({
                uuid: "71259b1e-c0ee-498a-a683-b30da15c47e7",
              }),
            })
          );
        });
      });
      describe(`when provided with the uuid of a non-existent session`, () => {
        it(`throws a "no such session" error`, () => {
          const sessionUuid = ">:)" as Uuid;
          expect(sessionService.getSession(sessionUuid)).rejects.toThrow(
            new NoSuchSessionError()
          );
        });
      });
    });
  });
  describe(`adding games`, () => {
    describe(`given an in-progress session`, () => {
      describe(`with no games`, () => {
        it(`add a new game to the session`, async () => {
          const { uuid: sessionUuid } = await sessionService.createSession({
            inviteeUuid: "c431db29-fede-4fb4-9434-b4befcab5891",
            inviterUuid: "f6285576-0dd3-4364-adb3-99b4b98dbed2",
          });

          expect(sessionService.getGameMetadata(sessionUuid)).resolves.toEqual(
            []
          );
          expect(
            sessionService.getActiveGameUuid(sessionUuid)
          ).resolves.toBeUndefined();
          expect(
            await sessionService.addNewGame(
              sessionUuid,
              "c431db29-fede-4fb4-9434-b4befcab5891",
              "f6285576-0dd3-4364-adb3-99b4b98dbed2"
            )
          ).toBeUuid();
          const activeGameUuid = await sessionService.getActiveGameUuid(
            sessionUuid
          );
          expect(activeGameUuid).toBeUuid();
          expect(sessionService.getGameMetadata(sessionUuid)).resolves.toEqual([
            {
              gameUuid: activeGameUuid,
              playerOneUuid: "c431db29-fede-4fb4-9434-b4befcab5891",
              playerTwoUuid: "f6285576-0dd3-4364-adb3-99b4b98dbed2",
            },
          ]);
        });
      });
      describe(`with an active game`, () => {
        it(`does not add a new game to the session`, async () => {
          const { uuid: sessionUuid } = await sessionService.createSession({
            inviterUuid: "335f8389-9ff7-4027-9b16-1040c5018106",
            inviteeUuid: "637d72af-10c6-4421-a577-dd7a7d911075",
          });

          await sessionService.addNewGame(
            sessionUuid,
            "335f8389-9ff7-4027-9b16-1040c5018106",
            "637d72af-10c6-4421-a577-dd7a7d911075"
          );

          expect(
            sessionService.addNewGame(
              sessionUuid,
              "335f8389-9ff7-4027-9b16-1040c5018106",
              "637d72af-10c6-4421-a577-dd7a7d911075"
            )
          ).rejects.toThrow(
            new ActiveGameInProgressError(
              "You cannot add games whilst a game is in progress."
            )
          );
        });
      });
    });
  });
  describe(`making moves`, () => {
    describe(`given a session`, () => {
      describe(`with an active game`, () => {
        describe(`and a valid move`, () => {
          it(`makes the move on the active game`, async () => {
            const { uuid: sessionUuid } = await sessionService.createSession({
              inviteeUuid: "4b8bf23e-b383-49cc-86af-cb7f82dd33cb",
              inviterUuid: "704a2fb8-dcc6-4c2f-920c-55ab0ac5c08c",
            });

            await sessionService.addNewGame(
              sessionUuid,
              "4b8bf23e-b383-49cc-86af-cb7f82dd33cb",
              "704a2fb8-dcc6-4c2f-920c-55ab0ac5c08c"
            );

            const moveResult = await sessionService.submitMove({
              sessionUuid,
              playerUuid: "4b8bf23e-b383-49cc-86af-cb7f82dd33cb",
              position: {
                row: 0,
                column: 0,
              },
            });
            expect(moveResult).toEqual({ moveSuccessful: true });
          });
        });
      });
    });
  });
});
