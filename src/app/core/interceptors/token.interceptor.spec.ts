import { HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { tokenInterceptor } from './token.interceptor';

describe('tokenInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('adds bearer token when session exists', async () => {
    localStorage.setItem('skillswap-token', 'mock-token');
    const request = new HttpRequest('GET', '/api/users');

    const response = await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        tokenInterceptor(request, (next) => {
          expect(next.headers.get('Authorization')).toBe('Bearer mock-token');
          return of({} as never);
        }),
      ),
    );

    expect(response).toBeTruthy();
  });
});
