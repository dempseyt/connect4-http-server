import { KeyLike } from "jose";

export type Stage = "production" | "test";

export type JwtPublicKey = KeyLike;

export type KeySet = {
  jwtPublicKey: JwtPublicKey;
};
