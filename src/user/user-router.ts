import getIsUserAuthorised from "@/get-is-user-authorised";
import { JwtPublicKey, KeySet } from "@/global";
import express, { RequestHandler } from "express";
import { EncryptJWT, KeyLike } from "jose";
import { UserServiceInterface } from "./user-service";

const userDetailsRequestHandlerFactory =
  (userService: UserServiceInterface, privateKey: KeyLike): RequestHandler =>
  async (req, res, next) => {
    const { email } = req.body;
    const authorisationToken = req.headers.authorisation as string;

    const isAuthorised = await getIsUserAuthorised(
      authorisationToken,
      privateKey,
      email
    );

    if (isAuthorised) {
      const userDetails = await userService.getUserDetails(email);
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
    jwtPublicKey?: JwtPublicKey
  ): RequestHandler =>
  async (req, res, next) => {
    const isAuthenticated = await Promise.resolve(
      userService.authenticate({
        email: req.body.userName,
        password: req.body.password,
      })
    )
      .then(() => true)
      .catch(() => false);

    if (isAuthenticated) {
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
      res.appendHeader("authorisation", jwt).send();
      next();
    } else {
      res.status(403).send({ errors: ["Login attempt failed."] });
    }
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
  keySet: KeySet
) => {
  const userRouter = express.Router();

  userRouter.get(
    "/",
    userDetailsRequestHandlerFactory(userService, keySet.jwtPrivateKey)
  );
  userRouter.post("/register", registerRequestHandlerFactory(userService));
  userRouter.post(
    "/login",
    loginRequestHandlerFactory(userService, keySet?.jwtPublicKey)
  );

  return userRouter;
};
export default userRouterFactory;
