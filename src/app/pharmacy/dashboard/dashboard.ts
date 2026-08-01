import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
  DestroyRef,
  ChangeDetectorRef
} from '@angular/core';
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
export class PharmacyDashboard implements OnInit, AfterViewInit, OnDestroy {


  
  dashboard:     DashboardData | null = null;
  loading  = true;
  error    = '';
  today    = new Date();
  pharmacistName = 'Pharmacist';


  private viewReady = false;
private dashboardData: DashboardData | null = null;

  private revenueChart:    Chart | null = null;
  private dispensingChart: Chart | null = null;


  @ViewChild('revenueCanvas')
revenueCanvas!: ElementRef<HTMLCanvasElement>;

@ViewChild('dispensingCanvas')
dispensingCanvas!: ElementRef<HTMLCanvasElement>;

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(
    private pharmacyService: PharmacyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

   // console.log("Dashboard ngOnInit");
    this.pharmacistName = this.authService.getFullName() ?? 'Pharmacist';
    this.loading = true;
    this.error   = '';

    this.pharmacyService.getDashboard().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (data) => {

  // console.log("Dashboard API:", data);

  this.dashboard = data;
  this.dashboardData = data;

  this.loading = false;

  this.cdr.detectChanges();

  this.tryInitializeCharts();
},
      error: (err) => {
        this.error = err?.status === 401
          ? 'Session expired. Please log in again.'
          : 'Failed to load dashboard data. Please check your connection.';
      }
    });
  }

  ngAfterViewInit(): void {

    // console.log("Dashboard ngAfterViewInit");
    this.viewReady = true;
    this.tryInitializeCharts();
}

private tryInitializeCharts(): void {

    if (!this.viewReady) {
        return;
    }

    if (!this.dashboardData) {
        return;
    }

    this.initCharts(this.dashboardData);
}

  private initCharts(data: DashboardData): void {

    // console.log("Dashboard Data:", data);

//console.log("Revenue Chart Data:", data.revenueChart);
//console.log("Dispensing Chart Data:", data.dispensingChart);

//console.log("Revenue Canvas:", this.revenueCanvas.nativeElement);
//console.log("Revenue Context:", this.revenueCanvas.nativeElement.getContext("2d"));

//console.log("Revenue Width:", this.revenueCanvas.nativeElement.clientWidth);
//console.log("Revenue Height:", this.revenueCanvas.nativeElement.clientHeight);




    const revLabels = data.revenueChart.map(p => p.label);
    const revValues = data.revenueChart.map(p => p.value);
    const disLabels = data.dispensingChart.map(p => p.label);
    const disValues = data.dispensingChart.map(p => p.value);

    // ── Revenue — line chart (exactly as MVC) ─────────────────────────────
   // const revEl = document.getElementById('revenueChart') as HTMLCanvasElement | null;
   //const revEl = this.revenueCanvas.nativeElement;
   const revEl = this.revenueCanvas.nativeElement;
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
    //const disEl = document.getElementById('dispensingChart') as HTMLCanvasElement | null;
    const disEl = this.dispensingCanvas.nativeElement;
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

   // console.log("Dashboard ngOnDestroy");
    this.revenueChart?.destroy();
    this.dispensingChart?.destroy();
  }
}
