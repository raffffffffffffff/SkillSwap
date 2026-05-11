import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { DiscoverStore } from './discover.store';
import { RequestsStore } from './requests.store';
import { SessionsStore } from './sessions.store';
import { StorageService } from '../services/storage.service';

describe('Signal stores', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    TestBed.inject(AuthService).login('alina@example.com', 'password');
  });

  it('filters discover partners by skill', () => {
    const store = TestBed.inject(DiscoverStore);
    store.updateFilters({ skillId: 's2' });

    expect(store.partners().every((card) => card.teachSkills.some((skill) => skill.skillId === 's2'))).toBe(true);
  });

  it('sorts discover partners by rating', () => {
    const store = TestBed.inject(DiscoverStore);
    store.updateFilters({ sortBy: 'rating' });
    const ratings = store.partners().map((card) => card.user.rating);

    expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
  });

  it('accepts request', () => {
    const store = TestBed.inject(RequestsStore);
    store.accept('r1');

    expect(store.incoming().find((request) => request.id === 'r1')?.status).toBe('accepted');
  });

  it('declines request', () => {
    const store = TestBed.inject(RequestsStore);
    store.decline('r1');

    expect(store.incoming().find((request) => request.id === 'r1')?.status).toBe('declined');
  });

  it('creates session for accepted request', () => {
    const store = TestBed.inject(SessionsStore);
    const before = store.sessions().length;

    store.create({ requestId: 'r2', date: '2026-05-01T10:00', durationMinutes: 45, format: 'online' });

    expect(store.sessions().length).toBe(before + 1);
  });

  it('persists user skill CRUD through storage', () => {
    const storage = TestBed.inject(StorageService);
    const item = storage.addUserSkill('u1', 's8', 'learn', 'beginner');

    expect(storage.db().userSkills.some((skill) => skill.id === item.id)).toBe(true);

    storage.deleteUserSkill(item.id);

    expect(storage.db().userSkills.some((skill) => skill.id === item.id)).toBe(false);
  });
});
