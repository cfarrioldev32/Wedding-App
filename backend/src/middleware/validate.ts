import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export const validateBody =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    schema.parse(req.body);
    next();
  };
