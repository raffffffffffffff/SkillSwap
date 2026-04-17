import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';
import { AppShellComponent } from './shared/layout/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'discover',
        loadComponent: () => import('./features/discover/discover.component').then((m) => m.DiscoverComponent),
      },
      {
        path: 'requests',
        loadComponent: () => import('./features/requests/requests.component').then((m) => m.RequestsComponent),
      },
      {
        path: 'matches',
        loadComponent: () => import('./features/matches/matches.component').then((m) => m.MatchesComponent),
      },
      {
        path: 'sessions',
        loadComponent: () => import('./features/sessions/sessions.component').then((m) => m.SessionsComponent),
      },
      {
        path: 'reviews',
        loadComponent: () => import('./features/reviews/reviews.component').then((m) => m.ReviewsComponent),
      },
      {
        path: 'groups',
        loadComponent: () => import('./features/groups/groups.component').then((m) => m.GroupsComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
