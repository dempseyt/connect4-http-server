import Game from "@/game/game";
import { BoardCell } from "@/game/types.d";
import _toAsciiTable from "@/utils/to-ascii-table";

const toAsciiTable = (board: Array<Array<BoardCell>>): string =>
  _toAsciiTable<BoardCell>(board, (value): string => {
    switch (value.occupyingPlayer) {
      case 1:
        return "1";
      case 2:
        return "2";
      default:
        return " ";
    }
  });

describe(`game`, () => {
  describe(`creating a game`, () => {
    describe(`given no arguments`, () => {
      it(`creates a new Game instance`, () => {
        const game = new Game();
        expect(game).toBeInstanceOf(Game);
      });
      it("creates a game with an empty board of default size", () => {
        const game = new Game();
        const board = game.getBoard();
        expect(toAsciiTable(board)).toMatchInlineSnapshot(`
"
|---|---|---|---|---|---|---|
|   |   |   |   |   |   |   |
|---|---|---|---|---|---|---|
|   |   |   |   |   |   |   |
|---|---|---|---|---|---|---|
|   |   |   |   |   |   |   |
|---|---|---|---|---|---|---|
|   |   |   |   |   |   |   |
|---|---|---|---|---|---|---|
|   |   |   |   |   |   |   |
|---|---|---|---|---|---|---|
|   |   |   |   |   |   |   |
|---|---|---|---|---|---|---|"
`);
      });
    });
  });
  describe(`retrieving game details`, () => {
    it(`returns the game details`, () => {
      const game = new Game();
      expect(game.getDetails()).toEqual(
        expect.objectContaining({
          activePlayer: 1,
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
        })
      );
    });
  });
});
