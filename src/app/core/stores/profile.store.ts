import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { AuthService } from '../auth/auth.service';
import { SkillLevel, UserSkillType } from '../models/domain.models';
import { StorageService } from '../services/storage.service';

export const ProfileStore = signalStore(
  { providedIn: 'root' },
  withState({ loading: false, error: '' }),
  withComputed(() => {
    const auth = inject(AuthService);
    const storage = inject(StorageService);

    return {
      user: computed(() => auth.currentUser()),
      teachSkills: computed(() =>
        storage.db().userSkills.filter((skill) => skill.userId === auth.currentUser()?.id && skill.type === 'teach'),
      ),
      learnSkills: computed(() =>
        storage.db().userSkills.filter((skill) => skill.userId === auth.currentUser()?.id && skill.type === 'learn'),
      ),
    };
  }),
  withMethods((store) => {
    const auth = inject(AuthService);
    const storage = inject(StorageService);

    return {
      updateProfile(input: { name: string; city?: string; bio?: string; avatarUrl?: string }): void {
        const user = auth.currentUser();

        if (!user) {
          return;
        }

        patchState(store, { loading: true, error: '' });

        try {
          storage.updateUser(user.id, input);
          auth.refreshCurrentUser();
          patchState(store, { loading: false });
        } catch (error) {
          patchState(store, { loading: false, error: (error as Error).message });
        }
      },
      addSkill(type: UserSkillType, skillId: string, level: SkillLevel): void {
        const user = auth.currentUser();

        if (user) {
          storage.addUserSkill(user.id, skillId, type, level);
        }
      },
      removeSkill(id: string): void {
        storage.deleteUserSkill(id);
      },
    };
  }),
);
