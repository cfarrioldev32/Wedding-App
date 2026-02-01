import { z } from 'zod';

export const registrationSchema = z
  .object({
    email: z.string().email(),
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    country: z.string().min(2).max(56)
  })
  .strict();
