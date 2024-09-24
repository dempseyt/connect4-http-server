import { PlayerMoveResult } from "@/game/types";
import { Uuid } from "@/global.d";

export type SessionCreationDetails = {
  inviterUuid: Uuid;
  inviteeUuid: Uuid;
};

export type GameMetadata = {
  gameUuid: Uuid;
  playerOneUuid: Uuid;
  playerTwoUuid: Uuid;
};

export type BoardPosition = {
  row: number;
  column: number;
};

export type MoveDetails = {
  sessionUuid: Uuid;
  playerUuid: Uuid;
  position: BoardPosition;
};

export type SessionDetails = {
  uuid: Uuid;
  invitee: {
    uuid: Uuid;
  };
  inviter: {
    uuid: Uuid;
  };
  status: SessionStatus;
  games: Array<GameMetadata>;
  activeGameUuid?: Uuid;
};

export enum SessionStatus {
  IN_PROGRESS = "IN_PROGRESS",
}

export interface SessionRepository {
  create: (sessionDetails: SessionCreationDetails) => Promise<SessionDetails>;
  getSession: (sessionUuid: Uuid) => Promise<SessionDetails>;
  addGame: (
    sessionUuid: Uuid,
    gameUuid: Uuid,
    playerOneUuid: Uuid,
    playerTwoUuid: Uuid
  ) => Promise<SessionDetails>;
  setActiveGame: (sessionUuid: Uuid, gameUuid: Uuid) => Promise<SessionDetails>;
}

export interface SessionServiceInterface {
  createSession: (
    SessionCreationDetails: SessionCreationDetails
  ) => Promise<SessionDetails>;
  getSession: (sessionUuid: Uuid) => Promise<SessionDetails>;
  getGameMetadata: (sessionUuid: Uuid) => Promise<Array<GameMetadata>>;
  getActiveGameUuid: (sessionUuid: Uuid) => Promise<Uuid>;
  addNewGame: (
    sessionUuid: Uuid,
    playerOneUuid: Uuid,
    playerTwoUuid: Uuid
  ) => Promise<Uuid>;
  submitMove: (moveDetails: MoveDetails) => Promise<PlayerMoveResult>;
  getActivePlayer: (sessionUuid: Uuid) => Promise<Uuid>;
}
