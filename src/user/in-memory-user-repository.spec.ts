import InMemoryUserRepositoryFactory from "./in-memory-user-repository";

describe("in-memory-user-repository", () => {
  describe("given the details for a user that does not exist", () => {
    it("creates a user", () => {
      const inMemoryUserRepository = new InMemoryUserRepositoryFactory();
      const createdUser = inMemoryUserRepository.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@doe.com",
      });
      expect(createdUser).toEqual(
        expect.objectContaining({
          firstName: "John",
          lastName: "Doe",
          email: "john@doe.com",
          //@ts-ignore
          uuid: expect.toBeUuid(),
        })
      );
    });
  });
});
