import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin/creneaux',
    loadComponent: () => import('./weekly-slots/weekly-slots').then((m) => m.WeeklySlots),
  },
  { path: '', redirectTo: 'admin/creneaux', pathMatch: 'full' },
];
