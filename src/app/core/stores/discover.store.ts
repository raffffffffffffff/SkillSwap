import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { AuthService } from '../auth/auth.service';
import { DiscoverFilters, PartnerCard } from '../models/domain.models';
import { CatalogService } from '../services/catalog.service';
import { CompatibilityService } from '../services/compatibility.service';
import { StorageService } from '../services/storage.service';

const initialFilters: DiscoverFilters = {
  query: '',
  skillId: '',
  category: '',
  level: 'all',
  sortBy: 'compatibility',
};

function sortCards(cards: PartnerCard[], sortBy: DiscoverFilters['sortBy']): PartnerCard[] {
  return [...cards].sort((a, b) => {
    if (sortBy === 'rating') {
      return b.user.rating - a.user.rating;
    }

    if (sortBy === 'name') {
      return a.user.name.localeCompare(b.user.name);
    }

    return b.compatibility - a.compatibility;
  });
}

export const DiscoverStore = signalStore(
  { providedIn: 'root' },
  withState({
    filters: initialFilters,
    loading: false,
    error: '',
  }),
  withComputed((store) => {
    const auth = inject(AuthService);
    const storage = inject(StorageService);
    const catalog = inject(CatalogService);
    const compatibility = inject(CompatibilityService);

    return {
      partners: computed(() => {
        const current = auth.currentUser();

        if (!current) {
          return [];
        }

        const filters = store.filters();
        const cards = storage
          .db()
          .users.filter((user) => user.id !== current.id)
          .map((user) => {
            const teachSkills = storage.db().userSkills.filter((skill) => skill.userId === user.id && skill.type === 'teach');
            const learnSkills = storage.db().userSkills.filter((skill) => skill.userId === user.id && skill.type === 'learn');

            return {
              user,
              teachSkills,
              learnSkills,
              compatibility: compatibility.score(current, user, storage.db().userSkills),
            };
          })
          .filter((card) => {
            const query = filters.query.trim().toLowerCase();
            const skillMatch = !filters.skillId || card.teachSkills.some((skill) => skill.skillId === filters.skillId);
            const categoryMatch =
              !filters.category || card.teachSkills.some((skill) => catalog.skillCategory(skill.skillId) === filters.category);
            const levelMatch = filters.level === 'all' || card.teachSkills.some((skill) => skill.level === filters.level);
            const queryMatch =
              !query ||
              card.user.name.toLowerCase().includes(query) ||
              card.teachSkills.some((skill) => catalog.skillName(skill.skillId).toLowerCase().includes(query));

            return skillMatch && categoryMatch && levelMatch && queryMatch;
          });

        return sortCards(cards, filters.sortBy);
      }),
    };
  }),
  withMethods((store) => ({
    updateFilters(filters: Partial<DiscoverFilters>): void {
      patchState(store, { filters: { ...store.filters(), ...filters } });
    },
    resetFilters(): void {
      patchState(store, { filters: initialFilters });
    },
  })),
);
