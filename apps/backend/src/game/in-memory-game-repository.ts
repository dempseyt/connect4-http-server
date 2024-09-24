import {
  GameDetails,
  GameRepository,
  PersistedGameDetails,
} from "@/game/types.d";
import { Uuid } from "@/global.d";

export default class InMemoryGameRepository implements GameRepository {
  #games: Map<Uuid, PersistedGameDetails>;

  constructor() {
    this.#games = new Map();
  }
  saveGame({ uuid = crypto.randomUUID(), ...gameDetails }: GameDetails) {
    const persistedGameDetails = { ...gameDetails, uuid };
    this.#games.set(uuid, persistedGameDetails);
    return persistedGameDetails;
  }

  loadGame(gameUuid: Uuid) {
    return this.#games.get(gameUuid);
  }
}
