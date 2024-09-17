import toAsciiTable from "@/utils/to-ascii-table";
import Game from "./game";
import GameService from "./game-service";
import InMemoryGameRepository from "./in-memory-game-repository";

describe(`game-service`, () => {
  describe(`creating a game service`, () => {
    describe(`given a game repository`, () => {
      describe(`and a game constructor`, () => {
        it(`creates a game service`, () => {
          const gameRepository = new InMemoryGameRepository();
          const gameService = new GameService(
            gameRepository,
            (...args: ConstructorParameters<typeof Game>) => new Game(...args)
          );
          expect(gameService).toBeInstanceOf(GameService);
        });
      });
    });
  });
  describe(`creating a game`, () => {
    let gameService: GameService;

    beforeEach(() => {
      const gameRepository = new InMemoryGameRepository();
      gameService = new GameService(
        gameRepository,
        (...args: ConstructorParameters<typeof Game>) => new Game(...args)
      );
    });

    describe(`given no arguments`, () => {
      it(`creates a game with a 6x7 board`, async () => {
        const gameUuid = await gameService.createGame();
        expect(gameUuid).toBeUuid();
        const gameDetails = await gameService.getGameDetails(gameUuid);
        expect(gameDetails).toEqual(
          expect.objectContaining({
            activePlayer: 1,
            board: expect.anything(),
            playerColors: {
              playerOneColor: "FF5773",
              playerTwoColor: "fdfd96",
            },
            players: {
              1: {
                discsLeft: 21,
                player: 1,
              },
              2: {
                discsLeft: 21,
                player: 2,
              },
            },
            status: "IN_PROGRESS",
            uuid: expect.toBeUuid(),
          })
        );
      });
    });
  });
  describe(`making a move`, () => {
    const gameRepository = new InMemoryGameRepository();
    const gameService = new GameService(
      gameRepository,
      (...args: ConstructorParameters<typeof Game>) => new Game(...args)
    );
    describe(`given the uuid of a game`, () => {
      describe(`and a valid move`, () => {
        it(`indicates the move was successful`, async () => {
          const gameUuid = await gameService.createGame();
          await expect(
            gameService.submitMove(gameUuid, {
              player: 1,
              position: {
                row: 0,
                column: 0,
              },
            })
          ).resolves.toEqual({ moveSuccessful: true });
          const gameDetails = await gameService.getGameDetails(gameUuid);
          expect(toAsciiTable(gameDetails.board)).toMatchInlineSnapshot(`
"
|-----------------|-----------------|-----------------|-----------------|-----------------|-----------------|-----------------|
| [object Object] | [object Object] | [object Object] | [object Object] | [object Object] | [object Object] | [object Object] |
|-----------------|-----------------|-----------------|-----------------|-----------------|-----------------|-----------------|
| [object Object] | [object Object] | [object Object] | [object Object] | [object Object] | [object Object] | [object Object] |
|-----------------|-----------------|-----------------|-----------------|-----------------|-----------------|-----------------|
| [object Object] | [object Object] | [object Object] | [object Object] | [object Object] | [object Object] | [object Object] |
|-----------------|-----------------|-----------------|-----------------|-----------------|-----------------|-----------------|
| [object Object] | [object Object] | [object Object] | [object Object] | [object Object] | [object Object] | [object Object] |
|-----------------|-----------------|-----------------|-----------------|-----------------|-----------------|-----------------|
| [object Object] | [object Object] | [object Object] | [object Object] | [object Object] | [object Object] | [object Object] |
|-----------------|-----------------|-----------------|-----------------|-----------------|-----------------|-----------------|
| [object Object] | [object Object] | [object Object] | [object Object] | [object Object] | [object Object] | [object Object] |
|-----------------|-----------------|-----------------|-----------------|-----------------|-----------------|-----------------|"
`);
        });
      });
    });
  });
});
