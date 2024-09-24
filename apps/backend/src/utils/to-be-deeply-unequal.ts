function getIsPlainObjectOrArray(value: any): value is object | any[] {
  return (
    (value !== null &&
      typeof value === "object" &&
      Object.getPrototypeOf(value) === Object.prototype) ||
    Array.isArray(value)
  );
}

function getIsDeeplyUnequal(value1: any, value2: any): boolean {
  if (
    (getIsPlainObjectOrArray(value1) && !getIsPlainObjectOrArray(value2)) ||
    (!getIsPlainObjectOrArray(value1) && getIsPlainObjectOrArray(value2)) ||
    (!getIsPlainObjectOrArray(value1) && !getIsPlainObjectOrArray(value2))
  ) {
    return true;
  }

  if (value1 === value2) return false;

  const objectKeys1 = Object.keys(value1);

  const isDeepUnequal = objectKeys1.reduce((isDeepUnequal, currentKey) => {
    return (
      isDeepUnequal &&
      getIsDeeplyUnequal(value1[currentKey], value2[currentKey])
    );
  }, true);

  return isDeepUnequal;
}

function toBeDeeplyUnequal(
  this: { isNot: boolean } | void,
  received: object,
  expected: object,
) {
  const isNot = this ?? {};
  const areObjectsDifferent = getIsDeeplyUnequal(received, expected);
  return {
    pass: areObjectsDifferent,
    message: () => `Objects are deeply ${isNot ? "un" : ""}equal`,
  };
}

export default toBeDeeplyUnequal;
