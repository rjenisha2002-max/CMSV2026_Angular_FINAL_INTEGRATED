import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router
} from '@angular/router';

import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.authService.clearLocalSession();
        this.router.navigate(['/login']);
      }
    });
  }
}