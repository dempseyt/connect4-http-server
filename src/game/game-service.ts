import { GameFactory, GameRepository } from "@/game/types.d";
import { Uuid } from "@/session/types.d";

export default class GameService {
  #gameRepository: GameRepository;
  #gameFactory: GameFactory;

  constructor(gameRepository: GameRepository, gameFactory: GameFactory) {
    this.#gameRepository = gameRepository;
    this.#gameFactory = gameFactory;
  }

  async createGame() {
    const game = this.#gameFactory();
    const { uuid: gameUuid } = await this.#gameRepository.saveGame(
      game.getDetails()
    );
    return gameUuid;
  }

  async getGameDetails(gameUuid: Uuid) {
    return this.#gameRepository.loadGame(gameUuid);
  }
}
