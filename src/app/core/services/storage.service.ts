import { Injectable, signal } from '@angular/core';
import {
  Credentials,
  GroupMaterial,
  Review,
  Session,
  SkillGroup,
  SkillLevel,
  SkillSwapDb,
  SwapRequest,
  SwapStatus,
  User,
  UserSkill,
  UserSkillType,
} from '../models/domain.models';
import { seedDb } from '../data/seed-data';

const DB_KEY = 'skillswap-db-v1';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly dbSignal = signal<SkillSwapDb>(this.load());

  readonly db = this.dbSignal.asReadonly();

  reset(): void {
    this.save(structuredClone(seedDb));
  }

  login(email: string, password: string): User | null {
    const credential = this.db().credentials.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password,
    );

    return credential ? this.findUser(credential.userId) : null;
  }

  register(name: string, email: string, password: string): User {
    const exists = this.db().credentials.some((item) => item.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      throw new Error('Пользователь с таким email уже существует');
    }

    const user: User = {
      id: this.id('u'),
      name,
      email,
      avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`,
      city: '',
      bio: '',
      rating: 0,
      createdAt: new Date().toISOString(),
    };

    const credential: Credentials = { userId: user.id, email, password };

    this.update((db) => ({
      ...db,
      users: [...db.users, user],
      credentials: [...db.credentials, credential],
    }));

    return user;
  }

  findUser(userId: string): User | null {
    return this.db().users.find((user) => user.id === userId) ?? null;
  }

  updateUser(userId: string, patch: Partial<User>): User {
    let updated: User | null = null;

    this.update((db) => ({
      ...db,
      users: db.users.map((user) => {
        if (user.id !== userId) {
          return user;
        }

        updated = { ...user, ...patch, id: user.id, email: user.email };
        return updated;
      }),
    }));

    if (!updated) {
      throw new Error('Пользователь не найден');
    }

    return updated;
  }

  addSkill(name: string, category: string) {
    const skill = { id: this.id('s'), name, category };
    this.update((db) => ({ ...db, skills: [...db.skills, skill] }));
    return skill;
  }

  addUserSkill(userId: string, skillId: string, type: UserSkillType, level: SkillLevel): UserSkill {
    const existing = this.db().userSkills.find(
      (item) => item.userId === userId && item.skillId === skillId && item.type === type,
    );

    if (existing) {
      return existing;
    }

    const item: UserSkill = { id: this.id('us'), userId, skillId, type, level };
    this.update((db) => ({ ...db, userSkills: [...db.userSkills, item] }));
    return item;
  }

  deleteUserSkill(id: string): void {
    this.update((db) => ({ ...db, userSkills: db.userSkills.filter((item) => item.id !== id) }));
  }

  createRequest(input: Omit<SwapRequest, 'id' | 'status' | 'createdAt'>): SwapRequest {
    const request: SwapRequest = {
      ...input,
      id: this.id('r'),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.update((db) => ({ ...db, swapRequests: [request, ...db.swapRequests] }));
    return request;
  }

  updateRequest(id: string, status: SwapStatus): SwapRequest {
    let updated: SwapRequest | null = null;

    this.update((db) => ({
      ...db,
      swapRequests: db.swapRequests.map((request) => {
        if (request.id !== id) {
          return request;
        }

        updated = { ...request, status };
        return updated;
      }),
    }));

    if (!updated) {
      throw new Error('Запрос не найден');
    }

    return updated;
  }

  createSession(input: Omit<Session, 'id' | 'status'>): Session {
    const session: Session = { ...input, id: this.id('se'), status: 'planned' };
    this.update((db) => ({ ...db, sessions: [session, ...db.sessions] }));
    return session;
  }

  updateSession(id: string, patch: Partial<Session>): Session {
    let updated: Session | null = null;

    this.update((db) => ({
      ...db,
      sessions: db.sessions.map((session) => {
        if (session.id !== id) {
          return session;
        }

        updated = { ...session, ...patch, id: session.id };
        return updated;
      }),
    }));

    if (!updated) {
      throw new Error('Сессия не найдена');
    }

    return updated;
  }

  createReview(input: Omit<Review, 'id'>): Review {
    const review: Review = { ...input, id: this.id('rv') };
    this.update((db) => ({ ...db, reviews: [review, ...db.reviews] }));
    this.recalculateRating(input.toUserId);
    return review;
  }

  createGroup(input: Omit<SkillGroup, 'id' | 'memberIds' | 'createdAt'>): SkillGroup {
    const group: SkillGroup = {
      ...input,
      id: this.id('g'),
      memberIds: [input.createdBy],
      createdAt: new Date().toISOString(),
    };

    this.update((db) => ({ ...db, groups: [group, ...db.groups] }));
    return group;
  }

  joinGroup(groupId: string, userId: string): void {
    this.update((db) => ({
      ...db,
      groups: db.groups.map((group) =>
        group.id === groupId && !group.memberIds.includes(userId)
          ? { ...group, memberIds: [...group.memberIds, userId] }
          : group,
      ),
    }));
  }

  createMaterial(input: Omit<GroupMaterial, 'id' | 'createdAt'>): GroupMaterial {
    const material: GroupMaterial = { ...input, id: this.id('m'), createdAt: new Date().toISOString() };
    this.update((db) => ({ ...db, materials: [material, ...db.materials] }));
    return material;
  }

  private recalculateRating(userId: string): void {
    const received = this.db().reviews.filter((review) => review.toUserId === userId);

    if (!received.length) {
      return;
    }

    const rating = Number((received.reduce((sum, review) => sum + review.rating, 0) / received.length).toFixed(1));
    this.updateUser(userId, { rating });
  }

  private load(): SkillSwapDb {
    const raw = localStorage.getItem(DB_KEY);

    if (!raw) {
      localStorage.setItem(DB_KEY, JSON.stringify(seedDb));
      return this.clone(seedDb);
    }

    try {
      return JSON.parse(raw) as SkillSwapDb;
    } catch {
      localStorage.setItem(DB_KEY, JSON.stringify(seedDb));
      return this.clone(seedDb);
    }
  }

  private update(project: (db: SkillSwapDb) => SkillSwapDb): void {
    this.save(project(this.db()));
  }

  private save(db: SkillSwapDb): void {
    this.dbSignal.set(db);
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  private id(prefix: string): string {
    const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    return `${prefix}_${random.slice(0, 8)}`;
  }

  private clone(db: SkillSwapDb): SkillSwapDb {
    return JSON.parse(JSON.stringify(db)) as SkillSwapDb;
  }
}
