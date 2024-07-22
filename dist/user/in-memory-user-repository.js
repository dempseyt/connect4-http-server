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
Object.defineProperty(exports, "__esModule", { value: true });
class InMemoryUserRepository {
    constructor() {
        this.users = new Map();
    }
    create(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const userUuid = crypto.randomUUID();
            yield this.users.set(userUuid, Object.assign(Object.assign({}, user), { uuid: userUuid }));
            return Promise.resolve(Object.assign(Object.assign({}, user), { uuid: userUuid }));
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(Array.from(this.users.values()).filter((user) => user.email === email));
        });
    }
}
exports.default = InMemoryUserRepository;
