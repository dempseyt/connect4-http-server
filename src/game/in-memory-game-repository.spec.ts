import parseAsciiTable from "@/utils/parse-ascii-table";
import { GameRepository } from "./game-service";
import InMemoryGameRepository from "./in-memory-game-repository";

const createBoardFromAsciiTable = (asciiTable: string) =>
  parseAsciiTable<BoardCell>(
    asciiTable,
    (cellContent: "1" | "2"): BoardCell => ({
      occupyingPlayer: Number.parseInt(input) as 1 | 2,
    })
  );

const create1x2Board = () =>
  createBoardFromAsciiTable(`
|---|---|
|   |   |
|---|---|`);

const createDetailsOfGameWith1x2SizeBoard = (): GameDetails => ({
  activePlayer: 1,
  gameStatus: "IN_PROGRESS" as GameStatus.IN_PROGRESS,
  validRowPlacementsByColumn: [0, 0],
  playerStats: {
    1: {
      player: 1,
      disksLeft: 1,
    },
    2: {
      player: 2,
      disksLeft: 2,
    },
  },
});

describe(`in-memory-game-repository`, () => {
  let gameRepository: GameRepository;
  const gameDetails = createDetailsOfGameWith1x2SizeBoard();

  beforeEach(() => {
    gameRepository = new InMemoryGameRepository();
  });
  describe(`creating a game repository`, () => {
    it(`creates an in-memory game repository`, () => {
      const repository = new InMemoryGameRepository();
      expect(repository).toBeInstanceOf(InMemoryGameRepository);
    });
  });
  describe(`saving a game`, () => {
    describe(`when given a game to save`, () => {
      it(`saves the game`, () => {
        expect(gameRepository.saveGame(gameDetails)).resolves.toEqual({
          uuid: expect.toBeUuid(),
          ...createDetailsOfGameWith1x2SizeBoard(),
        });
      });
    });
  });
  describe(`loading a game`, () => {
    describe(`given a game has been saved`, () => {
      describe(`when given the uuid of the game`, () => {
        it(`returns teh details of the game`, async () => {
          const gameUuid = await gameRepository.saveGame(gameDetails);
          expect(gameRepository.loadGame(gameUuid)).resolves.toEqual({
            uuid: expect.toBeUuid(),
            ...gameDetails,
          });
        });
      });
    });
  });
});
