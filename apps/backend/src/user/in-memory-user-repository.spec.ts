import {
  default as InMemoryUserRepository,
  default as InMemoryUserRepositoryFactory,
} from "./in-memory-user-repository";

describe("in-memory-user-repository", () => {
  describe("given the details for a user that does not exist", () => {
    it("creates a user", async () => {
      const inMemoryUserRepository = new InMemoryUserRepositoryFactory();
      const createdUser = await inMemoryUserRepository.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@doe.com",
        password: "Hello123",
      });
      expect(createdUser).toEqual(
        expect.objectContaining({
          firstName: "John",
          lastName: "Doe",
          email: "john@doe.com",
          password: "Hello123",
          uuid: expect.toBeUuid(),
        })
      );
    });
  });
  describe("given an email address", () => {
    it("returns a list of users associated with the email", async () => {
      const inMemoryUserRepository = new InMemoryUserRepository();
      await inMemoryUserRepository.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@doe.com",
        password: "Hello123",
      });
      await inMemoryUserRepository.create({
        firstName: "Jane",
        lastName: "Watson",
        email: "jano@aus.com",
        password: "Hello123",
      });
      const users = await inMemoryUserRepository.findByEmail("john@doe.com");
      expect(users).toEqual([
        expect.objectContaining({
          firstName: "John",
          lastName: "Doe",
          email: "john@doe.com",
          password: "Hello123",
        }),
      ]);
    });
  });
});
