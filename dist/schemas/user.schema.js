"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    phone: zod_1.z.string().min(10).max(12).optional(),
    address: zod_1.z.string().min(1).optional(),
    avatarUrl: zod_1.z.string().url().optional().nullable(),
});
exports.changePasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(8),
    newPassword: zod_1.z.string().min(8),
});
