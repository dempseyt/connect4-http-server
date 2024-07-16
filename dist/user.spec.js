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
const supertest_1 = __importDefault(require("supertest"));
const _1 = __importDefault(require("."));
describe("user-integration", () => {
    describe("register", () => {
        describe("given the user does not exist", () => {
            it("creates a user", () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(_1.default).post("/user/register").send({
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@doe.com",
                });
                expect(response.statusCode).toBe(201);
                expect(response.body).toEqual(expect.objectContaining({
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@doe.com",
                    // @ts-ignore
                    uuid: expect.toBeUuid(),
                }));
                expect(response.headers["Content-Type"]).toMatch(/json/);
            }));
        });
    });
});
