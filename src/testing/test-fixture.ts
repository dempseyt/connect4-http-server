import { Express } from "express";
import { generateKeyPair } from "jose";
import appFactory from "../app";

interface TestFixture {}

class TestFixture implements TestFixture {
  app: Express;
  constructor(app?: Express) {
    this.app =
      app ??
      appFactory({
        routerParameters: {
          stage: "test",
          keySet: generateKeyPair("RS256"),
        },
      });
  }
}

export default TestFixture;
