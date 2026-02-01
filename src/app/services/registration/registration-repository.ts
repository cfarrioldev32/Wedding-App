import { Observable } from 'rxjs';

export interface RegistrationPayload {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
}

export interface RegistrationRepository {
  saveRegistration(payload: RegistrationPayload): Observable<void>;
}
