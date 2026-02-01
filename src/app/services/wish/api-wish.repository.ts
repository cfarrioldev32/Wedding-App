import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { WishPayload } from '../../components/stepper/wish.models';
import { WishRepository } from './wish-repository';
import { environment } from '../../environments/environment';
import { getGuestEmail } from '../session/session-storage';

interface WishApiResponse {
  id: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiWishRepository implements WishRepository {
  constructor(private readonly http: HttpClient) {}

  saveWish(payload: WishPayload): Observable<WishPayload> {
    const url = `${environment.apiUrl.replace(/\/$/, '')}/api/wishes`;
    const email = getGuestEmail();
    return this.http
      .post<WishApiResponse>(url, {
        email,
        country: payload.country,
        reason: payload.reason
      })
      .pipe(
        map((response) => ({
          ...payload,
          id: response.id,
          createdAt: response.createdAt
        }))
      );
  }
}
