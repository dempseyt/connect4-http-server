import { JwtPublicKey, KeySet } from "@/global.d";
import express, { RequestHandler } from "express";
import { EncryptJWT } from "jose";
import { UserServiceInterface } from "./user-service";

const userDetailsRequestHandlerFactory =
  (userService: UserServiceInterface): RequestHandler =>
  async (req, res, next) => {
    if (res.locals.claims?.email) {
      const userDetails = await userService.getUserDetails(
        res.locals.claims.email
      );
      res.status(200).send(userDetails);
    } else {
      res
        .status(401)
        .send({ errors: ["You must be logged in to view your user details"] });
    }
    next();
  };

const loginRequestHandlerFactory =
  (
    userService: UserServiceInterface,
    jwtPublicKey: JwtPublicKey,
    authority: string
  ): RequestHandler =>
  async (req, res, next) => {
    try {
      await userService.authenticate({
        email: req.body.userName,
        password: req.body.password,
      });
      const email = req.body.userName;
      const jwt = await new EncryptJWT({
        username: email,
        roles: [],
      })
        .setProtectedHeader({
          alg: "RSA-OAEP-256",
          typ: "JWT",
          enc: "A256GCM",
        })
        .setIssuer("connect4-http-server")
        .setIssuedAt()
        .setExpirationTime("1 day from now")
        .setNotBefore("0 sec from now")
        .setSubject(email)
        .encrypt(jwtPublicKey);
      res
        .setHeader("Authorization", `Basic ${jwt}`)
        .status(200)
        .send({ notification: { uri: `ws://${authority}/notification` } });
    } catch (error) {
      res.status(403).send({ errors: ["Login attempt failed."] });
    }
    next();
  };

const registerRequestHandlerFactory =
  (userService: UserServiceInterface): RequestHandler =>
  (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    userService
      .create({ firstName, lastName, email, password })
      .then((user) => res.status(201).send(user))
      .catch((err: Error) => {
        res.status(403).send({ errors: [err.message] });
      })
      .catch(next);
  };

const userRouterFactory = (
  userService: UserServiceInterface,
  keySet: KeySet,
  authority: string
) => {
  const userRouter = express.Router();

  userRouter.get("/", userDetailsRequestHandlerFactory(userService));
  userRouter.post("/register", registerRequestHandlerFactory(userService));
  userRouter.post(
    "/login",
    loginRequestHandlerFactory(userService, keySet.jwtPublicKey, authority)
  );

  return userRouter;
};
export default userRouterFactory;
