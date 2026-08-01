import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

import { loadPharmacyTheme, unloadPharmacyTheme } from '../utils/pharmacy-theme';

@Component({
  selector: 'app-pharmacy-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './pharmacy-layout.html',
  styleUrl: './pharmacy-layout.css'
})
export class PharmacyLayout implements OnInit, OnDestroy {
  sidebarCollapsed = false;

  themeReady = false;

  // Flips to true only once every pharmacy stylesheet (Bootstrap 5,
  // Font Awesome 6, Google Font, pharmacy-global.css) has finished loading.
  // The template keeps the shell (and therefore <router-outlet>, which is
  // what actually mounts dashboard/medicine/stock/etc.) unrendered until
  // this is true, so no child pharmacy page — including the dashboard's
  // Chart.js init — can start before its styles are in effect.
 

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    loadPharmacyTheme().then(() => {
      this.themeReady = true;
    });
  }

  ngOnDestroy(): void {
    unloadPharmacyTheme();
  }

  get username(): string {
    return this.authService.getFullName() ?? 'Pharmacist';
  }

  logout(): void {
    // Uses the team's session-cookie based AuthService (POST /api/login/logout),
    // same flow used by every other module's logout button.
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
