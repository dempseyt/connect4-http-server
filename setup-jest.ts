import toBeDeeplyUnequal from "./src/utils/to-be-deeply-unequal";
import toBeUuid from "./src/utils/to-be-uuid";
expect.extend({
  toBeUuid,
  toBeDeeplyUnequal,
});
