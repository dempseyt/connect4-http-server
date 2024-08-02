import resolveRouters, { RouterParameters } from "@/resolve-routers";
import express, { RequestHandler } from "express";
import { jwtDecrypt } from "jose";
import { JwtPrivateKey } from "./global";
import validateUserRegisterRequest from "./validate-user-register-request";

type AppParameters = {
  routerParameters: RouterParameters;
};

const createAuthenticationMiddleware =
  (privateKey: JwtPrivateKey): RequestHandler =>
  async (req, res, next) => {
    const authorizationField = req.headers.authorization;

    if (authorizationField) {
      try {
        const { payload } = await jwtDecrypt(
          authorizationField.split(" ")[1],
          privateKey
        );

        res.locals.claims = { email: payload.username };
      } catch (error) {}
    }

    next();
  };

const appFactory = (appParameters: AppParameters) => {
  const { routerParameters } = appParameters;
  const { jwtPrivateKey: privateKey } = routerParameters.keySet;
  const { userRouter, inviteRouter } = resolveRouters(routerParameters);
  const app = express();
  app.use(express.json());
  app.use(createAuthenticationMiddleware(privateKey));
  app.use("/user", validateUserRegisterRequest, userRouter);
  app.use("/invite", inviteRouter);

  return app;
};

export default appFactory;
