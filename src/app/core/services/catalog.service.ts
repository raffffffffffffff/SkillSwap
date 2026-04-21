import { Injectable, computed, inject } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly storage = inject(StorageService);

  readonly skills = computed(() => this.storage.db().skills);
  readonly categories = computed(() => [...new Set(this.skills().map((skill) => skill.category))].sort());

  skillName(skillId: string): string {
    return this.skills().find((skill) => skill.id === skillId)?.name ?? 'Навык';
  }

  skillCategory(skillId: string): string {
    return this.skills().find((skill) => skill.id === skillId)?.category ?? 'Без категории';
  }
}
