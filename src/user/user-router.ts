import { UserServiceInterface } from "@/user/user-service";
import express from "express";

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
