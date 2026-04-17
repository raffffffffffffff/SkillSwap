import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideEventPlugins } from '@taiga-ui/event-plugins';
import { provideTaiga } from '@taiga-ui/core';

import { errorInterceptor } from './core/interceptors/error.interceptor';
import { mockApiInterceptor } from './core/interceptors/mock-api.interceptor';
import { tokenInterceptor } from './core/interceptors/token.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([mockApiInterceptor, tokenInterceptor, errorInterceptor])),
    provideTaiga(),
    provideEventPlugins(),
  ],
};
