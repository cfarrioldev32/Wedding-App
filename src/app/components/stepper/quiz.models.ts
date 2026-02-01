export interface QuizOption {
  id: string;
  label: string;
  points: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  allowMultiple?: boolean;
  imageUrl?: string;
  imageAlt?: string;
}

export type QuizAnswerValue = string | string[];

export type QuizAnswers = Record<string, QuizAnswerValue>;

export interface QuestionBreakdown {
  questionId: string;
  questionText: string;
  selectedOptionIds: string[];
  selectedLabels: string[];
  points: number;
  maxPoints: number;
}

export interface QuizScoreResult {
  total: number;
  max: number;
  percent: number;
  breakdown: QuestionBreakdown[];
}
