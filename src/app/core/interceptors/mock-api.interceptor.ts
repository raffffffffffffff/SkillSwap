import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';

export const mockApiInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api')) {
    return next(request);
  }

  return of(
    new HttpResponse({
      status: 200,
      body: {
        ok: true,
        endpoint: request.url,
        method: request.method,
      },
    }),
  );
};
