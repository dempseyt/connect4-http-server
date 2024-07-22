import { UserRegisterRequestBody } from "@/user/user-router";
import { ValidationResult } from "@/validation";
import Joi, { ValidationErrorItem } from "joi";
import { applySpec, join, map, path, pipe, prop } from "ramda";

const schema = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

function validateUserRegisterRequestBody(
  userRegisterRequestBody: UserRegisterRequestBody
): ValidationResult {
  const validationResult = schema.validate(userRegisterRequestBody, {
    abortEarly: false,
  });
  const isValid = schema.validate(userRegisterRequestBody).error === undefined;
  if (!isValid) {
    return {
      isValid,
      errors: pipe<
        [Joi.ValidationResult],
        ValidationErrorItem[],
        { message: string; path: string }[]
      >(
        path(["error", "details"]),
        map(
          applySpec({
            message: prop("message"),
            path: pipe(prop("path"), join(".")),
          })
        )
      )(validationResult),
    };
  }
  return { isValid };
}

export default validateUserRegisterRequestBody;
