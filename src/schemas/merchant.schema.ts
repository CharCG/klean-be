import { z } from 'zod';
import { BankType } from '../generated/prisma/client';

export const updateMerchantProfileSchema = z.object({
  address: z.string().min(1).optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  businessPhone: z.string().min(10).max(12).optional(),
  businessDescription: z.string().min(1).optional(),
  logoUrl: z.string().url().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
  bankName: z.nativeEnum(BankType).optional(),
  bankAccountNumber: z.string().min(10).max(15).optional(),
  bankAccountHolder: z.string().min(1).optional(),
});

export type UpdateMerchantProfileDto = z.infer<typeof updateMerchantProfileSchema>;
