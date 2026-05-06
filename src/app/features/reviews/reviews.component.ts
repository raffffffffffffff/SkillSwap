import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiInput, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge, TuiSelect, TuiTextarea } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { AuthService } from '../../core/auth/auth.service';
import { StorageService } from '../../core/services/storage.service';
import { ReviewsStore } from '../../core/stores/reviews.store';
import { SessionsStore } from '../../core/stores/sessions.store';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { RatingComponent } from '../../shared/ui/rating.component';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [
    EmptyStateComponent,
    RatingComponent,
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
        <span tuiBadge appearance="info" size="m">Reviews</span>
        <h1>Отзывы</h1>
        <p>Оставляйте оценку после завершённой сессии. Рейтинг партнёра пересчитывается автоматически.</p>
      </div>
    </section>

    <section class="two-column two-column--wide">
      <form tuiCardLarge="normal" class="panel form-grid" [formGroup]="form" (ngSubmit)="create()">
        <h2>Оставить отзыв</h2>
        <tui-textfield>
          <select tuiSelect formControlName="sessionLabel" [items]="completedSessionLabels()"></select>
          <label tuiLabel>Завершённая сессия</label>
        </tui-textfield>
        <tui-textfield>
          <input tuiInput type="number" min="1" max="5" formControlName="rating" />
          <label tuiLabel>Оценка 1-5</label>
        </tui-textfield>
        <tui-textfield>
          <textarea tuiTextarea formControlName="comment" [max]="4"></textarea>
          <label tuiLabel>Комментарий</label>
        </tui-textfield>
        <button tuiButton type="submit" size="m" [disabled]="form.invalid">Отправить</button>
      </form>

      <section class="list">
        @if (!store.received().length) {
          <app-empty-state title="Полученных отзывов нет" text="Они появятся после завершённых встреч с партнёрами." />
        }
        @for (review of store.received(); track review.id) {
          <article tuiCardLarge="compact" class="request-card">
            <div class="review-head">
              <strong>{{ userName(review.fromUserId) }}</strong>
              <app-rating [value]="review.rating" />
            </div>
            <p>{{ review.comment || 'Без комментария' }}</p>
          </article>
        }
      </section>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewsComponent {
  readonly store = inject(ReviewsStore);
  readonly sessions = inject(SessionsStore);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly storage = inject(StorageService);

  readonly form = this.fb.nonNullable.group({
    sessionLabel: [this.firstCompletedSessionLabel(), Validators.required],
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: [''],
  });

  create(): void {
    const selectedSession = this.form.controls.sessionLabel.value || this.firstCompletedSessionLabel();
    const session = this.sessions.sessions().find((item) => this.sessionLabel(item.id) === selectedSession);
    const partnerId = session ? this.partnerId(session.requestId) : null;

    if (session && partnerId && this.form.valid && !this.hasSentReview(session.id)) {
      const value = this.form.getRawValue();
      this.store.create(session.id, partnerId, Number(value.rating), value.comment);
      this.form.reset({ sessionLabel: this.firstCompletedSessionLabel(), rating: 5, comment: '' });
    }
  }

  completedSessionLabels(): string[] {
    return this.sessions
      .sessions()
      .filter((session) => session.status === 'completed' && !this.hasSentReview(session.id))
      .map((session) => this.sessionLabel(session.id));
  }

  firstCompletedSessionLabel(): string {
    return this.completedSessionLabels()[0] ?? '';
  }

  userName(userId: string): string {
    return this.storage.findUser(userId)?.name ?? 'Пользователь';
  }

  private sessionLabel(sessionId: string): string {
    const session = this.storage.db().sessions.find((item) => item.id === sessionId);
    return session ? `${session.date} · ${this.userName(this.partnerId(session.requestId) ?? '')}` : 'Сессия';
  }

  private hasSentReview(sessionId: string): boolean {
    return this.store.sent().some((review) => review.sessionId === sessionId);
  }

  private partnerId(requestId: string): string | null {
    const userId = this.auth.currentUser()?.id;
    const request = this.storage.db().swapRequests.find((item) => item.id === requestId);

    if (!request || !userId) {
      return null;
    }

    return request.fromUserId === userId ? request.toUserId : request.fromUserId;
  }
}
