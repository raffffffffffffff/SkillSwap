import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { AuthService } from '../auth/auth.service';
import { StorageService } from '../services/storage.service';

export const RequestsStore = signalStore(
  { providedIn: 'root' },
  withState({ loading: false, error: '' }),
  withComputed(() => {
    const auth = inject(AuthService);
    const storage = inject(StorageService);

    return {
      incoming: computed(() =>
        storage.db().swapRequests.filter((request) => request.toUserId === auth.currentUser()?.id),
      ),
      outgoing: computed(() =>
        storage.db().swapRequests.filter((request) => request.fromUserId === auth.currentUser()?.id),
      ),
      accepted: computed(() =>
        storage
          .db()
          .swapRequests.filter(
            (request) =>
              request.status === 'accepted' &&
              (request.fromUserId === auth.currentUser()?.id || request.toUserId === auth.currentUser()?.id),
          ),
      ),
    };
  }),
  withMethods((store) => {
    const auth = inject(AuthService);
    const storage = inject(StorageService);

    return {
      create(toUserId: string, offeredSkillId: string, wantedSkillId: string, message?: string): void {
        const user = auth.currentUser();

        if (!user) {
          return;
        }

        patchState(store, { loading: true, error: '' });
        storage.createRequest({ fromUserId: user.id, toUserId, offeredSkillId, wantedSkillId, message });
        patchState(store, { loading: false });
      },
      accept(id: string): void {
        storage.updateRequest(id, 'accepted');
      },
      decline(id: string): void {
        storage.updateRequest(id, 'declined');
      },
    };
  }),
);
