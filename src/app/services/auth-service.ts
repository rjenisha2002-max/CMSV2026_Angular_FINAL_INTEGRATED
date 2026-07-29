import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  userId: number;
  roleName: string;
  fullName: string;
  next: string; // e.g. "api/doctor/dashboard" - mirrors the original MVC redirect target
  message?: string;
}

/**
 * Auth against the InfinityCoderzz WebAPI.
 *
 * The backend uses a server-side session cookie (see AddSession /
 * ".InfinityClinic.Session" in Program.cs), NOT a JWT. Every request must be
 * sent withCredentials: true (handled globally by the credentials
 * interceptor) so the browser attaches/receives that cookie. We keep a
 * lightweight copy of role/fullName in localStorage purely so the Angular
 * router/menu can react without re-hitting the API - it is never used to
 * authenticate a request, the session cookie does that.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/login`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.baseUrl, { username, password }).pipe(
      tap((res) => {
        if (res?.roleName) {
          localStorage.setItem('ROLE', res.roleName);
          localStorage.setItem('FULL_NAME', res.fullName ?? '');
          localStorage.setItem('IS_LOGGED_IN', 'true');
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}).pipe(tap(() => this.clearLocalSession()));
  }

  clearLocalSession(): void {
    localStorage.removeItem('ROLE');
    localStorage.removeItem('FULL_NAME');
    localStorage.removeItem('IS_LOGGED_IN');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('IS_LOGGED_IN') === 'true';
  }

  getRole(): string | null {
    return localStorage.getItem('ROLE');
  }

  getFullName(): string | null {
    return localStorage.getItem('FULL_NAME');
  }

  /** Maps a role name to its Angular dashboard route, mirroring LoginController's "next". */
  dashboardRouteForRole(role: string | null): string {
    switch (role) {
      case 'Doctor': return '/doctor/dashboard';
      case 'Receptionist': return '/reception/dashboard';
      case 'Lab Technician': return '/lab/dashboard';
      case 'Pharmacist': return '/pharmacy/dashboard';
      default: return '/login';
    }
  }
}
