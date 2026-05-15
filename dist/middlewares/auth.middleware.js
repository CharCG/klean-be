"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminGuard = exports.merchantGuard = exports.customerGuard = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_util_1 = require("../utils/error.util");
const env_config_1 = require("../config/env.config");
const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        throw new error_util_1.UnauthorizedError('No token provided');
    }
    try {
        const token = header.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_config_1.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        throw new error_util_1.UnauthorizedError('Invalid or expired token');
    }
};
exports.authMiddleware = authMiddleware;
const customerGuard = (req, res, next) => {
    if (req.user?.role !== 'CUSTOMER' && req.user?.role !== 'MERCHANT' && req.user?.role !== 'ADMIN') {
        throw new error_util_1.UnauthorizedError('Access denied');
    }
    next();
};
exports.customerGuard = customerGuard;
const merchantGuard = (req, res, next) => {
    if (req.user?.role !== 'MERCHANT' && req.user?.role !== 'ADMIN') {
        throw new error_util_1.UnauthorizedError('Access denied');
    }
    next();
};
exports.merchantGuard = merchantGuard;
const adminGuard = (req, res, next) => {
    if (req.user?.role !== 'ADMIN') {
        throw new error_util_1.UnauthorizedError('Access denied');
    }
    next();
};
exports.adminGuard = adminGuard;
