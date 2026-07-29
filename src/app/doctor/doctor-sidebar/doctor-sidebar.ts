import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-doctor-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './doctor-sidebar.html',
  styleUrl: './doctor-sidebar.scss'
})
export class DoctorSidebar {
  collapsed = false;
  today = new Date();

  constructor(public authService: AuthService, private router: Router) {}

  get fullName(): string | null {
    return this.authService.getFullName();
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.authService.clearLocalSession();
        this.router.navigate(['/login']);
      }
    });
  }
}