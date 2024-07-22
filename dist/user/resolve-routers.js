"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterType = void 0;
const in_memory_user_repository_1 = __importDefault(require("./in-memory-user-repository"));
const user_router_factory_1 = __importDefault(require("./user-router-factory"));
const user_service_1 = __importDefault(require("./user-service"));
var RouterType;
(function (RouterType) {
    RouterType[RouterType["userRouter"] = 0] = "userRouter";
})(RouterType || (exports.RouterType = RouterType = {}));
const resolveRouters = (env) => {
    const userRepository = env !== "production"
        ? new in_memory_user_repository_1.default()
        : new in_memory_user_repository_1.default();
    const userService = new user_service_1.default(userRepository);
    return {
        [RouterType.userRouter]: (0, user_router_factory_1.default)(userService),
    };
};
exports.default = resolveRouters;
