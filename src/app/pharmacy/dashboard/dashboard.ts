import { Component, OnInit, OnDestroy, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Chart, registerables } from 'chart.js';
import { PharmacyService } from '../services/pharmacy.service';
import { AuthService } from '../../services/auth-service';
import { PharmacyDashboard as DashboardData } from '../models/pharmacy-dashboard.model';

// Register all Chart.js components (scales, elements, plugins)
Chart.register(...registerables);

@Component({
  selector: 'app-pharmacy-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class PharmacyDashboard implements OnInit, OnDestroy {
  dashboard:     DashboardData | null = null;
  loading  = true;
  error    = '';
  today    = new Date();
  pharmacistName = 'Pharmacist';

  private revenueChart:    Chart | null = null;
  private dispensingChart: Chart | null = null;

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(
    private pharmacyService: PharmacyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.pharmacistName = this.authService.getFullName() ?? 'Pharmacist';
    this.loading = true;
    this.error   = '';

    this.pharmacyService.getDashboard().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (data) => {
        this.dashboard = data;
        // Set loading=false and markForCheck() HERE so Angular renders the
        // *ngIf canvases before the setTimeout callback fires.
        this.loading = false;
        this.cdr.markForCheck();
        // Give Angular one rendering cycle to paint the <canvas> elements
        // that live inside *ngIf, then initialise Chart.js.
        setTimeout(() => this.initCharts(data), 0);
      },
      error: (err) => {
        this.error = err?.status === 401
          ? 'Session expired. Please log in again.'
          : 'Failed to load dashboard data. Please check your connection.';
      }
    });
  }

  private initCharts(data: DashboardData): void {
    const revLabels = data.revenueChart.map(p => p.label);
    const revValues = data.revenueChart.map(p => p.value);
    const disLabels = data.dispensingChart.map(p => p.label);
    const disValues = data.dispensingChart.map(p => p.value);

    // ── Revenue — line chart (exactly as MVC) ─────────────────────────────
    const revEl = document.getElementById('revenueChart') as HTMLCanvasElement | null;
    if (revEl) {
      if (this.revenueChart) { this.revenueChart.destroy(); }
      this.revenueChart = new Chart(revEl, {
        type: 'line',
        data: {
          labels: revLabels,
          datasets: [{
            label: 'Revenue',
            data: revValues,
            borderColor: '#198754',
            backgroundColor: 'rgba(25,135,84,.12)',
            fill: true,
            tension: 0.35,
            pointRadius: 3
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    // ── Dispensing — bar chart (exactly as MVC) ───────────────────────────
    const disEl = document.getElementById('dispensingChart') as HTMLCanvasElement | null;
    if (disEl) {
      if (this.dispensingChart) { this.dispensingChart.destroy(); }
      this.dispensingChart = new Chart(disEl, {
        type: 'bar',
        data: {
          labels: disLabels,
          datasets: [{
            label: 'Dispensed',
            data: disValues,
            backgroundColor: '#0d6efd',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }
  }

  // ── Badge for days left ───────────────────────────────────────────────────
  daysLeftBadge(days?: number): string {
    if (days == null) return 'badge-warn';
    return days <= 7 ? 'badge-danger' : 'badge-warn';
  }

  ngOnDestroy(): void {
    this.revenueChart?.destroy();
    this.dispensingChart?.destroy();
  }
}
