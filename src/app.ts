import resolveRouters from "@/user/resolve-routers";
import express from "express";
import { Env } from "./global";
import userRouterFactory from "./user/user-router-factory";

const userRouter = resolveRouters(process.env.NODE_ENV as Env);
const app = express();
const port = 3000;
app.use(express.json());
app.use("/user", userRouterFactory);

export default app;
