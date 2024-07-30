import resolveRouters, { RouterParameters } from "@/resolve-routers";
import express from "express";
import validateUserRegisterRequest from "./validate-user-register-request";

type AppParameters = {
  routerParameters: RouterParameters;
};

const appFactory = (appParameters: AppParameters) => {
  const { routerParameters } = appParameters;
  const { userRouter, inviteRouter } = resolveRouters(routerParameters);
  const app = express();
  app.use(express.json());
  app.use("/user", validateUserRegisterRequest, userRouter);
  app.use("/invite", inviteRouter);

  return app;
};

export default appFactory;
