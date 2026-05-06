import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-rating',
  standalone: true,
  template: `
    <span class="rating" [attr.aria-label]="'Рейтинг ' + value()">
      <span class="rating__star">★</span>
      <span>{{ value().toFixed(1) }}</span>
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingComponent {
  readonly value = input.required<number>();
}
