import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { QuizRepository, QuizResultPayload } from './quiz-repository';

@Injectable({
  providedIn: 'root'
})
export class LocalQuizRepository implements QuizRepository {
  saveResult(_payload: QuizResultPayload): Observable<void> {
    return of(undefined).pipe(delay(150));
  }
}
