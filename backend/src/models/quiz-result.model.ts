import { Schema, model } from 'mongoose';

export interface QuizResultDocument {
  email: string;
  score: number;
  percent: number;
  breakdown?: Record<string, unknown>;
  createdAt: Date;
}

const quizResultSchema = new Schema<QuizResultDocument>({
  email: { type: String, required: true, lowercase: true, trim: true },
  score: { type: Number, required: true, min: 0 },
  percent: { type: Number, required: true, min: 0, max: 100 },
  breakdown: { type: Schema.Types.Mixed, required: false },
  createdAt: { type: Date, default: () => new Date() }
});

export const QuizResultModel = model<QuizResultDocument>(
  'QuizResult',
  quizResultSchema,
  'quiz_results'
);
