import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!env.ADMIN_TOKEN) {
    next();
    return;
  }
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = header.replace('Bearer ', '').trim();
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
};
