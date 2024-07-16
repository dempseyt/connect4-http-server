"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRouter = express_1.default.Router();
userRouter.post("/register", (req, res, next) => {
    const { firstName, lastName, email } = req.body;
    userService
        .create({ firstName, lastName, email })
        .then((user) => res.send(user))
        .catch(next);
    res.send({});
});
exports.default = userRouter;
