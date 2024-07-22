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
const app_1 = __importDefault(require("@/app"));
const supertest_1 = __importDefault(require("supertest"));
describe("user-integration", () => {
    describe("register", () => {
        describe("given the user does not exist", () => {
            it("creates a user", () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.default).post("/user/register").send({
                    firstName: "John",
                    lastName: "Doe",
                    email: "johndoe@x.com",
                    password: "Hello123",
                });
                // expect(response.statusCode).toBe(201);
                expect(response.body).toEqual(expect.objectContaining({
                    firstName: "John",
                    lastName: "Doe",
                    email: "johndoe@x.com",
                    // @ts-ignore
                    uuid: expect.toBeUuid(),
                }));
                expect(response.headers["content-type"]).toMatch(/json/);
            }));
        });
        describe("given a user already exists with a given email", () => {
            it("forbids the creation of another user with that email", () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, supertest_1.default)(app_1.default).post("/user/register").send({
                    firstName: "John",
                    lastName: "Doe",
                    email: "johndoe@x.com",
                    password: "Hello123",
                });
                const response = yield (0, supertest_1.default)(app_1.default).post("/user/register").send({
                    firstName: "John",
                    lastName: "Doe",
                    email: "johndoe@x.com",
                    password: "Hello123",
                });
                expect(response.statusCode).toBe(403);
                expect(response.body).toEqual({
                    errors: ["A user with that email already exists"],
                });
                expect(response.headers["content-type"]).toMatch(/json/);
            }));
        });
        describe("given invalid user details", () => {
            it("forbids creation of user", () => __awaiter(void 0, void 0, void 0, function* () {
                const response = yield (0, supertest_1.default)(app_1.default).post("/user/register").send({
                    firstName: "Dempsey",
                    email: "dsons@gmux.com",
                });
                expect(response.statusCode).toBe(403);
                expect(response.body.errors).toEqual([
                    {
                        message: '"lastName" is required',
                        path: "lastName",
                    },
                    {
                        message: '"password" is required',
                        path: "password",
                    },
                ]);
                expect(response.headers["content-type"]).toMatch(/json/);
            }));
        });
    });
    describe("login", () => {
        // provide details
        // receive token
        // actions requiring authentication permitted when token is provided
        describe("given a use already exists", () => {
            describe("and they provide the correct credentials", () => {
                it("they are provided with a session token", () => { });
                expect(1).toEqual(1);
            });
        });
    });
});
