import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, UserRole } from './services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const requiredRole = route.data?.['role'] as UserRole | undefined;

  if (!auth.isLoggedIn()) {
    return router.parseUrl('/login');
  }

  if (requiredRole && auth.role() !== requiredRole) {
    return router.parseUrl('/login');
  }

  return true;
};
