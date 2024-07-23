import resolveRouters, {
  RouterParameters,
  RouterType,
} from "@/user/resolve-routers";
import express from "express";

type AppParameters = {
  routerParameters: RouterParameters;
};

const appFactory = (appParameters: AppParameters) => {
  const { routerParameters } = appParameters;
  const userRouter = resolveRouters(routerParameters);
  const app = express();
  app.use(express.json());
  app.use("/user", userRouter[RouterType.userRouter]);

  return app;
};

export default appFactory;
