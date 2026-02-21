import { Observable } from 'rxjs';

export interface RegistrationPayload {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  attendanceConfirmed: boolean;
  attendeesCount: number;
}

export interface RegistrationRepository {
  saveRegistration(payload: RegistrationPayload): Observable<void>;
}
