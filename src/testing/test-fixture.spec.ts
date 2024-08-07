import TestFixture from "./test-fixture";

describe("test-fixture", () => {
  describe("given defaults", () => {
    it("creates an app", () => {
      const testFixture = new TestFixture();
      expect(testFixture).toBeInstanceOf(TestFixture);
    });
  });
});
