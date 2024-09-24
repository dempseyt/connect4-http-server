import deepClone from "@/utils/deep-clone";

describe("deep-clone", () => {
  it("should return a primitive value as-is", () => {
    const original = 42;
    const cloned = deepClone(42);
    expect(cloned).toBe(original);
  });
  it("should return a deep copy of an array", () => {
    const original: [{ a: number }, number, number[]] = [{ a: 1 }, 2, [3, 4]];
    const cloned = deepClone(original);
    expect(cloned).not.toBe(original);
    expect(cloned[0]).not.toBe(original[0]);
    expect(cloned[0]).toBeInstanceOf(Object);
    expect(Object.keys(cloned[0])).toHaveLength(1);
    expect(cloned[0]["a"]).toStrictEqual(original[0]["a"]);
    expect(cloned[1]).toBe(original[1]);
    expect(cloned[2]).not.toBe(original[2]);
    expect(cloned[2][0]).toBe(original[2][0]);
    expect(cloned[2][1]).toBe(original[2][1]);
  });
  it("should return a deep copy of an object", () => {
    const original: { a: number; b: { c: string; d: number }; e: number[] } = {
      a: 42,
      b: { c: "hi", d: 9 },
      e: [3, 4],
    };
    const cloned = deepClone(original);
    expect(cloned).not.toBe(original);
    expect(cloned.a).toStrictEqual(original.a);
    expect(cloned.b).not.toBe(original.b);
    expect(cloned.b.c).toStrictEqual(original.b.c);
    expect(cloned.b.d).toStrictEqual(original.b.d);
    expect(cloned.e).not.toBe(original.e);
    expect(cloned.e[0]).toStrictEqual(original.e[0]);
    expect(cloned.e[1]).toStrictEqual(original.e[1]);
  });
  it("should copy functions by reference", () => {
    const original = (x: number) => 2 * x;
    const cloned = deepClone(original);
    expect(original(3)).toStrictEqual(cloned(3));
    expect(original).toBe(cloned);
  });
  it("should return an identical symbol given a symbol", () => {
    const original = Symbol("shdf");
    const cloned = deepClone(original);
    expect(cloned).toBe(original);
  });
  it("should deeply clone objects with circular references", () => {
    const original: { a: number; b?: object } = { a: 1 };
    original.b = original;
    const cloned = deepClone(original);
    expect(cloned).not.toBe(original);
    expect(cloned.b).toBe(cloned);
  });
  it("should properly deeply clone objects that use symbols as keys", () => {
    const symB: unique symbol = Symbol("b");
    const symD: unique symbol = Symbol("d");
    const original: { a: number; [symB]: { c: number; [symD]: number } } = {
      a: 1,
      [symB]: { c: 2, [symD]: 4 },
    };
    const cloned = deepClone(original);
    expect(cloned[symB]).not.toBe(original[symB]);
    expect(cloned[symB].c).toStrictEqual(original[symB].c);
    expect(cloned[symB][symD]).toStrictEqual(original[symB][symD]);
  });
  it('should return "null" as-is', () => {
    const original = null;
    const cloned = deepClone(original);
    expect(cloned).toBe(original);
  });
  it('should return "undefined" as-is', () => {
    const original = undefined;
    const cloned = deepClone(original);
    expect(cloned).toBe(original);
  });
});
