import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  RegistrationPayload,
  RegistrationRepository
} from './registration-repository';

@Injectable({
  providedIn: 'root'
})
export class ApiRegistrationRepository implements RegistrationRepository {
  constructor(private readonly http: HttpClient) {}

  saveRegistration(payload: RegistrationPayload): Observable<void> {
    const url = `${environment.apiUrl.replace(/\/$/, '')}/api/registrations`;
    return this.http
      .post(url, {
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        country: payload.country
      })
      .pipe(map(() => undefined));
  }
}
