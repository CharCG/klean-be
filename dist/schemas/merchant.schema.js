"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMerchantProfileSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("../generated/prisma/client");
exports.updateMerchantProfileSchema = zod_1.z.object({
    address: zod_1.z.string().min(1).optional(),
    openTime: zod_1.z.string().optional(),
    closeTime: zod_1.z.string().optional(),
    businessPhone: zod_1.z.string().min(10).max(12).optional(),
    businessDescription: zod_1.z.string().min(1).optional(),
    logoUrl: zod_1.z.string().url().optional().nullable(),
    bannerUrl: zod_1.z.string().url().optional().nullable(),
    bankName: zod_1.z.nativeEnum(client_1.BankType).optional(),
    bankAccountNumber: zod_1.z.string().min(10).max(15).optional(),
    bankAccountHolder: zod_1.z.string().min(1).optional(),
});
