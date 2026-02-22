import { z } from 'zod';

export const registrationSchema = z
  .object({
    email: z.string().email(),
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    country: z.string().min(2).max(56),
    attendanceConfirmed: z.boolean(),
    attendeesCount: z.number().int().min(0).max(5)
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.attendanceConfirmed && value.attendeesCount < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'attendeesCount must be at least 1 when attendanceConfirmed is true',
        path: ['attendeesCount']
      });
    }
    if (!value.attendanceConfirmed && value.attendeesCount !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'attendeesCount must be 0 when attendanceConfirmed is false',
        path: ['attendeesCount']
      });
    }
  });
