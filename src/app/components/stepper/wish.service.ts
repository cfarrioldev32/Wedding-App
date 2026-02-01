import { Injectable } from '@angular/core';
import { WishPayload } from './wish.models';

const WISHES_KEY = 'wedding_wishes';

@Injectable({
  providedIn: 'root'
})
export class WishService {
  submitWish(payload: WishPayload): Promise<WishPayload> {
    // TODO: Reemplazar con llamado real al backend cuando exista.
    return new Promise((resolve) => {
      setTimeout(() => {
        this.saveWishLocal(payload);
        resolve(payload);
      }, 800);
    });
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
      // Swallow storage errors silently for now.
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
