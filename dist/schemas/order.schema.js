"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEtaSchema = exports.updateOrderStatusSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("../generated/prisma/client");
exports.createOrderSchema = zod_1.z.object({
    merchantId: zod_1.z.string().uuid(),
    fulfillment: zod_1.z.nativeEnum(client_1.FulfillmentType),
    notes: zod_1.z.string().optional(),
    items: zod_1.z
        .array(zod_1.z.object({
        serviceId: zod_1.z.string().uuid(),
        quantity: zod_1.z.number().int().positive(),
    }))
        .min(1),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.OrderStatus),
});
exports.updateEtaSchema = zod_1.z.object({
    estimationTime: zod_1.z.string().min(1),
});
