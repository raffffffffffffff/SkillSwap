import { Pipe, PipeTransform } from '@angular/core';
import { SkillLevel } from '../../core/models/domain.models';

const labels: Record<SkillLevel, string> = {
  beginner: 'Начинающий',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
};

@Pipe({
  name: 'levelLabel',
  standalone: true,
})
export class LevelPipe implements PipeTransform {
  transform(value: SkillLevel): string {
    return labels[value];
  }
}
