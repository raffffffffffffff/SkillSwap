import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from '@angular/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiButton } from '@taiga-ui/core';
import { TuiCardLarge } from '@taiga-ui/layout';
import { PartnerCard, Skill } from '../../core/models/domain.models';
import { LevelPipe } from '../pipes/level.pipe';
import { RatingComponent } from './rating.component';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [LevelPipe, RatingComponent, TuiBadge, TuiButton, TuiCardLarge],
  template: `
    <article tuiCardLarge="compact" class="user-card">
      <div class="user-card__top">
        <img [src]="card().user.avatarUrl" [alt]="card().user.name" />
        <div>
          <h3>{{ card().user.name }}</h3>
          <p>{{ card().user.city || 'Город не указан' }}</p>
        </div>
        <app-rating [value]="card().user.rating" />
      </div>

      <p class="muted">{{ card().user.bio }}</p>

      <div class="skill-block">
        <strong>Может обучать</strong>
        <div class="chips">
          @for (item of card().teachSkills; track item.id) {
            <span tuiBadge appearance="info" size="m">{{ skillName(item.skillId) }} · {{ item.level | levelLabel }}</span>
          }
        </div>
      </div>

      <div class="skill-block">
        <strong>Хочет изучить</strong>
        <div class="chips">
          @for (item of card().learnSkills; track item.id) {
            <span tuiBadge appearance="neutral" size="m">{{ skillName(item.skillId) }}</span>
          }
        </div>
      </div>

      <footer class="user-card__footer">
        <span class="compatibility">{{ card().compatibility }}% match</span>
        <button tuiButton type="button" size="m" (click)="request.emit(card())">Предложить обмен</button>
      </footer>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  readonly card = input.required<PartnerCard>();
  readonly skills = input.required<Skill[]>();

  @Output() readonly request = new EventEmitter<PartnerCard>();

  skillName(skillId: string): string {
    return this.skills().find((skill) => skill.id === skillId)?.name ?? 'Навык';
  }
}
