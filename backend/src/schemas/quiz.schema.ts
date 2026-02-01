import { z } from 'zod';

export const quizResultSchema = z
  .object({
    email: z.string().email(),
    score: z.number().min(0).max(10000),
    percent: z.number().min(0).max(100),
    breakdown: z.record(z.unknown()).optional()
  })
  .strict();
