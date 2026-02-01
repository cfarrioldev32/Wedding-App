import { Observable } from 'rxjs';
import { WishPayload } from '../../components/stepper/wish.models';

export interface WishRepository {
  saveWish(payload: WishPayload): Observable<WishPayload>;
}
