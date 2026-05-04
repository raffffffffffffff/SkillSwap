import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TuiButton } from '@taiga-ui/core';
import { TuiBadge, TuiTabs } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { CatalogService } from '../../core/services/catalog.service';
import { StorageService } from '../../core/services/storage.service';
import { RequestsStore } from '../../core/stores/requests.store';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [EmptyStateComponent, TuiBadge, TuiButton, TuiCardLarge, TuiTabs],
  template: `
    <section class="page-head">
      <div>
        <span tuiBadge appearance="info" size="m">Requests</span>
        <h1>Запросы на обмен</h1>
        <p>Принимайте входящие предложения или отслеживайте исходящие статусы.</p>
      </div>
    </section>

    <tui-tabs [(activeItemIndex)]="tabIndex">
      <button tuiTab>Входящие</button>
      <button tuiTab>Исходящие</button>
    </tui-tabs>

    <section class="list">
      @let list = tabIndex() === 0 ? store.incoming() : store.outgoing();
      @if (!list.length) {
        <app-empty-state title="Запросов пока нет" text="Новые предложения появятся здесь после отправки или получения." />
      }
      @for (request of list; track request.id) {
        <article tuiCardLarge="compact" class="request-card">
          <div>
            <span tuiBadge [appearance]="statusAppearance(request.status)" size="m">{{ request.status }}</span>
            <h2>{{ userName(request.fromUserId) }} → {{ userName(request.toUserId) }}</h2>
            <p>{{ catalog.skillName(request.offeredSkillId) }} за {{ catalog.skillName(request.wantedSkillId) }}</p>
            <small>{{ request.message || 'Без сообщения' }}</small>
          </div>
          @if (tabIndex() === 0 && request.status === 'pending') {
            <div class="actions">
              <button tuiButton size="m" type="button" (click)="store.accept(request.id)">Принять</button>
              <button tuiButton appearance="secondary" size="m" type="button" (click)="store.decline(request.id)">Отклонить</button>
            </div>
          }
        </article>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestsComponent {
  readonly store = inject(RequestsStore);
  readonly catalog = inject(CatalogService);
  readonly tabIndex = signal(0);
  private readonly storage = inject(StorageService);

  userName(userId: string): string {
    return this.storage.findUser(userId)?.name ?? 'Пользователь';
  }

  statusAppearance(status: string): string {
    return status === 'accepted' ? 'positive' : status === 'declined' ? 'negative' : 'warning';
  }
}
