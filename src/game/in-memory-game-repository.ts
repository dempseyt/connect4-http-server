import { GameRepository, Uuid } from "./game";

export default class InMemoryGameRepository implements GameRepository {
  #games: Map<Uuid, PersistedGameDetails>;

  constructor() {
    this.#games = new Map();
  }
  saveGame(gameDetails: GameDetails) {
    const gameUuid = crypto.randomUUID();
    const persistedGameDetails = { ...gameDetails, uuid: gameUuid };
    this.#games.set(gameUuid, persistedGameDetails);
    return Promise.resolve(persistedGameDetails);
  }
  loadGame(gameUuid: Uuid) {
    return Promise.resolve(this.#games.get(gameUuid));
  }
}
