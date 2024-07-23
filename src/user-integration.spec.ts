import { default as appFactory } from "@/app";
import { generateKeyPair, jwtDecrypt } from "jose";
import { last, path, pipe, split } from "ramda";
import request, { Response } from "supertest";

describe("user-integration", () => {
  describe("register", () => {
    describe("given the user does not exist", () => {
      it("creates a user", async () => {
        const app = appFactory({
          routerParameters: { stage: "test" },
        });
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
        const app = appFactory({ routerParameters: { stage: "test" } });
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
        const app = appFactory({ routerParameters: { stage: "test" } });
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
    describe("given a user already exists", () => {
      describe("and they provide the correct credentials", () => {
        it("they are provided with a session token", async () => {
          jest.useFakeTimers({
            doNotFake: ["setImmediate"],
          });
          const dateTimestampInMilliSeconds = Date.now();
          jest.setSystemTime(dateTimestampInMilliSeconds);
          const { publicKey: jwtPublicKey, privateKey: jwtPrivateKey } =
            await generateKeyPair("PS256");

          const userDetails = {
            firstName: "Dung",
            lastName: "Eater",
            email: "dung.eater@gmail.com",
            password: "iamthedungeater",
          };
          const app = appFactory({
            routerParameters: {
              stage: "test",
              keySet: {
                jwtPublicKey,
              },
            },
          });
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
          const { protectedHeader, payload } = await jwtDecrypt(
            jwt,
            jwtPrivateKey
          );
          expect(protectedHeader).toEqual({
            alg: "RSA-OAEP-256",
            typ: "JWT",
            enc: "A256GCM",
          });
          const durationOfDayInSeconds = 24 * 60 * 60;
          const dateTimestampInSeconds = Math.trunc(
            dateTimestampInMilliSeconds / 1000
          );
          expect(payload).toEqual({
            iss: "connect4-http-server",
            iat: dateTimestampInSeconds,
            exp: dateTimestampInSeconds + durationOfDayInSeconds,
            sub: "dung.eater@gmail.com",
            nbf: dateTimestampInSeconds,
            username: "dung.eater@gmail.com",
            roles: [],
          });
          jest.useRealTimers();
        });
      });
      describe("and they provide incorrect credentials", () => {
        it("responds with http status code 403", async () => {
          const { publicKey: jwtPublicKey, privateKey: jwtPrivateKey } =
            await generateKeyPair("PS256");

          const userDetails = {
            firstName: "Dung",
            lastName: "Eater",
            email: "dung.eater@hotmail.com",
            password: "Hello124",
          };
          const app = appFactory({
            routerParameters: {
              stage: "test",
              keySet: {
                jwtPublicKey,
              },
            },
          });
          await request(app).post("/user/register").send(userDetails);
          const userCredentials = {
            userName: "dung.eater@hotmail.com",
            password: "incorrectpassword",
          };
          const response = await request(app)
            .post("/user/login")
            .send(userCredentials);
          expect(response.statusCode).toBe(403);
          expect(response.body.errors).toEqual(["Login attempt failed."]);
          expect(response.headers["content-type"]).toMatch(/json/);
        });
      });
    });
    describe("given credentials for a user that does not exist", () => {
      it("responds with http status code 403", async () => {
        const { publicKey: jwtPublicKey, privateKey: jwtPrivateKey } =
          await generateKeyPair("PS256");

        const app = appFactory({
          routerParameters: {
            stage: "test",
            keySet: {
              jwtPublicKey,
            },
          },
        });
        const userCredentials = {
          userName: "dung.eater@hotmail.com",
          password: "incorrectpassword",
        };
        const response = await request(app)
          .post("/user/login")
          .send(userCredentials);
        expect(response.statusCode).toBe(403);
        expect(response.body.errors).toEqual(["Login attempt failed."]);
        expect(response.headers["content-type"]).toMatch(/json/);
      });
    });
  });
});
