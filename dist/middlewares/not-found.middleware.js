"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundMiddleware = void 0;
const error_util_1 = require("../utils/error.util");
const notFoundMiddleware = (req, res, next) => {
    throw new error_util_1.NotFoundError();
};
exports.notFoundMiddleware = notFoundMiddleware;
