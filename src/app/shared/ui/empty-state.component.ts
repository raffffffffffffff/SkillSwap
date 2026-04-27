import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <section class="empty">
      <div class="empty__mark">{{ mark() }}</div>
      <h3>{{ title() }}</h3>
      <p>{{ text() }}</p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly mark = input('SkillSwap');
  readonly title = input.required<string>();
  readonly text = input.required<string>();
}
