import { z } from 'zod';
import { BankType, ApplicationStatus } from '../generated/prisma/client';

export const createApplicationSchema = z.object({
  businessName: z.string().min(1),
  businessOwner: z.string().min(1),
  businessPhone: z.string().min(10).max(12),
  businessEmail: z.string().email(),
  businessAddress: z.string().min(1),
  businessDescription: z.string().min(1),
  openTime: z.string(),
  closeTime: z.string(),
  bankType: z.nativeEnum(BankType),
  bankAccount: z.string().min(10).max(15),
  bankHolder: z.string().min(1),
  documentUrl: z.string().url(),
});

export const decideApplicationSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
});

export type CreateApplicationDto = z.infer<typeof createApplicationSchema>;
export type DecideApplicationDto = z.infer<typeof decideApplicationSchema>;
