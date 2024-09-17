import Game from "@/game/game";
import { Uuid } from "@/global";

export type PlayerNumber = 1 | 2;

export type BoardCell = {
  occupyingPlayer?: PlayerNumber;
};

export type PlayerStats = {
  player: PlayerNumber;
  discsLeft: number;
};

export enum GameStatus {
  IN_PROGRESS = "IN_PROGRESS",
  PLAYER_ONE_WIN = "PLAYER_ONE_WIN",
  PLAYER_TWO_WIN = "PLAYER_TWO_WIN",
  DRAW = "DRAW",
}

export type BoardDimensions = {
  rows: number;
  columns: number;
};

export type Board = Array<Array<BoardCell>>;

export type GameDetails = {
  board?: Board;
  activePlayer: PlayerNumber;
  players: Record<PlayerNumber, PlayerStats>;
  status: GameStatus;
  playerColors: PlayerColorsType;
  uuid?: Uuid;
};

export interface GameService {
  createGame: () => Promise<Uuid>;
  getGameDetails: (gameUuid: Uuid) => Promise<GameDetails>;
}

export type PlayerColorsType = {
  playerOneColor: string;
  playerTwoColor: string;
};

export type PersistedGameDetails = GameDetails & { uuid: Uuid };

export interface GameRepository {
  saveGame: (gameDetails: GameDetails) => PersistedGameDetails;
  loadGame: (gameUuid: Uuid) => PersistedGameDetails;
}

interface GameInterface {
  getBoard: () => Board;
}

export type PlayerMoveResult = {
  moveSuccessful: boolean;
  message?: string;
};

export type GameFactory = (...args: ConstructorParameters<typeof Game>) => Game;

export type PlayerMove = {
  player: PlayerNumber;
  position: {
    row: number;
    column: number;
  };
};
