import { Uuid } from "@/global.d";
import {
  SessionCreationDetails,
  SessionDetails,
  SessionRepository,
  SessionStatus,
} from "@/session/types.d";
export default class InMemorySessionRepository implements SessionRepository {
  #sessions: Map<Uuid, SessionDetails>;

  constructor() {
    this.#sessions = new Map();
  }

  async create({ inviterUuid, inviteeUuid }: SessionCreationDetails) {
    const sessionUuid = crypto.randomUUID();
    const sessionDetails = {
      uuid: sessionUuid,
      inviter: {
        uuid: inviterUuid,
      },
      invitee: {
        uuid: inviteeUuid,
      },
      status: SessionStatus.IN_PROGRESS,
      games: [],
    };

    this.#sessions.set(sessionUuid, sessionDetails);
    return sessionDetails;
  }

  getSession = async (sessionUuid: Uuid) => this.#sessions.get(sessionUuid);

  addGame = async (
    sessionUuid: Uuid,
    gameUuid: Uuid,
    playerOneUuid: Uuid,
    playerTwoUuid: Uuid
  ) => {
    const sessionDetails = await this.getSession(sessionUuid);
    sessionDetails.games.push({
      gameUuid,
      playerOneUuid,
      playerTwoUuid,
    });
    return sessionDetails;
  };

  setActiveGame = async (sessionUuid: Uuid, gameUuid: Uuid) => {
    const sessionDetails = await this.getSession(sessionUuid);
    sessionDetails.activeGameUuid = gameUuid;
    return sessionDetails;
  };
}
