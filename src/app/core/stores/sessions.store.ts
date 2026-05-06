import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { AuthService } from '../auth/auth.service';
import { SessionFormat, SessionStatus } from '../models/domain.models';
import { StorageService } from '../services/storage.service';

export const SessionsStore = signalStore(
  { providedIn: 'root' },
  withState({ loading: false, error: '' }),
  withComputed(() => {
    const auth = inject(AuthService);
    const storage = inject(StorageService);

    return {
      sessions: computed(() => {
        const userId = auth.currentUser()?.id;
        const requestIds = storage
          .db()
          .swapRequests.filter((request) => request.fromUserId === userId || request.toUserId === userId)
          .map((request) => request.id);

        return storage.db().sessions.filter((session) => requestIds.includes(session.requestId));
      }),
      completed: computed(() => {
        const userId = auth.currentUser()?.id;
        const requestIds = storage
          .db()
          .swapRequests.filter((request) => request.fromUserId === userId || request.toUserId === userId)
          .map((request) => request.id);

        return storage
          .db()
          .sessions.filter((session) => session.status === 'completed' && requestIds.includes(session.requestId));
      }),
    };
  }),
  withMethods((store) => {
    const storage = inject(StorageService);

    return {
      create(input: { requestId: string; date: string; durationMinutes: number; format: SessionFormat; notes?: string }): void {
        patchState(store, { loading: true, error: '' });
        storage.createSession(input);
        patchState(store, { loading: false });
      },
      updateStatus(id: string, status: SessionStatus): void {
        storage.updateSession(id, { status });
      },
      updateNotes(id: string, notes: string): void {
        storage.updateSession(id, { notes });
      },
    };
  }),
);
