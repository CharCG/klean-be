import { z } from 'zod';
import { FulfillmentType, OrderStatus } from '../generated/prisma/client';

export const createOrderSchema = z.object({
  merchantId: z.string().uuid(),
  fulfillment: z.nativeEnum(FulfillmentType),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        serviceId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export const updateEtaSchema = z.object({
  estimationTime: z.string().min(1),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
export type UpdateEtaDto = z.infer<typeof updateEtaSchema>;
