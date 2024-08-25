import { EventPublisher } from "@/app.d";
import { JwtPrivateKey, JwtPublicKey, Stage } from "@/global";
import InMemoryInviteRepository from "@/invite/in-memory-invite-repository";
import { Router } from "express";
import createInviteEventHandlers from "./invite/create-invite-event-handlers";
import inviteRouterFactory from "./invite/invite-router-factory";
import InviteService from "./invite/invite-service";
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
  publishEvent?: EventPublisher<unknown, unknown>;
};

const resolveRouters = ({
  stage,
  keySet,
  publishEvent,
}: RouterParameters): Record<RouterType, Router> => {
  const userRepository =
    stage !== "production"
      ? new InMemoryUserRepository()
      : new InMemoryUserRepository();
  const inviteRepository =
    stage !== "production"
      ? new InMemoryInviteRepository()
      : new InMemoryInviteRepository();
  const userService = new UserService(userRepository);
  const inviteService = new InviteService(
    userService,
    inviteRepository,
    createInviteEventHandlers(publishEvent)
  );
  return {
    [RouterType.userRouter]: userRouterFactory(userService, keySet),
    [RouterType.inviteRouter]: inviteRouterFactory(inviteService),
  };
};

export default resolveRouters;
