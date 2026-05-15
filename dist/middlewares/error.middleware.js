"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const error_util_1 = require("../utils/error.util");
const zod_1 = require("zod");
const response_util_1 = require("../utils/response.util");
const errorMiddleware = (err, req, res, next) => {
    if (err instanceof error_util_1.AppError) {
        response_util_1.AppResponse.error(err.statusCode, err.message, undefined, undefined, err.stack).send(res);
        return;
    }
    if (err instanceof zod_1.ZodError) {
        response_util_1.AppResponse.error(422, 'Validation Error', undefined, err.issues, err.stack).send(res);
        return;
    }
    response_util_1.AppResponse.error(500, 'Internal Server Error', undefined, undefined, err.stack).send(res);
};
exports.errorMiddleware = errorMiddleware;
