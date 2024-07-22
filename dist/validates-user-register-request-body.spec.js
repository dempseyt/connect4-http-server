"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validate_user_register_request_body_1 = __importDefault(require("./validate-user-register-request-body"));
describe("validates-user-register-request-body", () => {
    describe("given a well-formatted user request", () => {
        it("passes validation", () => {
            const userRegisterRequestBody = {
                firstName: "John",
                lastName: "Doe",
                email: "john@doe.com",
                password: "Hello123",
            };
            const validationResult = (0, validate_user_register_request_body_1.default)(userRegisterRequestBody);
            expect(validationResult).toEqual({ isValid: true });
        });
    });
    describe("given a user signup request body missing a field", () => {
        it("fails validation", () => {
            const userRegisterRequestBody = {
                firstName: "Brad",
                lastName: "Gimp",
                email: "gimpy@hotmail.com",
            };
            const validationResult = (0, validate_user_register_request_body_1.default)(userRegisterRequestBody);
            expect(validationResult).toEqual({
                isValid: false,
                errors: [
                    {
                        message: '"password" is required',
                        path: "password",
                    },
                ],
            });
        });
    });
    describe("given a user register request body is missing multiple fields", () => {
        it("fails validation", () => {
            const userRegisterRequestBody = {
                firstName: "Dempsey",
                password: "NotSecure",
            };
            const validationResult = (0, validate_user_register_request_body_1.default)(userRegisterRequestBody);
            expect(validationResult).toEqual({
                isValid: false,
                errors: [
                    {
                        message: '"lastName" is required',
                        path: "lastName",
                    },
                    {
                        message: '"email" is required',
                        path: "email",
                    },
                ],
            });
        });
    });
});
