import { JwtPrivateKey, JwtPublicKey, Stage } from "@/global.d";
import createInviteEventPublishers from "@/invite/create-invite-event-publishers";
import InMemoryInviteRepository from "@/invite/in-memory-invite-repository";
import inviteRouterFactory from "@/invite/invite-router-factory";
import InviteService from "@/invite/invite-service";
import { InviteServiceEventPublishers } from "@/invite/types.d";
import InMemoryUserRepository from "@/user/in-memory-user-repository";
import userRouterFactory from "@/user/user-router";
import UserService from "@/user/user-service";
import { Router } from "express";
import Game from "./game/game";
import GameService from "./game/game-service";
import InMemoryGameRepository from "./game/in-memory-game-repository";
import { GameRepository } from "./game/types";
import { InviteCreatedEvent } from "./invite/create-invite-event-listener";
import InMemorySessionRepository from "./session/in-memory-session-repository";
import SessionService from "./session/session-service";
import { SessionRepository } from "./session/types";

export enum RouterType {
  userRouter = "userRouter",
  inviteRouter = "inviteRouter",
}

export type RouterParameters = {
  stage: Stage;
  keySet: {
    jwtPublicKey: JwtPublicKey;
    jwtPrivateKey: JwtPrivateKey;
  };
  internalEventPublisher?: (
    eventDetails: InviteCreatedEvent
  ) => Promise<unknown>;
  authority?: string;
};

const createUserRepository = (stage: Stage) =>
  stage === "production"
    ? new InMemoryUserRepository()
    : new InMemoryUserRepository();

const createInviteRepository = (stage: Stage) =>
  stage === "production"
    ? new InMemoryInviteRepository()
    : new InMemoryInviteRepository();

const createUserService = (userRepository: InMemoryUserRepository) =>
  new UserService(userRepository);

const createInviteService = (
  userService: UserService,
  inviteRepository: InMemoryInviteRepository,
  inviteEventHandlers: InviteServiceEventPublishers
) => new InviteService(userService, inviteRepository, inviteEventHandlers);

const createGameRepository = (stage: Stage) =>
  stage !== "production"
    ? new InMemoryGameRepository()
    : new InMemoryGameRepository();

const createGameService = (gameRepository: GameRepository) =>
  new GameService(gameRepository, (...args) => new Game(...args));

const createSessionRepository = (stage: Stage) =>
  stage !== "production"
    ? new InMemorySessionRepository()
    : new InMemorySessionRepository();

const createSessionService = (
  sessionRepository: SessionRepository,
  gameService: GameService
) => new SessionService(sessionRepository, gameService);

const resolveRouters = ({
  stage,
  keySet,
  internalEventPublisher,
  authority = "localhost:80",
}: RouterParameters): Record<RouterType, Router> => {
  const userRepository = createUserRepository(stage);
  const inviteRepository = createInviteRepository(stage);
  const userService = createUserService(userRepository);
  const inviteEventHandlers = createInviteEventPublishers(
    internalEventPublisher
  );
  const inviteService = createInviteService(
    userService,
    inviteRepository,
    inviteEventHandlers
  );
  const gameRepository = createGameRepository(stage);
  const gameService = createGameService(gameRepository);
  const sessionRepository = createSessionRepository(stage);
  const sessionService = createSessionService(sessionRepository, gameService);
  return {
    [RouterType.userRouter]: userRouterFactory(userService, keySet, authority),
    [RouterType.inviteRouter]: inviteRouterFactory(
      inviteService,
      sessionService
    ),
  };
};

export default resolveRouters;
