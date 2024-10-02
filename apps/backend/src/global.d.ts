import { KeyLike } from "jose";

export type Stage = "production" | "test";

export type JwtPublicKey = KeyLike;
export type JwtPrivateKey = KeyLike;

export type KeySet = {
  jwtPublicKey: JwtPublicKey;
  jwtPrivateKey: JwtPrivateKey;
};

// export type InternalEventPublisher = (queue: string)
export type Uuid = `${string}-${string}-${string}-${string}`;

declare namespace NodeJS {
  interface ProcessEnv {
    STAGE: "DEV" | "PROD";
    PORT: number;
    JWT_PUBLIC_KEY: KeyLike;
    JWT_PRIVATE_KEY: KeyLike;
  }
}
