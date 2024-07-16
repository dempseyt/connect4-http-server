import app from "@/app";
import request from "supertest";

const user1Details = {
  firstName: "John",
  lastName: "Doe",
  email: "john@doe.com",
};

describe("user-integration", () => {
  describe("register", () => {
    describe("given the user does not exist", () => {
      it.skip("creates a user", async () => {
        const response = await request(app)
          .post("/user/register")
          .send(user1Details);
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual(
          expect.objectContaining({
            firstName: "John",
            lastName: "Doe",
            email: "john@doe.com",
            // @ts-ignore
            uuid: expect.toBeUuid(),
          })
        );
        expect(response.headers["content-type"]).toMatch(/json/);
      });
    });
    describe("given a user already exists with a given email", () => {
      it("forbids the creation of another user with that email", async () => {
        await request(app).post("/user/register").send(user1Details);
        const response = await request(app)
          .post("/user/register")
          .send(user1Details);
        expect(response.statusCode).toBe(403);
        expect(response.body).toEqual({
          errors: ["A user with that email already exists"],
        });
        expect(response.headers["content-type"]).toMatch(/json/);
      });
    });
  });
});
