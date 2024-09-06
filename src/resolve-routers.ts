import { JwtPrivateKey, JwtPublicKey, Stage } from "@/global";
import InMemoryInviteRepository from "@/invite/in-memory-invite-repository";
import { Router } from "express";
import createInviteEventPublishers from "./invite/create-invite-event-publishers";
import inviteRouterFactory from "./invite/invite-router-factory";
import InviteService from "./invite/invite-service";
import { InviteServiceEventPublishers } from "./invite/invite-service-types";
import InMemoryUserRepository from "./user/in-memory-user-repository";
import userRouterFactory from "./user/user-router";
import UserService from "./user/user-service";

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
  internalEventPublisher?: (type: unknown, payload: unknown) => Promise<void>;
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

const resolveRouters = ({
  stage,
  keySet,
  internalEventPublisher = () => Promise.resolve(),
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
  return {
    [RouterType.userRouter]: userRouterFactory(userService, keySet, authority),
    [RouterType.inviteRouter]: inviteRouterFactory(inviteService),
  };
};

export default resolveRouters;
