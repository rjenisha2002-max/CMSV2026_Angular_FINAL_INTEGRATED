import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabService } from '../../services/lab-service';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-lab-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html'
})
export class LabReports implements OnInit {
  searchMMR = '';
  results: any[] = [];
  loading = true;
  error = '';
  message = '';
  detail: any = null;

  constructor(private labService: LabService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.labService.getReports(this.searchMMR).subscribe({
      next: (res) => {
        this.results = res.results ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load reports.';
        this.loading = false;
      }
    });
  }

  viewDetail(resultId: number): void {
    this.labService.getResultDetail(resultId).subscribe({
      next: (res) => (this.detail = res),
      error: (err) => (this.error = err?.error?.message ?? 'Failed to load result detail.')
    });
  }

  resend(resultId: number): void {
    this.message = '';
    this.labService.resendEmail(resultId, this.searchMMR).subscribe({
      next: (res) => {
        this.message = res.message;
        this.toastService.success(res.message ?? 'Email resent successfully.');
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to resend email.';
        this.toastService.error(this.error);
      }
    });
  }
}
