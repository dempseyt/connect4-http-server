import { jwtDecrypt, KeyLike } from "jose";
import { JWEInvalid } from "jose/errors";

const getIsUserAuthorised = async (token: string, privateKey: KeyLike) => {
  try {
    await jwtDecrypt(token, privateKey);
  } catch (err) {
    if (err instanceof JWEInvalid) {
      return false;
    }
  }
};

export default getIsUserAuthorised;
