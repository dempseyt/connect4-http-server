import { default as appFactory } from "@/app";
import { generateKeyPair, jwtDecrypt } from "jose";
import { last, path, pipe, split } from "ramda";
import request, { Response } from "supertest";

describe("user-integration", () => {
  let app;
  let jwtKeyPair;

  beforeAll(async () => {
    jwtKeyPair = await generateKeyPair("RS256");
  });

  beforeEach(async () => {
    app = appFactory({
      routerParameters: {
        stage: "test",
        keySet: {
          jwtPublicKey: jwtKeyPair.publicKey,
          jwtPrivateKey: jwtKeyPair.privateKey,
        },
      },
    });
  });
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
    describe("given a user already exists", () => {
      describe("and they provide the correct credentials", () => {
        it("they are provided with a session token", async () => {
          jest.useFakeTimers({
            doNotFake: ["setImmediate"],
          });
          const dateTimestampInMilliSeconds = Date.now();
          jest.setSystemTime(dateTimestampInMilliSeconds);

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

          const { protectedHeader, payload } = await jwtDecrypt(
            jwt,
            jwtKeyPair.privateKey
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
          const userDetails = {
            firstName: "Dung",
            lastName: "Eater",
            email: "dung.eater@hotmail.com",
            password: "Hello124",
          };

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
  describe("user", () => {
    describe("given the user does not provide an authorisation token", () => {
      describe("when they attempt to view their user details", () => {
        it("responds with http status code 401", async () => {
          const response = await request(app).get("/user").send();
          expect(response.statusCode).toBe(401);
          expect(response.body.errors).toEqual([
            "You must be logged in to view your user details",
          ]);
        });
      });
    });
    describe("given a user provided with an authorisation token", () => {
      describe("and their token is invalid", () => {
        it("responds with http status code 401", async () => {
          const response = await request(app)
            .get("/user")
            .set("Authorization", "blahblah")
            .send({
              email: "email@email.com",
            });
          expect(response.statusCode).toBe(401);
          expect(response.body.errors).toEqual([
            "You must be logged in to view your user details",
          ]);
        });
      });
      describe("and the token is expired", () => {
        it("responds with http status code 401", async () => {
          jest.useFakeTimers({
            doNotFake: ["setImmediate"],
          });

          const userDetails = {
            firstName: "John",
            lastName: "Doe",
            email: "johndoe@hotmail.com",
            password: "password",
          };
          await request(app).post("/user/register").send(userDetails);
          const userCredentials = {
            userName: "johndoe@hotmail.com",
            password: "password",
          };
          const loginResponse = await request(app)
            .post("/user/login")
            .send(userCredentials);
          const authorisationHeaderField = loginResponse.header.authorization;

          jest.setSystemTime(20000);

          const response = await request(app)
            .get("/user")
            .set("Authorization", authorisationHeaderField)
            .send({
              email: "johndoe@hotmail.com",
            });
          expect(response.statusCode).toBe(401);
          expect(response.body.errors).toEqual([
            "You must be logged in to view your user details",
          ]);
          jest.useRealTimers();
        });
      });
      describe("and their token is valid", () => {
        it("responds with the user's details", async () => {
          const userDetails = {
            firstName: "John",
            lastName: "Doe",
            email: "johndoe@hotmail.com",
            password: "password",
          };
          await request(app).post("/user/register").send(userDetails);
          const userCredentials = {
            userName: "johndoe@hotmail.com",
            password: "password",
          };
          const loginResponse = await request(app)
            .post("/user/login")
            .send(userCredentials);
          const authorisationHeaderField = loginResponse.header.authorization;

          const response = await request(app)
            .get("/user")
            .set("Authorization", authorisationHeaderField)
            .send({
              email: "johndoe@hotmail.com",
            });

          expect(response.statusCode).toBe(200);
          expect(response.body).toEqual({
            firstName: "John",
            lastName: "Doe",
            email: "johndoe@hotmail.com",
          });
        });
      });
    });
  });
});
