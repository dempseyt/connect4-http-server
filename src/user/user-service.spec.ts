import argon2 from "argon2";
import InMemoryUserRepository from "./in-memory-user-repository";
import UserService, {
  LoginFailedError,
  UserAlreadyExistsError,
} from "./user-service";

describe("user-service", () => {
  describe("user creation", () => {
    describe("given the details of a user that does not exist", () => {
      it("creates the user", async () => {
        const userRepository = new InMemoryUserRepository();
        const userService = new UserService(userRepository);
        const user = await userService.create({
          firstName: "John",
          lastName: "Doe",
          email: "john@doe.com",
          password: "Hello123",
        });
        expect(user).toEqual(
          expect.objectContaining({
            firstName: "John",
            lastName: "Doe",
            email: "john@doe.com",
            // @ts-ignore
            uuid: expect.toBeUuid(),
          })
        );
      });
    });
    describe("given an email that is already associated with an existing user", () => {
      it('throws a "user already exists" error', async () => {
        const userRepository = new InMemoryUserRepository();
        const userService = new UserService(userRepository);
        await userService.create({
          firstName: "John",
          lastName: "Doe",
          email: "john@doe.com",
          password: "trumpIsHim",
        });
        expect(
          userService.create({
            firstName: "John",
            lastName: "Doe",
            email: "john@doe.com",
            password: "Hello123",
          })
        ).rejects.toThrow(
          new UserAlreadyExistsError("A user with that email already exists")
        );
      });
    });
    describe("given a user with a plain text password", () => {
      it("creates the user with a hashed password", async () => {
        const userRepository = new InMemoryUserRepository();
        const userService = new UserService(userRepository);
        const user = await userService.create({
          firstName: "Bob",
          lastName: "Katter",
          email: "crocHunter@hotmail.com",
          password: "Hello123",
        });
        expect(await argon2.verify(user.password, "Hello123")).toBeTruthy();
      });
    });
  });
  describe("user login", () => {
    describe("given a registered user", () => {
      describe("and invalid credentials for that user", () => {
        it("throws a 'Login failed' error", async () => {
          const userRepository = new InMemoryUserRepository();
          const userService = new UserService(userRepository);
          const userDetails = {
            firstName: "Joe",
            lastName: "Biden",
            email: "icanlead@lies.com",
            password: "godblessamerica",
          };
          await userService.create(userDetails);
          const userCredentials = {
            email: "icanlead@lies.com",
            password: "wrongpassword",
          };
          expect(userService.login(userCredentials)).rejects.toThrow(
            new LoginFailedError("Login failed")
          );
        });
      });
    });
  });
});
