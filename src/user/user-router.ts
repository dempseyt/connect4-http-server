import validateUserRegisterRequestBody from "@/validate-user-register-request-body";
import express from "express";
import { UserServiceInterface } from "./user-service";

const loginRequestHandlerFactory =
  (userService: UserServiceInterface) => (req, res, next) => {};

const registerRequestHandlerFactory =
  (userService: UserServiceInterface) => (req, res, next) => {
    const { isValid, errors } = validateUserRegisterRequestBody(req.body);
    if (!isValid) {
      res.status(403).send({ errors });
    }
    const { firstName, lastName, email, password } = req.body;
    userService
      .create({ firstName, lastName, email, password })
      .then((user) => res.status(201).send(user))
      .catch((err: Error) => {
        res.status(403).send({ errors: [err.message] });
      })
      .catch(next);
  };

const userRouterFactory = (userService: UserServiceInterface) => {
  const userRouter = express.Router();

  userRouter.post("/register", registerRequestHandlerFactory(userService));
  userRouter.post("/login", loginRequestHandlerFactory(userService));

  return userRouter;
};
export default userRouterFactory;
