import GameService from "@/game/game-service";
import {
  ActiveGameInProgressError,
  NoSuchSessionError,
} from "@/session/errors";
import {
  SessionCreationDetails,
  SessionRepository,
  SessionServiceInterface,
  Uuid,
} from "./types";

export default class SessionService implements SessionServiceInterface {
  #sessionRepository: SessionRepository;
  #gameService: GameService;

  constructor(sessionRepository: SessionRepository, gameService: GameService) {
    this.#sessionRepository = sessionRepository;
    this.#gameService = gameService;
  }

  createSession = (sessionDetails: SessionCreationDetails) =>
    this.#sessionRepository.create(sessionDetails);

  getSession = async (sessionUuid: Uuid) => {
    const sessionDetails = await this.#sessionRepository.getSession(
      sessionUuid
    );
    if (sessionDetails === undefined) {
      throw new NoSuchSessionError();
    }
    return sessionDetails;
  };

  getGameUuids = async (sessionUuid: Uuid) =>
    (await this.getSession(sessionUuid)).gameUuids;

  getActiveGameUuid = async (sessionUuid: Uuid) =>
    (await this.getSession(sessionUuid)).activeGameUuid;

  addNewGame = async (sessionUuid: Uuid) => {
    if ((await this.getActiveGameUuid(sessionUuid)) === undefined) {
      const newGameUuid = await this.#gameService.createGame();
      await this.#sessionRepository.addGame(sessionUuid, newGameUuid);
      await this.#sessionRepository.setActiveGame(sessionUuid, newGameUuid);
      return newGameUuid;
    } else {
      throw new ActiveGameInProgressError(
        "You cannot add games whilst a game is in progress."
      );
    }
  };
}
