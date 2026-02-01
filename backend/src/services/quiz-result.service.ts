import { QuizResultModel } from '../models/quiz-result.model';

export const createQuizResult = async (payload: {
  email: string;
  score: number;
  percent: number;
  breakdown?: Record<string, unknown>;
}): Promise<{ id: string; createdAt: Date }> => {
  const result = await QuizResultModel.create({
    email: payload.email,
    score: payload.score,
    percent: payload.percent,
    breakdown: payload.breakdown
  });

  return { id: result.id, createdAt: result.createdAt };
};

export const listQuizResults = async (page: number, limit: number) => {
  const safePage = Math.max(page, 1);
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    QuizResultModel.find().sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    QuizResultModel.countDocuments()
  ]);

  return {
    items,
    page: safePage,
    limit: safeLimit,
    total
  };
};
