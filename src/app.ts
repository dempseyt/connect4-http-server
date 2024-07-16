import userRouter from "@/user/user-router";
import express from "express";

const app = express();
const port = 3000;

app.use("/user", userRouter);
export default app;
