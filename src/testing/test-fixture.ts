import { Express } from "express";
import { generateKeyPair } from "jose";
import request from "supertest";
import appFactory from "../app";
import { UserDetails } from "./test-fixture.d";

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

  register = async (userDetails: UserDetails) =>
    await request(this.app)
      .post("/user/register")
      .send({ firstName: "John", lastName: "Doe", ...userDetails });
}

export default TestFixture;
