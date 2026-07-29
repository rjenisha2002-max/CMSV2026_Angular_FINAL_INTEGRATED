import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

/** Usage: canActivate: [roleGuard('Doctor')] on a parent route. */
export function roleGuard(requiredRole: string): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    if (auth.getRole() !== requiredRole) {
      router.navigate([auth.dashboardRouteForRole(auth.getRole())]);
      return false;
    }

    return true;
  };
}
