import { z } from 'zod';
import { UnitType } from '../generated/prisma/client';

export const createServiceSchema = z.object({
  name: z.string().min(2),
  price: z.number().int().positive(),
  unit: z.nativeEnum(UnitType),
  description: z.string().min(5),
  isAvailable: z.boolean().default(true),
});

export const updateServiceSchema = z.object({
  name: z.string().min(2).optional(),
  price: z.number().int().positive().optional(),
  unit: z.nativeEnum(UnitType).optional(),
  description: z.string().min(5).optional(),
  isAvailable: z.boolean().optional(),
});

export type CreateServiceDto = z.infer<typeof createServiceSchema>;
export type UpdateServiceDto = z.infer<typeof updateServiceSchema>;
