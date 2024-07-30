import resolveRouters, { RouterParameters } from "@/resolve-routers";
import express from "express";
import getIsUserAuthorised from "./get-is-user-authorised";
import { JwtPrivateKey } from "./global";
import validateUserRegisterRequest from "./validate-user-register-request";

type AppParameters = {
  routerParameters: RouterParameters;
};

const createAuthorisationMiddleware =
  (privateKey: JwtPrivateKey) => async (req, res, next) => {
    const token = req.headers.authorisation;
    const { email } = req.body;

    res.locals.user = email;
    res.locals.isAuthorised = await getIsUserAuthorised(
      token,
      privateKey,
      email
    );

    next();
  };

const appFactory = (appParameters: AppParameters) => {
  const { routerParameters } = appParameters;
  const { jwtPrivateKey: privateKey } = routerParameters.keySet;
  const { userRouter, inviteRouter } = resolveRouters(routerParameters);
  const app = express();
  app.use(express.json());
  app.use(createAuthorisationMiddleware(privateKey));
  app.use("/user", validateUserRegisterRequest, userRouter);
  app.use("/invite", inviteRouter);

  return app;
};

export default appFactory;
