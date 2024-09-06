export interface GameRepository {}
export type PlayerNumber = 1 | 2;
export type BoardCell = "undefined" | "1" | "2";
export type Board = Array<Array<BoardCell>>;
export type BoardDimensions = {
  rows: number;
  columns: number;
};
export type Uuid = `${string}-${string}-${string}-${string}-${string}`;
export interface GameFactory {
  getBoard: () => Board;
}
