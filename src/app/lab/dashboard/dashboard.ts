import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LabService } from '../../services/lab-service';
import { LabWorkloadHeatmap } from '../workload-heatmap/workload-heatmap';
import { StatCard } from '../../shared/stat-card/stat-card';
import { SkeletonCards } from '../../shared/skeleton/skeleton';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-lab-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LabWorkloadHeatmap, StatCard, SkeletonCards],
  templateUrl: './dashboard.html'
})
export class LabDashboard implements OnInit {
  technicianName = '';
  stats: any = {};
  loading = true;
  error = '';

  constructor(private labService: LabService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.labService.getDashboard().subscribe({
      next: (res) => {
        this.technicianName = res.technicianName;
        this.stats = res.stats ?? {};
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load dashboard.';
        this.loading = false;
        this.toastService.error(this.error);
      }
    });
  }
}
