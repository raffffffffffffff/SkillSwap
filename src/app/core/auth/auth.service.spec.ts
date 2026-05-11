import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: '',
})
class BlankComponent {}

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'login', component: BlankComponent }])] });
  });

  it('logs in demo user and stores token', () => {
    const auth = TestBed.inject(AuthService);

    expect(auth.login('alina@example.com', 'password')).toBe(true);
    expect(auth.currentUser()?.email).toBe('alina@example.com');
    expect(localStorage.getItem('skillswap-token')).toContain('mock-jwt');
  });

  it('rejects wrong password', () => {
    const auth = TestBed.inject(AuthService);

    expect(auth.login('alina@example.com', 'wrong-pass')).toBe(false);
    expect(auth.currentUser()).toBeNull();
  });

  it('logs out and clears session', () => {
    const auth = TestBed.inject(AuthService);
    auth.login('alina@example.com', 'password');

    auth.logout();

    expect(auth.currentUser()).toBeNull();
    expect(localStorage.getItem('skillswap-token')).toBeNull();
  });
});
