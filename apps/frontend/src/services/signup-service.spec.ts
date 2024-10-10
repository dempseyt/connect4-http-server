import SignupService from "./signup-service";

describe(`signup-service`, () => {
  describe(`given valid user details`, () => {
    it(`signs up the user`, async () => {
      const signupDetails = {
        firstName: "Khai",
        lastName: "Beasley-Zoof",
        email: "jon@mail.com",
        password: "password",
      };
      const signupService = new SignupService({
        backendUrl: "",
        userDetails: signupDetails,
      });
      expect(await signupService.registerRequest(signupDetails)).toEqual({
        token: expect.any(String),
        isSuccess: true,
      });
    });
  });
});
