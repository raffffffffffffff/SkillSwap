import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiInput, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge, TuiSelect, TuiTextarea } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { CatalogService } from '../../core/services/catalog.service';
import { StorageService } from '../../core/services/storage.service';
import { RequestsStore } from '../../core/stores/requests.store';
import { SessionsStore } from '../../core/stores/sessions.store';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [
    EmptyStateComponent,
    ReactiveFormsModule,
    TuiBadge,
    TuiButton,
    TuiCardLarge,
    TuiInput,
    TuiSelect,
    TuiTextarea,
    TuiTextfield,
  ],
  template: `
    <section class="page-head">
      <div>
        <span tuiBadge appearance="info" size="m">Sessions</span>
        <h1>Учебные сессии</h1>
        <p>Планируйте встречи по принятым обменам и фиксируйте итог.</p>
      </div>
    </section>

    <section class="two-column two-column--wide">
      <form tuiCardLarge="normal" class="panel form-grid" [formGroup]="form" (ngSubmit)="create()">
        <h2>Новая сессия</h2>
        <tui-textfield>
          <select tuiSelect formControlName="matchLabel" [items]="matchLabels()"></select>
          <label tuiLabel>Матч</label>
        </tui-textfield>
        <tui-textfield>
          <input tuiInput type="datetime-local" formControlName="date" />
          <label tuiLabel>Дата</label>
        </tui-textfield>
        <tui-textfield>
          <input tuiInput type="number" formControlName="durationMinutes" />
          <label tuiLabel>Длительность, минут</label>
        </tui-textfield>
        <tui-textfield>
          <select tuiSelect formControlName="format" [items]="formats"></select>
          <label tuiLabel>Формат</label>
        </tui-textfield>
        <tui-textfield>
          <textarea tuiTextarea formControlName="notes" [max]="4"></textarea>
          <label tuiLabel>Заметки</label>
        </tui-textfield>
        <button tuiButton type="submit" size="m" [disabled]="form.invalid || !requests.accepted().length">Создать</button>
      </form>

      <section class="list">
        @if (!store.sessions().length) {
          <app-empty-state title="Сессий пока нет" text="Сначала примите обмен, затем создайте учебную встречу." />
        }
        @for (session of store.sessions(); track session.id) {
          <article tuiCardLarge="compact" class="request-card">
            <span tuiBadge [appearance]="session.status === 'completed' ? 'positive' : 'neutral'" size="m">
              {{ session.status }}
            </span>
            <h2>{{ matchTitle(session.requestId) }}</h2>
            <p>{{ session.date }} · {{ session.durationMinutes }} мин · {{ session.format }}</p>
            <small>{{ session.notes || 'Без заметок' }}</small>
            <div class="actions">
              <button tuiButton size="s" type="button" (click)="store.updateStatus(session.id, 'completed')">Completed</button>
              <button tuiButton appearance="secondary" size="s" type="button" (click)="store.updateStatus(session.id, 'cancelled')">
                Cancelled
              </button>
            </div>
          </article>
        }
      </section>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsComponent {
  readonly store = inject(SessionsStore);
  readonly requests = inject(RequestsStore);
  readonly catalog = inject(CatalogService);
  private readonly fb = inject(FormBuilder);
  private readonly storage = inject(StorageService);

  readonly formats = ['online', 'offline'];
  readonly form = this.fb.nonNullable.group({
    matchLabel: [this.firstMatchLabel(), Validators.required],
    date: [new Date(Date.now() + 86400000).toISOString().slice(0, 16), Validators.required],
    durationMinutes: [60, [Validators.required, Validators.min(15)]],
    format: ['online', Validators.required],
    notes: [''],
  });

  create(): void {
    const selectedMatch = this.form.controls.matchLabel.value || this.firstMatchLabel();
    const request = this.requests.accepted().find((item) => this.matchTitle(item.id) === selectedMatch);

    if (request && this.form.valid) {
      const value = this.form.getRawValue();
      this.store.create({
        requestId: request.id,
        date: value.date,
        durationMinutes: Number(value.durationMinutes),
        format: value.format as 'online' | 'offline',
        notes: value.notes,
      });
    }
  }

  matchLabels(): string[] {
    return this.requests.accepted().map((request) => this.matchTitle(request.id));
  }

  firstMatchLabel(): string {
    return this.matchLabels()[0] ?? '';
  }

  matchTitle(requestId: string): string {
    const request = this.storage.db().swapRequests.find((item) => item.id === requestId);

    if (!request) {
      return 'Матч';
    }

    return `${this.userName(request.fromUserId)} ↔ ${this.userName(request.toUserId)}: ${this.catalog.skillName(
      request.offeredSkillId,
    )} / ${this.catalog.skillName(request.wantedSkillId)}`;
  }

  private userName(userId: string): string {
    return this.storage.findUser(userId)?.name ?? 'Пользователь';
  }
}
