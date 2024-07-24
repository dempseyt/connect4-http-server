import { jwtDecrypt, jwtVerify, KeyLike } from "jose";

const getIsUserAuthorised = async (
  token: string,
  privateKey: KeyLike,
  email: string
) => {
  try {
    await jwtDecrypt(token, privateKey);
    await jwtVerify(token, privateKey);
  } catch (err) {
    return false;
  }
};

export default getIsUserAuthorised;
