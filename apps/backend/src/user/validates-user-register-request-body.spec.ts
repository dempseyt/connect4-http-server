import { UserRegisterRequest } from "./types";
import validateUserRegisterRequestBody from "./validate-user-register-request-body";

describe("validates-user-register-request-body", () => {
  describe("given a well-formatted user request", () => {
    it("passes validation", () => {
      const userRegisterRequestBody = {
        firstName: "John",
        lastName: "Doe",
        email: "john@doe.com",
        password: "Hello123",
      };
      const validationResult = validateUserRegisterRequestBody(
        userRegisterRequestBody,
      );
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
      const validationResult = validateUserRegisterRequestBody(
        userRegisterRequestBody as UserRegisterRequest,
      );
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
      const validationResult = validateUserRegisterRequestBody(
        userRegisterRequestBody as UserRegisterRequest,
      );
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
