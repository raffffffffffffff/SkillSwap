import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiInput, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge, TuiSelect, TuiTextarea } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { AuthService } from '../../core/auth/auth.service';
import { PartnerCard } from '../../core/models/domain.models';
import { CatalogService } from '../../core/services/catalog.service';
import { StorageService } from '../../core/services/storage.service';
import { DiscoverStore } from '../../core/stores/discover.store';
import { RequestsStore } from '../../core/stores/requests.store';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { UserCardComponent } from '../../shared/ui/user-card.component';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [
    EmptyStateComponent,
    ReactiveFormsModule,
    UserCardComponent,
    TuiBadge,
    TuiButton,
    TuiCardLarge,
    TuiInput,
    TuiLoader,
    TuiSelect,
    TuiTextarea,
    TuiTextfield,
  ],
  template: `
    <section class="page-head">
      <div>
        <span tuiBadge appearance="info" size="m">Discover</span>
        <h1>Поиск партнёров</h1>
        <p>Фильтруйте по навыку, категории и уровню. Сортировка по compatibility включена по умолчанию.</p>
      </div>
    </section>

    <form tuiCardLarge="compact" class="filters" [formGroup]="filtersForm">
      <tui-textfield>
        <input tuiInput formControlName="query" (input)="syncFilters()" />
        <label tuiLabel>Имя или навык</label>
      </tui-textfield>
      <tui-textfield>
        <select tuiSelect formControlName="skillName" [items]="skillNames()" (change)="syncFilters()"></select>
        <label tuiLabel>Навык</label>
      </tui-textfield>
      <tui-textfield>
        <select tuiSelect formControlName="category" [items]="categories()" (change)="syncFilters()"></select>
        <label tuiLabel>Категория</label>
      </tui-textfield>
      <tui-textfield>
        <select tuiSelect formControlName="level" [items]="levels" (change)="syncFilters()"></select>
        <label tuiLabel>Уровень</label>
      </tui-textfield>
      <tui-textfield>
        <select tuiSelect formControlName="sortBy" [items]="sorts" (change)="syncFilters()"></select>
        <label tuiLabel>Сортировка</label>
      </tui-textfield>
      <button tuiButton appearance="secondary" type="button" size="m" (click)="reset()">Сброс</button>
    </form>

    @if (store.loading()) {
      <tui-loader />
    }

    @if (!store.partners().length) {
      <app-empty-state title="Партнёры не найдены" text="Измените фильтр или добавьте больше навыков в профиль." />
    }

    <section class="cards-grid">
      @for (card of store.partners(); track card.user.id) {
        <app-user-card [card]="card" [skills]="catalog.skills()" (request)="openRequest($event)" />
      }
    </section>

    @if (selected(); as card) {
      <section class="drawer-backdrop" (click)="selected.set(null)">
        <form class="drawer" tuiCardLarge="normal" [formGroup]="requestForm" (click)="$event.stopPropagation()" (ngSubmit)="sendRequest(card)">
          <header class="panel__head">
            <h2>Предложить обмен</h2>
            <button tuiButton appearance="secondary" type="button" size="s" (click)="selected.set(null)">Закрыть</button>
          </header>
          <p>Партнёр: <strong>{{ card.user.name }}</strong></p>
          <tui-textfield>
            <select tuiSelect formControlName="offeredSkillName" [items]="myTeachSkillNames()"></select>
            <label tuiLabel>Я могу научить</label>
          </tui-textfield>
          <tui-textfield>
            <select tuiSelect formControlName="wantedSkillName" [items]="partnerTeachSkillNames(card)"></select>
            <label tuiLabel>Хочу изучить</label>
          </tui-textfield>
          <tui-textfield>
            <textarea tuiTextarea formControlName="message" [max]="5"></textarea>
            <label tuiLabel>Сообщение</label>
          </tui-textfield>
          <button tuiButton type="submit" size="m" [disabled]="requestForm.invalid">Отправить запрос</button>
        </form>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscoverComponent {
  readonly store = inject(DiscoverStore);
  readonly catalog = inject(CatalogService);
  readonly selected = signal<PartnerCard | null>(null);
  private readonly fb = inject(FormBuilder);
  private readonly requests = inject(RequestsStore);
  private readonly auth = inject(AuthService);
  private readonly storage = inject(StorageService);

  readonly levels = ['all', 'beginner', 'intermediate', 'advanced'];
  readonly sorts = ['compatibility', 'rating', 'name'];
  readonly categories = computed(() => ['', ...this.catalog.categories()]);

  readonly filtersForm = this.fb.nonNullable.group({
    query: [''],
    skillName: [''],
    category: [''],
    level: ['all'],
    sortBy: ['compatibility'],
  });

  readonly requestForm = this.fb.nonNullable.group({
    offeredSkillName: ['', Validators.required],
    wantedSkillName: ['', Validators.required],
    message: ['', Validators.maxLength(500)],
  });

  syncFilters(): void {
    const value = this.filtersForm.getRawValue();
    const skillId = this.catalog.skills().find((skill) => skill.name === value.skillName)?.id ?? '';
    this.store.updateFilters({
      query: value.query,
      skillId,
      category: value.category,
      level: value.level as 'all' | 'beginner' | 'intermediate' | 'advanced',
      sortBy: value.sortBy as 'compatibility' | 'rating' | 'name',
    });
  }

  reset(): void {
    this.filtersForm.reset({ query: '', skillName: '', category: '', level: 'all', sortBy: 'compatibility' });
    this.store.resetFilters();
  }

  openRequest(card: PartnerCard): void {
    this.selected.set(card);
    this.requestForm.reset({
      offeredSkillName: this.myTeachSkillNames()[0] ?? '',
      wantedSkillName: this.partnerTeachSkillNames(card)[0] ?? '',
      message: '',
    });
  }

  sendRequest(card: PartnerCard): void {
    const value = this.requestForm.getRawValue();
    const offered = this.catalog.skills().find((skill) => skill.name === value.offeredSkillName);
    const wanted = this.catalog.skills().find((skill) => skill.name === value.wantedSkillName);

    if (offered && wanted) {
      this.requests.create(card.user.id, offered.id, wanted.id, value.message);
      this.selected.set(null);
    }
  }

  skillNames(): string[] {
    return ['', ...this.catalog.skills().map((skill) => skill.name)];
  }

  myTeachSkillNames(): string[] {
    const userId = this.auth.currentUser()?.id;

    return this.storage
      .db()
      .userSkills.filter((skill) => skill.userId === userId && skill.type === 'teach')
      .map((skill) => this.catalog.skillName(skill.skillId));
  }

  partnerTeachSkillNames(card: PartnerCard): string[] {
    return card.teachSkills.map((skill) => this.catalog.skillName(skill.skillId));
  }
}
