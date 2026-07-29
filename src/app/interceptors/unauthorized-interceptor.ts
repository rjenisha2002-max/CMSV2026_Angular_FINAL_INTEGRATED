import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';

/**
 * If the session has expired server-side (session cookie TTL is 30 minutes,
 * see Program.cs AddSession), every subsequent call returns 401. Bounce the
 * user back to /login instead of leaving them stuck on a broken screen.
 */
export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        auth.clearLocalSession();
        router.navigate(['/login'], { queryParams: { sessionExpired: true } });
      }
      return throwError(() => err);
    })
  );
};
