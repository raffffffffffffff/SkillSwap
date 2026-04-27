import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TuiBadge, TuiButton],
  template: `
    <div class="app-shell">
      <aside class="sidebar" aria-label="Основная навигация">
        <a class="brand" routerLink="/dashboard">
          <span class="brand__logo">SS</span>
          <span>SkillSwap</span>
        </a>
        <nav>
          @for (item of nav; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="is-active">{{ item.label }}</a>
          }
        </nav>
        <div class="sidebar__user">
          <span tuiBadge appearance="positive" size="m">{{ initials() }}</span>
          <div>
            <strong>{{ auth.currentUser()?.name }}</strong>
            <small>{{ auth.currentUser()?.city || 'Online' }}</small>
          </div>
        </div>
        <button tuiButton appearance="secondary" size="m" type="button" (click)="auth.logout()">Выйти</button>
      </aside>
      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  readonly auth = inject(AuthService);
  readonly initials = computed(() =>
    (this.auth.currentUser()?.name ?? 'SS')
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  );

  readonly nav = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/profile', label: 'Профиль' },
    { path: '/discover', label: 'Поиск' },
    { path: '/requests', label: 'Запросы' },
    { path: '/matches', label: 'Матчи' },
    { path: '/sessions', label: 'Сессии' },
    { path: '/reviews', label: 'Отзывы' },
    { path: '/groups', label: 'Группы' },
  ];
}
