import { NoSuchSessionError } from "./errors";
import InMemorySessionRepository from "./in-memory-session-repository";
import SessionService from "./session-service";
import {
  SessionRepositoryInterface,
  SessionServiceInterface,
  Uuid,
} from "./session-service.d";

describe(`session-service`, () => {
  let sessionRepository: SessionRepositoryInterface;
  let sessionService: SessionServiceInterface;
  beforeAll(() => {
    sessionRepository = new InMemorySessionRepository();
    sessionService = new SessionService(sessionRepository);
  });
  describe(`creating a session service`, () => {
    describe(`given a session repository`, () => {
      it(`creates a session service`, () => {
        expect(sessionService).toBeInstanceOf(SessionService);
      });
    });
  });
  describe(`creating a session`, () => {
    describe(`given the identities of two players`, () => {
      it(`creates a session`, () => {
        const sessionDetails = sessionService.createSession({
          inviterUuid: "81a7e5d8-52bd-4288-b524-0eb3a1661a70",
          inviteeUuid: "df8e25c8-7374-415d-b3ca-e3b80c2d7f3c",
        });
        expect(sessionDetails).resolves.toEqual(
          expect.objectContaining({
            uuid: expect.toBeUuid(),
            inviter: expect.objectContaining({
              uuid: "81a7e5d8-52bd-4288-b524-0eb3a1661a70",
            }),
            invitee: expect.objectContaining({
              uuid: "df8e25c8-7374-415d-b3ca-e3b80c2d7f3c",
            }),
          })
        );
      });
    });
  });
  describe(`retrieving a session`, () => {
    describe(`given a session has been created`, () => {
      describe(`when provided with the id`, () => {
        it(`retrieves the details about the session`, async () => {
          const sessionDetails = sessionService.createSession({
            inviterUuid: "981e7d60-b787-4361-b705-bdaa7e308b55",
            inviteeUuid: "71259b1e-c0ee-498a-a683-b30da15c47e7",
          });
          const sessionUuid = (await sessionDetails).uuid;
          expect(sessionService.getSession(sessionUuid)).resolves.toEqual(
            expect.objectContaining({
              inviter: expect.objectContaining({
                uuid: "981e7d60-b787-4361-b705-bdaa7e308b55",
              }),
              invitee: expect.objectContaining({
                uuid: "71259b1e-c0ee-498a-a683-b30da15c47e7",
              }),
            })
          );
        });
      });
      describe(`when provided with the uuid of a non-existent session`, () => {
        it(`throws a "no such session" error`, () => {
          const sessionUuid = ">:)" as Uuid;
          expect(sessionService.getSession(sessionUuid)).rejects.toThrow(
            new NoSuchSessionError()
          );
        });
      });
    });
  });
});
