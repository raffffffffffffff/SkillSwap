import { TestBed } from '@angular/core/testing';
import { CompatibilityService } from './compatibility.service';
import { User, UserSkill } from '../models/domain.models';

describe('CompatibilityService', () => {
  const userA: User = { id: 'a', name: 'A', email: 'a@test.dev', rating: 4, createdAt: '' };
  const userB: User = { id: 'b', name: 'B', email: 'b@test.dev', rating: 5, createdAt: '' };
  const skills: UserSkill[] = [
    { id: '1', userId: 'a', skillId: 'angular', type: 'teach', level: 'advanced' },
    { id: '2', userId: 'a', skillId: 'english', type: 'learn', level: 'beginner' },
    { id: '3', userId: 'b', skillId: 'english', type: 'teach', level: 'advanced' },
    { id: '4', userId: 'b', skillId: 'angular', type: 'learn', level: 'intermediate' },
  ];

  it('returns high score for reciprocal skill match', () => {
    const service = TestBed.inject(CompatibilityService);

    expect(service.score(userA, userB, skills)).toBeGreaterThanOrEqual(90);
  });

  it('caps score at 100', () => {
    const service = TestBed.inject(CompatibilityService);

    expect(service.score(userA, userB, [...skills, ...skills])).toBe(100);
  });
});
