import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Header } from './shared/header/header';
import { AuthService } from './services/auth-service';
import { routeAnimations } from './shared/animations/route-animations';
import { ToastContainer } from './shared/toast/toast-container';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [routeAnimations]
})
export class App {
  protected readonly title = signal('cmsv2026-angular');
  showHeader = false;

  constructor(private router: Router, private authService: AuthService) {
    this.showHeader = this.authService.isLoggedIn();
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.showHeader = this.authService.isLoggedIn();
    });
  }

  /** Keys the route animation trigger off the current URL so every navigation replays it. */
  animationKey(outlet: RouterOutlet): string {
    return outlet?.isActivated ? outlet.activatedRoute.snapshot.url.join('/') : '';
  }
}
