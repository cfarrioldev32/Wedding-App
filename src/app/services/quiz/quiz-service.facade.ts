import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiQuizRepository } from './api-quiz.repository';
import { LocalQuizRepository } from './local-quiz.repository';
import { QuizResultPayload } from './quiz-repository';

@Injectable({
  providedIn: 'root'
})
export class QuizServiceFacade {
  constructor(
    private readonly apiRepo: ApiQuizRepository,
    private readonly localRepo: LocalQuizRepository
  ) {}

  submitResult(payload: QuizResultPayload): Observable<void> {
    if (!environment.useBackend) {
      return this.localRepo.saveResult(payload);
    }

    return this.apiRepo.saveResult(payload).pipe(
      catchError((error) => {
        if (!environment.fallbackToLocalStorage) {
          return throwError(() => error);
        }
        return this.localRepo.saveResult(payload);
      })
    );
  }
}
