"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAlreadyExistsError = void 0;
const argon2_1 = __importDefault(require("argon2"));
const ramda_1 = require("ramda");
class UserAlreadyExistsError extends Error {
}
exports.UserAlreadyExistsError = UserAlreadyExistsError;
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    create(userDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, ramda_1.isEmpty)(yield this.userRepository.findByEmail(userDetails.email))) {
                return yield this.userRepository.create(Object.assign(Object.assign({}, userDetails), { password: yield argon2_1.default.hash(userDetails.password) }));
            }
            else {
                throw new UserAlreadyExistsError("A user with that email already exists");
            }
        });
    }
}
exports.default = UserService;
