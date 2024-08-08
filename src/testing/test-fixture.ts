import { Express } from "express";
import request, { Response } from "supertest";
import { InviteDetails, UserCredentials, UserDetails } from "./test-fixture.d";

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
    await request(this.app)
      .post("/user/register")
      .send({ firstName: "John", lastName: "Doe", ...userDetails });

  login = async (userCredentials: UserCredentials) =>
    await request(this.app).post("/user/login").send(userCredentials);

  invite = async ({ inviter, invitee, authorization }: InviteDetails) =>
    await request(this.app)
      .post("/invite")
      .set("Authorization", authorization)
      .send({ inviter, invitee });
}

export default TestFixture;
