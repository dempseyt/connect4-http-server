import InMemoryGameRepository from "@/game/in-memory-game-repository";
import {
  BoardCell,
  GameDetails,
  GameRepository,
  GameStatus,
  PlayerNumber,
} from "@/game/types.d";
import parseAsciiTable from "@/utils/parse-ascii-table";

const createBoardFromAsciiTable = (asciiTable: string) =>
  parseAsciiTable<BoardCell>(
    asciiTable,
    (cellContent: "1" | "2"): BoardCell => ({
      occupyingPlayer: Number.parseInt(cellContent) as PlayerNumber,
    })
  );

const create1x2Board = () =>
  createBoardFromAsciiTable(`
|---|---|
|   |   |
|---|---|`);

const createDetailsOfGameWith1x2SizeBoard = (): GameDetails => ({
  board: create1x2Board(),
  activePlayer: 1,
  status: GameStatus.IN_PROGRESS,
  playerColors: {
    playerOneColor: "red",
    playerTwoColor: "yellow"
  },
  players: {
    1: {
      player: 1,
      discsLeft: 1,
    },
    2: {
      player: 2,
      discsLeft: 2,
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
          const gameUuid = (await gameRepository.saveGame(gameDetails)).uuid;
          expect(gameRepository.loadGame(gameUuid)).resolves.toEqual({
            uuid: expect.toBeUuid(),
            ...gameDetails,
          });
        });
      });
    });
  });
});
