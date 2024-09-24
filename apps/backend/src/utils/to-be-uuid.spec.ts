import toBeUuid from "./to-be-uuid";

describe("toBeUuid", () => {
  describe("given a v4 UUID string", () => {
    const validUuid = "123e4567-e89b-12d3-a456-426614174000";
    it("returns a positive MatcherResult object", () => {
      expect(toBeUuid(validUuid)).toEqual({
        pass: true,
        message: expect.any(Function),
      });
    });
    it("returns the message function that outputs the valid message when invoked", () => {
      const { message } = toBeUuid(validUuid);
      expect(message()).toEqual(`${validUuid} is an invalid v4 UUID`);
    });
    describe("and we use the negated matcher", () => {
      it("should return a negative MatchResult", () => {
        const boundToBeUuid = toBeUuid.bind({ isNot: true });

        expect(boundToBeUuid(validUuid)).toEqual({
          pass: true,
          message: expect.any(Function),
        });
      });
      it("returns a message function that indicates the UUID is invalid when invoked", () => {
        const negatedToBeUuid = toBeUuid.bind({ isNot: true });
        const { message } = negatedToBeUuid(validUuid);
        expect(message()).toEqual(`${validUuid} is a valid v4 UUID`);
      });
    });
  });
  describe("given an invalid v4UUID string", () => {
    const invalidUuid = "1313432";
    it("returns a negative MatcherResult", () => {
      expect(toBeUuid(invalidUuid)).toEqual({
        pass: false,
        message: expect.any(Function),
      });
    });
    it("the return message function returns a valid message", () => {
      const { message } = toBeUuid(invalidUuid);

      expect(message()).toEqual(`${invalidUuid} is an invalid v4 UUID`);
    });
    describe("and we use the negated matcher", () => {
      it("should return a negative MatcherResult", () => {
        const negatedToBeUuid = toBeUuid.bind({ isNot: true });
        expect(negatedToBeUuid(invalidUuid)).toEqual({
          pass: false,
          message: expect.any(Function),
        });
      });
      it("returns a message function indicating the provided UUID is invalid", () => {
        const negatedToBeUuid = toBeUuid.bind({
          isNot: true,
        });
        const { message } = negatedToBeUuid(invalidUuid);

        expect(message()).toEqual(`${invalidUuid} is a valid v4 UUID`);
      });
    });
  });
});
