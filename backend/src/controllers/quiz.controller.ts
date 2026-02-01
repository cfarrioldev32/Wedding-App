import { Request, Response } from 'express';
import * as quizService from '../services/quiz-result.service';

export const createQuizResult = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { score, percent, breakdown } = req.body as {
    email: string;
    score: number;
    percent: number;
    breakdown?: Record<string, unknown>;
  };
  if (!req.body.email) {
    res.status(400).json({ error: 'email is required' });
    return;
  }
  const result = await quizService.createQuizResult({
    email: req.body.email,
    score,
    percent,
    breakdown
  });
  res.status(201).json({ id: result.id, createdAt: result.createdAt.toISOString() });
};

export const listQuizResults = async (
  req: Request,
  res: Response
): Promise<void> => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const result = await quizService.listQuizResults(page, limit);
  res.json(result);
};
