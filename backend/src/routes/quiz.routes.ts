import { Router } from 'express';
import { createQuizResult, listQuizResults } from '../controllers/quiz.controller';
import { validateBody } from '../middleware/validate';
import { quizResultSchema } from '../schemas/quiz.schema';
import { requireAdmin } from '../middleware/auth';

export const quizRouter = Router();

quizRouter.post('/', validateBody(quizResultSchema), createQuizResult);
quizRouter.get('/', requireAdmin, listQuizResults);
