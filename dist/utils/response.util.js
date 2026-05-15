"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppResponse = void 0;
const env_config_1 = require("../config/env.config");
class AppResponse {
    success;
    statusCode;
    message;
    data;
    error;
    stack;
    constructor(statusCode, message, data, error, stack) {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.message = message;
        if (data)
            this.data = data;
        if (error)
            this.error = error;
        if (env_config_1.env.NODE_ENV === 'development' && stack)
            this.stack = stack;
    }
    send(res) {
        res.status(this.statusCode).json(this);
    }
    static success(statusCode = 200, message, data) {
        return new AppResponse(statusCode, message, data);
    }
    static fail(statusCode = 400, message, data, error) {
        return new AppResponse(statusCode, message, data, error);
    }
    static error(statusCode = 500, message, data, error, stack) {
        return new AppResponse(statusCode, message, data, error, stack);
    }
}
exports.AppResponse = AppResponse;
