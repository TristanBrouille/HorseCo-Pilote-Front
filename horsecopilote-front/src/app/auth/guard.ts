import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './authService';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  try {
    await authService.getMe();

    return true;
  } catch (error) {
    await router.navigate(['/login']);
    return false;
  }
};

// UI only: the back refuses non-admin writes anyway.
export const adminGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  try {
    const me = await authService.getMe();
    return me.role === 'ADMIN' ? true : router.createUrlTree(['/']);
  } catch {
    return router.createUrlTree(['/login']);
  }
};
