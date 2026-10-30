import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { adminGuard, authGuard } from './auth/guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
  },
  {
    path: '',
    component: Dashboard, // La page où l'utilisateur arrive s'il est connecté
    canActivate: [authGuard], // On applique le Guard ici
  },
  {
    path: 'admin/creneaux',
    loadComponent: () => import('./weekly-slots/weekly-slots').then((m) => m.WeeklySlots),
    canActivate: [adminGuard],
  },
  {
    path: 'admin/membres',
    loadComponent: () => import('./members/members').then((m) => m.Members),
    canActivate: [adminGuard],
  },
  {
    path: '**',
    redirectTo: '', // Redirige vers la racine (qui elle-même passera par le Guard)
  },
];
