import { NoSuchSessionError } from "@/session/errors";
import {
  SessionCreationDetails,
  SessionRepositoryInterface,
  SessionServiceInterface,
  Uuid,
} from "./session-service.d";

export default class SessionService implements SessionServiceInterface {
  #sessionRepository: SessionRepositoryInterface;

  constructor(sessionRepository: SessionRepositoryInterface) {
    this.#sessionRepository = sessionRepository;
  }

  createSession(sessionCreationDetails: SessionCreationDetails) {
    return this.#sessionRepository.create(sessionCreationDetails);
  }

  getSession(sessionUuid: Uuid) {
    const sessionDetails = this.#sessionRepository.getSession(sessionUuid);
    if (!sessionDetails) {
      throw new NoSuchSessionError();
    }
    return sessionDetails;
  }
}
