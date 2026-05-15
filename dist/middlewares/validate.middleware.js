"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMiddleware = void 0;
const validateMiddleware = (schema, target) => async (req, res, next) => {
    try {
        const parsed = await schema.parseAsync(req[target]);
        req[target] = parsed;
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.validateMiddleware = validateMiddleware;
