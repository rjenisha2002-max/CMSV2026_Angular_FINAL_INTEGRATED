import { HttpInterceptorFn } from '@angular/common/http';

/**
 * The backend authenticates via a session cookie, not a bearer token.
 * withCredentials must be true on every request so the browser sends the
 * cookie and accepts the Set-Cookie from the login response.
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ withCredentials: true }));
};
