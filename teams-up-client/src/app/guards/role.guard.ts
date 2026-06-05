import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as UserRole[];

  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  if (authService.hasRole(...expectedRoles)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
