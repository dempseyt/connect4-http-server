import { EncryptJWT, generateKeyPair } from "jose";
import getIsUserAuthorised from "./get-is-user-authorised";

describe("get-is-user-authorised", () => {
  describe("given a token", () => {
    describe("which cannot be decrypted using the private key", () => {
      it("returns false", async () => {
        const { privateKey } = await generateKeyPair("RS256");
        const token = "fgojkhuiogutgh";
        expect(
          getIsUserAuthorised(token, privateKey, "email@email.com")
        ).resolves.toBe(false);
      });
    });
    describe("which is expired", () => {
      it("returns false", async () => {
        const { privateKey, publicKey } = await generateKeyPair("RS256");
        const token = await new EncryptJWT()
          .setProtectedHeader({ alg: "RSA-OAEP-256", enc: "A128CBC-HS256" })
          .setExpirationTime("1 day ago")
          .encrypt(publicKey);
        expect(
          getIsUserAuthorised(token, privateKey, "email@email.com")
        ).resolves.toBe(false);
      });
    });
    describe("which was not issued for the user", () => {
      it("returns false", async () => {
        const { privateKey, publicKey } = await generateKeyPair("RS256");
        const token = await new EncryptJWT({
          username: "notemail@notemail.com",
        })
          .setProtectedHeader({ alg: "RSA-OAEP-256", enc: "A128CBC-HS256" })
          .setExpirationTime("1 day ago")
          .encrypt(publicKey);
        expect(
          getIsUserAuthorised(token, privateKey, "email@email.com")
        ).resolves.toBe(false);
      });
    });
    describe("which is valid for the user", () => {
      it("returns true", async () => {
        const { privateKey, publicKey } = await generateKeyPair("RS256");
        const token = await new EncryptJWT({
          username: "email@email.com",
        })
          .setProtectedHeader({ alg: "RSA-OAEP-256", enc: "A128CBC-HS256" })
          .encrypt(publicKey);
        expect(
          getIsUserAuthorised(token, privateKey, "email@email.com")
        ).resolves.toBe(true);
      });
    });
  });
});
