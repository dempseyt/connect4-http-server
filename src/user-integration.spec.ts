import app from "@/app";
import jose from "jose";
import { last, path, pipe, split } from "ramda";
import request from "supertest";

describe("user-integration", () => {
  describe("register", () => {
    describe("given the user does not exist", () => {
      it("creates a user", async () => {
        const response = await request(app).post("/user/register").send({
          firstName: "John",
          lastName: "Doe",
          email: "johndoe@x.com",
          password: "Hello123",
        });
        // expect(response.statusCode).toBe(201);
        expect(response.body).toEqual(
          expect.objectContaining({
            firstName: "John",
            lastName: "Doe",
            email: "johndoe@x.com",
            // @ts-ignore
            uuid: expect.toBeUuid(),
          })
        );
        expect(response.headers["content-type"]).toMatch(/json/);
      });
    });
    describe("given a user already exists with a given email", () => {
      it("forbids the creation of another user with that email", async () => {
        await request(app).post("/user/register").send({
          firstName: "John",
          lastName: "Doe",
          email: "johndoe@x.com",
          password: "Hello123",
        });
        const response = await request(app).post("/user/register").send({
          firstName: "John",
          lastName: "Doe",
          email: "johndoe@x.com",
          password: "Hello123",
        });
        expect(response.statusCode).toBe(403);
        expect(response.body).toEqual({
          errors: ["A user with that email already exists"],
        });
        expect(response.headers["content-type"]).toMatch(/json/);
      });
    });
    describe("given invalid user details", () => {
      it("forbids creation of user", async () => {
        const response = await request(app).post("/user/register").send({
          firstName: "Dempsey",
          email: "dsons@gmux.com",
        });
        expect(response.statusCode).toBe(403);
        expect(response.body.errors).toEqual([
          {
            message: '"lastName" is required',
            path: "lastName",
          },
          {
            message: '"password" is required',
            path: "password",
          },
        ]);
        expect(response.headers["content-type"]).toMatch(/json/);
      });
    });
  });
  describe("login", () => {
    describe("given a use already exists", () => {
      describe("and they provide the correct credentials", () => {
        it.skip("they are provided with a session token", async () => {
          const date = Date.now();
          jest.setSystemTime(date);
          const userDetails = {
            firstName: "Dung",
            lastName: "Eater",
            email: "dung.eater@gmail.com",
            password: "iamthedungeater",
          };
          await request(app).post("/user/register").send(userDetails);
          const userCredentials = {
            userName: "dung.eater@gmail.com",
            password: "iamthedungeater",
          };
          const loginResponse = await request(app)
            .post("/user/login")
            .send(userCredentials);

          const jwt = pipe<[Response], string, Array<string>, string>(
            path(["header", "authorization"]),
            split(" "),
            last
          )(loginResponse);

          const publicKey = new Uint8Array(
            Buffer.from(process.env.JWT_PUBLIC_KEY)
          );
          const { protectedHeader, payload } = await jose.jwtVerify(
            jwt,
            publicKey
          );
          expect(protectedHeader).toEqual({
            alg: "RS256",
            typ: "JWT",
          });
          const durationOfDayInMilliseconds = 24 * 60 * 60 * 1000;
          expect(payload).toEqual({
            iss: "connect4-http-gameserver",
            iat: date,
            exp: date + durationOfDayInMilliseconds,
            sub: "dung.eater@gmail.com",
            nbf: date,
            username: "dung.eater@gmail.com",
            roles: [],
          });
        });
      });
    });
  });
});
