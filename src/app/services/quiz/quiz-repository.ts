import { Observable } from 'rxjs';

export interface QuizResultPayload {
  email: string;
  score: number;
  percent: number;
  breakdown?: Record<string, unknown>;
}

export interface QuizRepository {
  saveResult(payload: QuizResultPayload): Observable<void>;
}
