"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validate_user_register_request_body_1 = __importDefault(require("@/validate-user-register-request-body"));
const express_1 = __importDefault(require("express"));
const userRouterFactory = (userService) => {
    const userRouter = express_1.default.Router();
    userRouter.post("/register", (req, res, next) => {
        const { isValid, errors } = (0, validate_user_register_request_body_1.default)(req.body);
        if (!isValid) {
            res.status(403).send({ errors });
        }
        next();
    });
    userRouter.post("/register", (req, res, next) => {
        const { firstName, lastName, email, password } = req.body;
        userService
            .create({ firstName, lastName, email, password })
            .then((user) => res.status(201).send(user))
            .catch((err) => {
            res.status(403).send({ errors: [err.message] });
        })
            .catch(next);
    });
    return userRouter;
};
exports.default = userRouterFactory;
