import { JwtPublicKey, Stage } from "@/global";
import { Router } from "express";
import InMemoryUserRepository from "./in-memory-user-repository";
import userRouterFactory from "./user-router";
import UserService from "./user-service";

export enum RouterType {
  "userRouter",
}

export type RouterParameters = {
  stage: Stage;
  keySet?: {
    jwtPublicKey: JwtPublicKey;
  };
};

const resolveRouters = ({
  stage,
  keySet,
}: RouterParameters): Record<RouterType, Router> => {
  const userRepository =
    stage !== "production"
      ? new InMemoryUserRepository()
      : new InMemoryUserRepository();
  const userService = new UserService(userRepository);
  return {
    [RouterType.userRouter]: userRouterFactory(userService, keySet),
  };
};

export default resolveRouters;
