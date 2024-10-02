const { exportJWK, generateKeyPair } = require("jose");

const createKeyPair = async () => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  console.log(
    "PUBLIC KEY ################################################",
    JSON.stringify(await exportJWK(publicKey)),
  );
  console.log(
    "PRIVATE KEY ################################################",
    JSON.stringify(await exportJWK(privateKey)),
  );
};

createKeyPair();
