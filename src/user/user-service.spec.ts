import InMemoryUserRepository from "./in-memory-user-repository";
import UserService from "./user-service";

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
});
