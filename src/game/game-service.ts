import Game from "./game";
import { GameRepository } from "./game-service.d";

export default class GameService {
  #gameRepository: GameRepository;
  constructor(
    gameRepository: GameRepository,
    gameFactory: (...args: ConstructorParameters<typeof Game>) => Game
  ) {
    this.#gameRepository = gameRepository;
  }
}
