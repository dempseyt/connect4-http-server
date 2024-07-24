import { generateKeyPair } from "jose";

describe("get-is-user-authorised", () => {
  describe("given a token", () => {
    describe("which cannot be decrypted using the private key", () => {
      it("returns false", async () => {
        const { privateKey } = await generateKeyPair("RS256");
        const token = "fgojkhuiogutgh";
        expect(getIsUserAuthorised(token, privateKey)).toBe(false);
      });
    });
  });
});
