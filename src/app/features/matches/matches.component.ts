import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { CatalogService } from '../../core/services/catalog.service';
import { StorageService } from '../../core/services/storage.service';
import { RequestsStore } from '../../core/stores/requests.store';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [EmptyStateComponent, RouterLink, TuiBadge, TuiButton, TuiCardLarge],
  template: `
    <section class="page-head">
      <div>
        <span tuiBadge appearance="positive" size="m">Matches</span>
        <h1>Принятые обмены</h1>
        <p>Матчи появляются после принятия входящего или исходящего запроса.</p>
      </div>
      <a tuiButton routerLink="/sessions" size="m">Запланировать сессию</a>
    </section>

    @if (!store.accepted().length) {
      <app-empty-state title="Матчей пока нет" text="Примите запрос или отправьте новое предложение в Discover." />
    }

    <section class="cards-grid cards-grid--two">
      @for (match of store.accepted(); track match.id) {
        <article tuiCardLarge="compact" class="request-card">
          <span tuiBadge appearance="positive" size="m">accepted</span>
          <h2>{{ userName(match.fromUserId) }} ↔ {{ userName(match.toUserId) }}</h2>
          <p>{{ catalog.skillName(match.offeredSkillId) }} / {{ catalog.skillName(match.wantedSkillId) }}</p>
          <a tuiButton routerLink="/sessions" size="m">К сессиям</a>
        </article>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchesComponent {
  readonly store = inject(RequestsStore);
  readonly catalog = inject(CatalogService);
  private readonly storage = inject(StorageService);

  userName(userId: string): string {
    return this.storage.findUser(userId)?.name ?? 'Пользователь';
  }
}
