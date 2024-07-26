import resolveRouters, {
  RouterParameters,
  RouterType,
} from "@/user/resolve-routers";
import express from "express";
import validateUserRegisterRequest from "./validate-user-register-request";

type AppParameters = {
  routerParameters: RouterParameters;
};

const appFactory = (appParameters: AppParameters) => {
  const { routerParameters } = appParameters;
  const userRouter = resolveRouters(routerParameters);
  const app = express();
  app.use(express.json());
  app.use(
    "/user",
    validateUserRegisterRequest,
    userRouter[RouterType.userRouter]
  );

  return app;
};

export default appFactory;
