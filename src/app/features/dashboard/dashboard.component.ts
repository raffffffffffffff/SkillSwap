import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiLoader } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { AuthService } from '../../core/auth/auth.service';
import { RequestsStore } from '../../core/stores/requests.store';
import { SessionsStore } from '../../core/stores/sessions.store';
import { ReviewsStore } from '../../core/stores/reviews.store';
import { DiscoverStore } from '../../core/stores/discover.store';
import { CatalogService } from '../../core/services/catalog.service';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, TuiBadge, TuiButton, TuiCardLarge, TuiLoader],
  template: `
    <section class="page-head">
      <div>
        <span tuiBadge appearance="info" size="m">Dashboard</span>
        <h1>Привет, {{ auth.currentUser()?.name }}!</h1>
        <p>Сегодня хороший момент закрыть pending-запросы и запланировать следующий обмен.</p>
      </div>
      <a tuiButton routerLink="/discover" size="m">Найти партнёра</a>
    </section>

    <section class="metrics">
      @for (metric of metrics(); track metric.label) {
        <article tuiCardLarge="compact" class="metric">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
        </article>
      }
    </section>

    <section class="two-column">
      <article tuiCardLarge="normal" class="panel">
        <header class="panel__head">
          <h2>Топ рекомендации</h2>
          <a routerLink="/discover">Все</a>
        </header>
        @if (!recommendations().length) {
          <tui-loader />
        }
        @for (card of recommendations(); track card.user.id) {
          <div class="recommendation">
            <span class="recommendation__avatar" aria-hidden="true">{{ initials(card.user.name) }}</span>
            <div class="recommendation__person">
              <strong>{{ card.user.name }}</strong>
              <small>{{ topSkill(card.user.id) }}</small>
            </div>
            <span class="compatibility">{{ card.compatibility }}%</span>
          </div>
        }
      </article>

      <article tuiCardLarge="normal" class="panel">
        <header class="panel__head">
          <h2>Последние запросы</h2>
          <a routerLink="/requests">Открыть</a>
        </header>
        @for (request of recentRequests(); track request.id) {
          <div class="request-row">
            <span tuiBadge [appearance]="request.status === 'accepted' ? 'positive' : 'neutral'" size="m">
              {{ request.status }}
            </span>
            <strong>{{ userName(request.fromUserId) }} → {{ userName(request.toUserId) }}</strong>
            <small>{{ catalog.skillName(request.offeredSkillId) }} / {{ catalog.skillName(request.wantedSkillId) }}</small>
          </div>
        }
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
  readonly requests = inject(RequestsStore);
  readonly sessions = inject(SessionsStore);
  readonly reviews = inject(ReviewsStore);
  readonly discover = inject(DiscoverStore);
  readonly catalog = inject(CatalogService);
  private readonly storage = inject(StorageService);

  readonly metrics = computed(() => [
    { label: 'Исходящие', value: this.requests.outgoing().length },
    { label: 'Входящие', value: this.requests.incoming().length },
    { label: 'Матчи', value: this.requests.accepted().length },
    { label: 'Запланировано', value: this.sessions.sessions().filter((session) => session.status === 'planned').length },
    { label: 'Средний рейтинг', value: this.auth.currentUser()?.rating.toFixed(1) ?? '0.0' },
  ]);

  readonly recommendations = computed(() => this.discover.partners().slice(0, 3));
  readonly recentRequests = computed(() => [...this.requests.incoming(), ...this.requests.outgoing()].slice(0, 4));

  userName(userId: string): string {
    return this.storage.findUser(userId)?.name ?? 'Пользователь';
  }

  topSkill(userId: string): string {
    const skill = this.storage.db().userSkills.find((item) => item.userId === userId && item.type === 'teach');
    return skill ? this.catalog.skillName(skill.skillId) : 'Новый партнёр';
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
