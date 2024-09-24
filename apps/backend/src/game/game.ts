import {
  Board,
  BoardDimensions,
  GameInterface,
  GameStatus,
  PlayerColorsType,
  PlayerNumber,
  PlayerStats,
} from "@/game/types.d";
import deepClone from "@/utils/deep-clone";

const DEFAULT_BOARD_DIMENSIONS: BoardDimensions = {
  rows: 6,
  columns: 7,
};

export default class Game implements GameInterface {
  #board: Board;
  #activePlayer: 1 | 2;
  #status: GameStatus;
  #players: Record<PlayerNumber, PlayerStats>;
  #playerColors: PlayerColorsType;

  constructor() {
    this.#board = this.#createBoard(DEFAULT_BOARD_DIMENSIONS);
    this.#activePlayer = 1;
    this.#status = GameStatus.IN_PROGRESS;
    this.#players = {
      1: {
        player: 1,
        discsLeft: 21,
      },
      2: {
        player: 2,
        discsLeft: 21,
      },
    };
    this.#playerColors = {
      playerOneColor: "FF5773",
      playerTwoColor: "fdfd96",
    };
  }

  getBoard = () => deepClone(this.#board);

  getDetails = () => ({
    board: this.#board,
    activePlayer: this.#activePlayer,
    status: this.#status,
    players: this.#players,
    playerColors: this.#playerColors,
  });

  #createBoard(boardDimensions: { rows: number; columns: number }): Board {
    const board = new Array(boardDimensions.rows).fill(undefined).map(() =>
      new Array(boardDimensions.columns).fill(undefined).map(() => {
        return { occupyingPlayer: undefined };
      })
    );
    return board;
  }
}
