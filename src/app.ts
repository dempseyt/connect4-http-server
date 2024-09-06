import resolveRouters from "@/resolve-routers";
import express, { RequestHandler } from "express";
import { jwtDecrypt } from "jose";
import { JwtPrivateKey, JwtPublicKey, Stage } from "./global";
import validateUserRegisterRequest from "./user/validate-user-register-request";

type AppParameters = {
  stage: Stage;
  keySet: {
    jwtPublicKey: JwtPublicKey;
    jwtPrivateKey: JwtPrivateKey;
  };
  internalEventPublisher?: (type: unknown, payload: unknown) => Promise<void>;
  authority?: string;
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

const appFactory = ({
  stage,
  keySet,
  internalEventPublisher,
  authority,
}: AppParameters) => {
  const { jwtPrivateKey: privateKey } = keySet;
  const app = express();
  const { userRouter, inviteRouter } = resolveRouters({
    stage,
    keySet,
    internalEventPublisher,
    authority,
  });
  app.use(express.json());
  app.use(createAuthenticationMiddleware(privateKey));
  app.use("/user", validateUserRegisterRequest, userRouter);
  app.use("/invite", inviteRouter);

  return app;
};

export default appFactory;
