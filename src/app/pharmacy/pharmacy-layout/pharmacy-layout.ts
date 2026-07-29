import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-pharmacy-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './pharmacy-layout.html',
  styleUrl: './pharmacy-layout.css'
})
export class PharmacyLayout {
  sidebarCollapsed = false;

  constructor(public authService: AuthService, private router: Router) {}

  get username(): string {
    return this.authService.getFullName() ?? 'Pharmacist';
  }

  logout(): void {
    // Calls POST /api/login/logout (clears server session) then clears localStorage.
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.authService.clearLocalSession();
        this.router.navigate(['/login']);
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
