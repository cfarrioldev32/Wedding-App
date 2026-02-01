import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  RegistrationPayload,
  RegistrationRepository
} from './registration-repository';

@Injectable({
  providedIn: 'root'
})
export class LocalRegistrationRepository implements RegistrationRepository {
  saveRegistration(_payload: RegistrationPayload): Observable<void> {
    return of(undefined).pipe(delay(200));
  }
}
