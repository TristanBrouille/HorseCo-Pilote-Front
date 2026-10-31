import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Shell } from './decor/shell/shell';
import { adminGuard, authGuard, coachGuard, memberGuard } from './auth/guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'admin/creneaux',
        loadComponent: () => import('./weekly-slots/weekly-slots').then((m) => m.WeeklySlots),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/chevaux',
        loadComponent: () => import('./horses/horses').then((m) => m.Horses),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/membres',
        loadComponent: () => import('./members/members').then((m) => m.Members),
        canActivate: [adminGuard],
      },
      {
        path: 'coach/cours',
        loadComponent: () => import('./coach-lessons/coach-lessons').then((m) => m.CoachLessons),
        canActivate: [coachGuard],
      },
      {
        path: 'coach/preparation',
        loadComponent: () =>
          import('./coach-lessons/preparation/preparation').then((m) => m.Preparation),
        canActivate: [coachGuard],
      },
      {
        path: 'membre/cours',
        loadComponent: () =>
          import('./my-reservations/my-reservations').then((m) => m.MyReservations),
        canActivate: [memberGuard],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '', // Redirige vers la racine (qui elle-même passera par le Guard)
  },
];
