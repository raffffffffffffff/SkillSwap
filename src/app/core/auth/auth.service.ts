import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/domain.models';
import { StorageService } from '../services/storage.service';

const TOKEN_KEY = 'skillswap-token';
const USER_KEY = 'skillswap-user-id';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);
  private readonly currentUserSignal = signal<User | null>(this.restoreUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.currentUser()));

  login(email: string, password: string): boolean {
    const user = this.storage.login(email, password);

    if (!user) {
      return false;
    }

    this.persistSession(user);
    return true;
  }

  register(name: string, email: string, password: string): User {
    const user = this.storage.register(name, email, password);
    this.persistSession(user);
    return user;
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
    void this.router.navigateByUrl('/login');
  }

  refreshCurrentUser(): void {
    const user = this.currentUser();

    if (user) {
      this.currentUserSignal.set(this.storage.findUser(user.id));
    }
  }

  token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private persistSession(user: User): void {
    localStorage.setItem(TOKEN_KEY, `mock-jwt-${user.id}`);
    localStorage.setItem(USER_KEY, user.id);
    this.currentUserSignal.set(user);
  }

  private restoreUser(): User | null {
    const userId = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);

    return userId && token ? this.storage.findUser(userId) : null;
  }
}
