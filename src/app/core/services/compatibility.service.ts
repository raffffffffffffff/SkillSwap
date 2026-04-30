import { Injectable } from '@angular/core';
import { SkillLevel, User, UserSkill } from '../models/domain.models';

const levelWeight: Record<SkillLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

@Injectable({ providedIn: 'root' })
export class CompatibilityService {
  score(currentUser: User, partner: User, allSkills: UserSkill[]): number {
    const mine = allSkills.filter((skill) => skill.userId === currentUser.id);
    const theirs = allSkills.filter((skill) => skill.userId === partner.id);
    const myLearn = mine.filter((skill) => skill.type === 'learn');
    const myTeach = mine.filter((skill) => skill.type === 'teach');
    const theirLearn = theirs.filter((skill) => skill.type === 'learn');
    const theirTeach = theirs.filter((skill) => skill.type === 'teach');

    const forwardMatches = myLearn.filter((wanted) => theirTeach.some((skill) => skill.skillId === wanted.skillId));
    const reverseMatches = theirLearn.filter((wanted) => myTeach.some((skill) => skill.skillId === wanted.skillId));
    const matchedSkillsCount = forwardMatches.length + reverseMatches.length;

    const levelBonus = [...forwardMatches, ...reverseMatches].reduce((sum, wanted) => {
      const source = [...theirTeach, ...myTeach].find((skill) => skill.skillId === wanted.skillId);
      return sum + (source ? Math.max(0, levelWeight[source.level] - levelWeight[wanted.level] + 1) * 5 : 0);
    }, 0);

    const ratingBonus = Math.round(partner.rating * 6);

    return Math.min(100, matchedSkillsCount * 30 + levelBonus + ratingBonus);
  }
}
