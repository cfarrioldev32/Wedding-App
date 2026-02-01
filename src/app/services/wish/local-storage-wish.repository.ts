import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { WishPayload } from '../../components/stepper/wish.models';
import { WishRepository } from './wish-repository';

const WISHES_KEY = 'wedding_wishes';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageWishRepository implements WishRepository {
  saveWish(payload: WishPayload): Observable<WishPayload> {
    return of(payload).pipe(
      delay(800),
      tap(() => this.saveWishLocal(payload))
    );
  }

  private saveWishLocal(payload: WishPayload): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const existing = this.readWishes();
      const hasDuplicate = existing.some(
        (wish) =>
          wish.country.trim().toLowerCase() ===
            payload.country.trim().toLowerCase() &&
          wish.reason.trim().toLowerCase() ===
            payload.reason.trim().toLowerCase()
      );

      if (!hasDuplicate) {
        existing.push(payload);
        localStorage.setItem(WISHES_KEY, JSON.stringify(existing));
      }
    } catch {
      // Ignore storage errors.
    }
  }

  private readWishes(): WishPayload[] {
    if (typeof window === 'undefined') {
      return [];
    }

    const raw = localStorage.getItem(WISHES_KEY);
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as WishPayload[];
    } catch {
      return [];
    }
  }
}
