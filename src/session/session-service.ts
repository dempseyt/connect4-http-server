import GameService from "@/game/game-service";
import { PlayerNumber } from "@/game/types";
import { Uuid } from "@/global";
import {
  ActiveGameInProgressError,
  NoSuchSessionError,
} from "@/session/errors";
import {
  GameMetadata,
  MoveDetails,
  SessionCreationDetails,
  SessionRepository,
  SessionServiceInterface,
} from "@/session/types";

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

  getActiveGameUuid = async (sessionUuid: Uuid) =>
    (await this.getSession(sessionUuid)).activeGameUuid;

  addNewGame = async (
    sessionUuid: Uuid,
    playerOneUuid: Uuid,
    playerTwoUuid: Uuid
  ) => {
    if ((await this.getActiveGameUuid(sessionUuid)) === undefined) {
      const newGameUuid = await this.#gameService.createGame();
      await this.#sessionRepository.addGame(
        sessionUuid,
        newGameUuid,
        playerOneUuid,
        playerTwoUuid
      );
      await this.#sessionRepository.setActiveGame(sessionUuid, newGameUuid);
      return newGameUuid;
    } else {
      throw new ActiveGameInProgressError(
        "You cannot add games whilst a game is in progress."
      );
    }
  };

  submitMove = async ({ sessionUuid, playerUuid, position }: MoveDetails) => {
    const {
      inviter: { uuid: inviterUuid },
      activeGameUuid,
    } = await this.getSession(sessionUuid);

    return this.#gameService.submitMove(activeGameUuid, {
      player: playerUuid === inviterUuid ? 1 : 2,
      position,
    });
  };

  async #mapPlayerNumberToPlayerUuid(
    playerNumber: PlayerNumber,
    gameMetaData: GameMetadata
  ) {
    return playerNumber === 1
      ? gameMetaData.playerOneUuid
      : gameMetaData.playerTwoUuid;
  }

  async getGameMetadata(sessionUuid: Uuid) {
    const sessionDetails = await this.getSession(sessionUuid);
    return sessionDetails.games;
  }

  async getActivePlayer(sessionUuid: Uuid) {
    const sessionDetails = await this.getSession(sessionUuid);
    const activeGameUuid = sessionDetails.activeGameUuid;
    const { activePlayer } = await this.#gameService.getGameDetails(
      activeGameUuid
    );
    const gameMetaData = await this.getGameMetadata(sessionUuid);
    return await this.#mapPlayerNumberToPlayerUuid(
      activePlayer,
      gameMetaData.at(-1)
    );
  }
}
