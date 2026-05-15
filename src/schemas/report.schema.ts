import { z } from 'zod';

export const createReportSchema = z.object({
  issue: z.string().min(1),
});

export type CreateReportDto = z.infer<typeof createReportSchema>;
