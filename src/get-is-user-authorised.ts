import { jwtDecrypt, KeyLike } from "jose";

const getIsUserAuthorised = async (
  token: string,
  privateKey: KeyLike,
  email: string
) => {
  try {
    const { payload } = await jwtDecrypt(token, privateKey);
    return payload.username === email;
  } catch (err) {
    return false;
  }
};

export default getIsUserAuthorised;
