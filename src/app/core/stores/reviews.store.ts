import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withMethods } from '@ngrx/signals';
import { AuthService } from '../auth/auth.service';
import { StorageService } from '../services/storage.service';

export const ReviewsStore = signalStore(
  { providedIn: 'root' },
  withComputed(() => {
    const auth = inject(AuthService);
    const storage = inject(StorageService);

    return {
      received: computed(() => storage.db().reviews.filter((review) => review.toUserId === auth.currentUser()?.id)),
      sent: computed(() => storage.db().reviews.filter((review) => review.fromUserId === auth.currentUser()?.id)),
    };
  }),
  withMethods(() => {
    const auth = inject(AuthService);
    const storage = inject(StorageService);

    return {
      create(sessionId: string, toUserId: string, rating: number, comment?: string): void {
        const user = auth.currentUser();

        if (user) {
          storage.createReview({ sessionId, fromUserId: user.id, toUserId, rating, comment });
        }
      },
    };
  }),
);
