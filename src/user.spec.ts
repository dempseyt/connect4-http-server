import request from "supertest";
import app from ".";

describe("user-integration", () => {
  describe("register", () => {
    describe("given the user does not exist", () => {
      it("creates a user", async () => {
        const response = await request(app).post("/user/register").send({
          firstName: "John",
          lastName: "Doe",
          email: "john@doe.com",
        });
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual(
          expect.objectContaining({
            firstName: "John",
            lastName: "Doe",
            email: "john@doe.com",
            uuid: expect.toBeUuid(),
          })
        );
        expect(response.headers["Content-Type"]).toMatch(/json/);
      });
    });
  });
});
