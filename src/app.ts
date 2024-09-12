import resolveRouters from "@/resolve-routers";
import express, { RequestHandler } from "express";
import { jwtDecrypt } from "jose";
import { Subject } from "rxjs";
import createSocketServer, {
  ExpressWithPortAndSocket,
} from "./create-socket-server";
import { JwtPrivateKey, JwtPublicKey, Stage } from "./global";
import createInviteEventListener, {
  InviteCreatedEvent,
} from "./invite/create-invite-event-listener";
import createDispatchNotification from "./notification/create-dispatch-notification";
import validateUserRegisterRequest from "./user/validate-user-register-request";

type AppParameters = {
  stage: Stage;
  keySet: {
    jwtPublicKey: JwtPublicKey;
    jwtPrivateKey: JwtPrivateKey;
  };
  internalEventPublisher?: (type: unknown, payload: unknown) => Promise<void>;
  internalEventSubscriber?: Subject<InviteCreatedEvent>;
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
  internalEventSubscriber = new Subject(),
}: AppParameters) => {
  const { jwtPrivateKey: privateKey } = keySet;
  const app = express() as ExpressWithPortAndSocket;

  createSocketServer(app, {
    path: "/notification",
    privateKey,
  });

  createInviteEventListener(
    internalEventSubscriber,
    createDispatchNotification(app.server)
  );

  const { userRouter, inviteRouter } = resolveRouters({
    stage,
    keySet,
    internalEventPublisher,
    authority: `localhost:${app.port}`,
  });

  app.use(express.json());
  app.use(createAuthenticationMiddleware(privateKey));
  app.use("/user", validateUserRegisterRequest, userRouter);
  app.use("/invite", inviteRouter);

  return app;
};

export default appFactory;
