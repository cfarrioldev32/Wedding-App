import { z } from 'zod';

export const wishSchema = z
  .object({
    email: z.string().email(),
    country: z.string().min(2).max(56),
    reason: z.string().min(20).max(500)
  })
  .strict();
