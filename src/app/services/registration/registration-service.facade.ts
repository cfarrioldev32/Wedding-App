import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiRegistrationRepository } from './api-registration.repository';
import { LocalRegistrationRepository } from './local-registration.repository';
import { RegistrationPayload } from './registration-repository';

@Injectable({
  providedIn: 'root'
})
export class RegistrationServiceFacade {
  constructor(
    private readonly apiRepo: ApiRegistrationRepository,
    private readonly localRepo: LocalRegistrationRepository
  ) {}

  submitRegistration(payload: RegistrationPayload): Observable<void> {
    if (!environment.useBackend) {
      return this.localRepo.saveRegistration(payload);
    }

    return this.apiRepo.saveRegistration(payload).pipe(
      catchError((error) => {
        if (!environment.fallbackToLocalStorage) {
          return throwError(() => error);
        }
        return this.localRepo.saveRegistration(payload);
      })
    );
  }
}
