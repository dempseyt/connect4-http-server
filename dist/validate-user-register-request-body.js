"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const ramda_1 = require("ramda");
const schema = joi_1.default.object({
    firstName: joi_1.default.string().min(1).required(),
    lastName: joi_1.default.string().min(1).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required(),
});
function validateUserRegisterRequestBody(userRegisterRequestBody) {
    const validationResult = schema.validate(userRegisterRequestBody, {
        abortEarly: false,
    });
    const isValid = schema.validate(userRegisterRequestBody).error === undefined;
    if (!isValid) {
        return {
            isValid,
            errors: (0, ramda_1.pipe)((0, ramda_1.path)(["error", "details"]), (0, ramda_1.map)((0, ramda_1.applySpec)({
                message: (0, ramda_1.prop)("message"),
                path: (0, ramda_1.pipe)((0, ramda_1.prop)("path"), (0, ramda_1.join)(".")),
            })))(validationResult),
        };
    }
    return { isValid };
}
exports.default = validateUserRegisterRequestBody;
