"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decideApplicationSchema = exports.createApplicationSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("../generated/prisma/client");
exports.createApplicationSchema = zod_1.z.object({
    businessName: zod_1.z.string().min(1),
    businessOwner: zod_1.z.string().min(1),
    businessPhone: zod_1.z.string().min(10).max(12),
    businessEmail: zod_1.z.string().email(),
    businessAddress: zod_1.z.string().min(1),
    businessDescription: zod_1.z.string().min(1),
    openTime: zod_1.z.string(),
    closeTime: zod_1.z.string(),
    bankType: zod_1.z.nativeEnum(client_1.BankType),
    bankAccount: zod_1.z.string().min(10).max(15),
    bankHolder: zod_1.z.string().min(1),
    documentUrl: zod_1.z.string().url(),
});
exports.decideApplicationSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.ApplicationStatus),
});
