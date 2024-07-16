import app from "@/app";
import request from "supertest";

describe("user-integration", () => {
  describe("register", () => {
    describe("given the user does not exist", () => {
      it.skip("creates a user", async () => {
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
            // @ts-ignore
            uuid: expect.toBeUuid(),
          })
        );
        expect(response.headers["Content-Type"]).toMatch(/json/);
      });
    });
  });
});
