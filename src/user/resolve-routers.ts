import { Env } from "@/global";
import { Router } from "express";
import InMemoryUserRepository from "./in-memory-user-repository";
import userRouterFactory from "./user-router-factory";
import UserService from "./user-service";

enum RouterType {
  "userRouter",
}

const resolveRouters = (env: Env): Record<RouterType, Router> => {
  const userRepository =
    env !== "production"
      ? new InMemoryUserRepository()
      : new InMemoryUserRepository();
  const userService = new UserService(userRepository);
  return {
    [RouterType.userRouter]: userRouterFactory(userService),
  };
};

export default resolveRouters;
