import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, TuiBadge, TuiButton],
  template: `
    <main class="public-page">
      <section class="hero">
        <div class="hero__copy">
          <span tuiBadge appearance="info" size="xl">SkillSwap</span>
          <h1>Обмен навыками без оплаты и случайных созвонов</h1>
          <p>
            Найдите человека, который умеет то, что вы хотите изучить, и предложите взамен свой сильный навык.
          </p>
          <div class="hero__actions">
            <a tuiButton routerLink="/register" size="l">Начать</a>
            <a tuiButton appearance="secondary" routerLink="/login" size="l">Войти</a>
          </div>
        </div>
        <div class="hero__panel" aria-label="Пример обмена">
          <div class="exchange-card exchange-card--top">
            <strong>Алина</strong>
            <span>Учит Angular</span>
            <small>Хочет Английский</small>
          </div>
          <div class="exchange-line"></div>
          <div class="exchange-card exchange-card--bottom">
            <strong>Марк</strong>
            <span>Учит Английский</span>
            <small>Хочет Figma</small>
          </div>
        </div>
      </section>

      <section class="landing-grid">
        @for (item of benefits; track item.title) {
          <article>
            <span>{{ item.kicker }}</span>
            <h2>{{ item.title }}</h2>
            <p>{{ item.text }}</p>
          </article>
        }
      </section>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  readonly benefits = [
    {
      kicker: '01',
      title: 'Совместимость',
      text: 'Рекомендации учитывают встречные навыки, уровень и рейтинг партнёра.',
    },
    {
      kicker: '02',
      title: 'Сессии',
      text: 'После принятия запроса можно запланировать встречу и вести заметки по прогрессу.',
    },
    {
      kicker: '03',
      title: 'Группы',
      text: 'Материалы и ссылки не теряются в переписках, а собираются в тематических группах.',
    },
  ];
}
