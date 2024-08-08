import { Express } from "express";
import request, { Response } from "supertest";
import {
  GetInviteDetails,
  SendInviteDetails,
  UserCredentials,
  UserDetails,
} from "./test-fixture.d";

interface TestFixture {
  register: (userDetails: UserDetails) => Promise<Response>;
  login: (UserCredentials: UserCredentials) => Promise<Response>;
  sendInvite: (inviteDetails: SendInviteDetails) => Promise<Response>;
  getInvites: (getInviteDetails: GetInviteDetails) => Promise<Response>;
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

  sendInvite = async ({ inviter, invitee, authorization }: SendInviteDetails) =>
    await request(this.app)
      .post("/invite")
      .set("Authorization", authorization)
      .send({ inviter, invitee });

  getInvites = async ({ email, authorization }: GetInviteDetails) =>
    await request(this.app)
      .get("/invite/inbox")
      .set("Authorization", authorization);
}

export default TestFixture;
