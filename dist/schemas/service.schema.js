"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServiceSchema = exports.createServiceSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("../generated/prisma/client");
exports.createServiceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    price: zod_1.z.number().int().positive(),
    unit: zod_1.z.nativeEnum(client_1.UnitType),
    description: zod_1.z.string().min(5),
    isAvailable: zod_1.z.boolean().default(true),
});
exports.updateServiceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    price: zod_1.z.number().int().positive().optional(),
    unit: zod_1.z.nativeEnum(client_1.UnitType).optional(),
    description: zod_1.z.string().min(5).optional(),
    isAvailable: zod_1.z.boolean().optional(),
});
