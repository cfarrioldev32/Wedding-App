import { QuizAnswers, QuizQuestion, QuizScoreResult } from './quiz.models';

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export const getMaxScore = (questions: QuizQuestion[]): number => {
  return sum(
    questions.map((question) => {
      if (question.options.length === 0) {
        return 0;
      }

      if (question.allowMultiple) {
        return sum(question.options.map((option) => option.points));
      }

      return Math.max(...question.options.map((option) => option.points));
    })
  );
};

export const computeScore = (
  answers: QuizAnswers,
  questions: QuizQuestion[]
): QuizScoreResult => {
  const breakdown = questions.map((question) => {
    const answer = answers[question.id];
    const selectedIds = Array.isArray(answer)
      ? answer
      : answer
        ? [answer]
        : [];

    const selectedOptions = question.options.filter((option) =>
      selectedIds.includes(option.id)
    );

    const points = sum(selectedOptions.map((option) => option.points));

    const maxPoints = question.options.length
      ? question.allowMultiple
        ? sum(question.options.map((option) => option.points))
        : Math.max(...question.options.map((option) => option.points))
      : 0;

    return {
      questionId: question.id,
      questionText: question.text,
      selectedOptionIds: selectedOptions.map((option) => option.id),
      selectedLabels: selectedOptions.map((option) => option.label),
      points,
      maxPoints
    };
  });

  const total = sum(breakdown.map((item) => item.points));
  const max = getMaxScore(questions);
  const percent = max === 0 ? 0 : (total / max) * 100;

  return {
    total,
    max,
    percent,
    breakdown
  };
};
