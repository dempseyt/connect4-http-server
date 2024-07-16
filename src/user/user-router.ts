import express from "express";
const userRouter = express.Router();

type User = {};

userRouter.post("/register", (req, res, next) => {
  const { firstName, lastName, email } = req.body;
  userService
    .create({ firstName, lastName, email })
    .then((user: User) => res.send(user))
    .catch(next);
  res.send({});
});

export default userRouter;
