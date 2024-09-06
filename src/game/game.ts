import { Board, BoardDimensions } from "./game-service";

export interface GameFactory {}
export default class Game implements GameFactory {
  #board: Board;

  constructor() {
    this.#board = this.#createBoard({ rows: 6, columns: 7 });
  }

  #createBoard({ rows, columns }: BoardDimensions): Board {
    const callback = () =>
      new Array(columns).fill(undefined).map(() => ({ player: undefined }));
    const board = new Array(rows).fill(undefined).map(callback);
    return board;
  }
}
