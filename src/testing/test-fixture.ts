import { Express } from "express";
import request, { Response } from "supertest";
import {
  GetInviteDetails,
  SendInviteDetails,
  UserCredentials,
  UserDetails,
} from "./types";

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

  login = async ({ email: userName, password }: UserCredentials) =>
    await request(this.app).post("/user/login").send({ userName, password });

  sendInvite = async ({ inviter, invitee, authorization }: SendInviteDetails) =>
    await request(this.app)
      .post("/invite")
      .set("Authorization", authorization)
      .send({ inviter, invitee });

  getInvites = async ({ email, authorization }: GetInviteDetails) =>
    await request(this.app)
      .get("/invite/inbox")
      .set("Authorization", authorization);

  registerAndLogin = async (email: string, password: string) => {
    await request(this.app)
      .post("/user/register")
      .send({ firstName: "Johnny", lastName: "Doe", email, password });

    return (
      await request(this.app)
        .post("/user/login")
        .send({ userName: email, password })
    ).headers.authorization;
  };
}

export default TestFixture;
