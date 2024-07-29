describe("in-memory-invite-repository", () => {
  describe("given defaults of an invite", () => {
    it("creates the invite", async () => {
      const inMemoryInviteRepository = new InMemoryInviteRepository();
      const inviteDetails = {
        inviter: "john@mail.com",
        invitee: "gerald@mail.com",
      };
      const createdInvite = await inMemoryInviteRepository.create(
        inviteDetails
      );

      expect(createdInvite).toEqual({
        inviter: "john@mail.com",
        invitee: "gerald@mail.com",
        uuid: expect.toBeUuid(),
      });
    });
  });
});
