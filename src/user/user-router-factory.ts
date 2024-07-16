import express from "express";
import { UserServiceInterface } from "./user-service";

const userRouterFactory = (userService: UserServiceInterface) => {
  const userRouter = express.Router();
  userRouter.post("/register", (req, res, next) => {
    const { firstName, lastName, email } = req.body;
    userService
      .create({ firstName, lastName, email })
      .then((user) => res.status(201).send(user))
      .catch(next);
  });
  return userRouter;
};
export default userRouterFactory;
