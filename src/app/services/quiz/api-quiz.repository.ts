import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { QuizRepository, QuizResultPayload } from './quiz-repository';

@Injectable({
  providedIn: 'root'
})
export class ApiQuizRepository implements QuizRepository {
  constructor(private readonly http: HttpClient) {}

  saveResult(payload: QuizResultPayload): Observable<void> {
    const url = `${environment.apiUrl.replace(/\/$/, '')}/api/quiz-results`;
    return this.http
      .post(url, {
        email: payload.email,
        score: payload.score,
        percent: payload.percent,
        breakdown: payload.breakdown
      })
      .pipe(map(() => undefined));
  }
}
