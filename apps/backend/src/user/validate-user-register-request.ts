import express from "express";
import validateUserRegisterRequestBody from "./validate-user-register-request-body";

export default express.Router().post("/register", (req, res, next) => {
  const validationResult = validateUserRegisterRequestBody(req.body);
  if (validationResult.isValid) {
    next();
  } else {
    res.status(403).send({ errors: validationResult.errors });
  }
});
