import InMemoryUserRepository from "./in-memory-user-repository";
import UserService from "./user-service";

const user1Details = {
  firstName: "John",
  lastName: "Doe",
  email: "john@doe.com",
};

describe("user-service", () => {
  describe("given the details of a user that does not exist", () => {
    it("creates the user", async () => {
      const userRepository = new InMemoryUserRepository();
      const userService = new UserService(userRepository);
      const user = await userService.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@doe.com",
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
    it('throws a "user already exists" error', () => {
      const userRepository = new InMemoryUserRepository();
      const userService = new UserService(userRepository);
      expect(async () => await userService.create(user1Details)).toThrow(
        new UserAlreadyExistsError("A user with that email already exists")
      );
    });
  });
});
