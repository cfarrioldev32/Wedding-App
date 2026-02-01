import { Injectable } from '@angular/core';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { WishPayload } from '../../components/stepper/wish.models';
import { environment } from '../../environments/environment';
import { ApiWishRepository } from './api-wish.repository';
import { LocalStorageWishRepository } from './local-storage-wish.repository';

export type WishSaveMode = 'api' | 'local' | 'local-fallback';

@Injectable({
  providedIn: 'root'
})
export class WishServiceFacade {
  private lastSaveMode: WishSaveMode = 'local';

  constructor(
    private readonly apiRepo: ApiWishRepository,
    private readonly localRepo: LocalStorageWishRepository
  ) {}

  submitWish(payload: WishPayload): Observable<WishPayload> {
    if (!environment.useBackend) {
      this.lastSaveMode = 'local';
      return this.localRepo.saveWish(payload);
    }

    this.lastSaveMode = 'api';
    return this.apiRepo.saveWish(payload).pipe(
      tap(() => {
        this.lastSaveMode = 'api';
      }),
      catchError((error) => {
        if (!environment.fallbackToLocalStorage) {
          return throwError(() => error);
        }

        this.lastSaveMode = 'local-fallback';
        return this.localRepo.saveWish(payload);
      })
    );
  }

  getLastSaveMode(): WishSaveMode {
    return this.lastSaveMode;
  }
}
