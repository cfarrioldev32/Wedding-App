import { computeScore, getMaxScore } from './quiz-score.utils';
import { QuizAnswers, QuizQuestion } from './quiz.models';

describe('quiz score utils', () => {
  const questions: QuizQuestion[] = [
    {
      id: 'q1',
      text: 'Pregunta 1',
      options: [
        { id: 'A', label: 'A', points: 0 },
        { id: 'B', label: 'B', points: 10 }
      ]
    },
    {
      id: 'q2',
      text: 'Pregunta 2',
      allowMultiple: true,
      options: [
        { id: 'A', label: 'A', points: 3 },
        { id: 'B', label: 'B', points: 5 }
      ]
    }
  ];

  it('computes max score based on questions', () => {
    expect(getMaxScore(questions)).toBe(18);
  });

  it('computes total, percent and breakdown', () => {
    const answers: QuizAnswers = {
      q1: 'B',
      q2: ['A']
    };

    const result = computeScore(answers, questions);

    expect(result.total).toBe(13);
    expect(result.max).toBe(18);
    expect(result.percent).toBeCloseTo((13 / 18) * 100, 3);
    expect(result.breakdown.length).toBe(2);
    expect(result.breakdown[0].selectedOptionIds).toEqual(['B']);
    expect(result.breakdown[1].selectedOptionIds).toEqual(['A']);
  });
});
