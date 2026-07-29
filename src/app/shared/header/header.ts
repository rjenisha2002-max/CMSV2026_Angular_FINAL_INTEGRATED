import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  constructor(public authService: AuthService, private router: Router) {}

  get role(): string | null {
    return this.authService.getRole();
  }

  get fullName(): string | null {
    return this.authService.getFullName();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        // Even if the API call fails, drop the local session so the UI
        // doesn't stay stuck showing a logged-in state.
        this.authService.clearLocalSession();
        this.router.navigate(['/login']);
      }
    });
  }
}
