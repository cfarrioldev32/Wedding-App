import { Request, Response } from 'express';
import * as wishService from '../services/wish.service';

export const createWish = async (req: Request, res: Response): Promise<void> => {
  const { email, country, reason } = req.body as {
    email: string;
    country: string;
    reason: string;
  };
  if (!email) {
    res.status(400).json({ error: 'email is required' });
    return;
  }
  const result = await wishService.createWish({ email, country, reason });
  res.status(201).json({ id: result.id, createdAt: result.createdAt.toISOString() });
};

export const listWishes = async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const result = await wishService.listWishes(page, limit);
  res.json(result);
};

export const deleteWish = async (req: Request, res: Response): Promise<void> => {
  const deleted = await wishService.deleteWish(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Wish not found' });
    return;
  }
  res.status(204).send();
};
