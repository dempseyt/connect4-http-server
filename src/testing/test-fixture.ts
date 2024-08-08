import { Express } from "express";
import request, { Response } from "supertest";
import { UserCredentials, UserDetails } from "./test-fixture.d";

interface TestFixture {
  register: (userDetails: UserDetails) => Promise<Response>;
  login: (UserCredentials: UserCredentials) => Promise<Response>;
}

class TestFixture implements TestFixture {
  private app: Express;

  constructor(app: Express) {
    this.app = app;
  }

  register = async (userDetails: UserDetails) =>
    await request(this.app as Express)
      .post("/user/register")
      .send({ firstName: "John", lastName: "Doe", ...userDetails });

  login = async (userCredentials: UserCredentials) =>
    await request(this.app as Express)
      .post("/user/login")
      .send(userCredentials);
}

export default TestFixture;
