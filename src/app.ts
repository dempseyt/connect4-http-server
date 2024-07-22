import resolveRouters, { RouterType } from "@/user/resolve-routers";
import express from "express";
import { Env } from "./global";

const userRouter = resolveRouters(process.env.NODE_ENV as Env);
const app = express();
app.use(express.json());
app.use("/user", userRouter[RouterType.userRouter]);

export default app;
