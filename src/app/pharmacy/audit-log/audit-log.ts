import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../services/pharmacy.service';
import { AuditLog as AuditLogModel } from '../models/audit-log.model';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="ph-page">

      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <div class="page-title">Audit Log</div>
          <div class="page-sub">Complete history of all pharmacist activity</div>
        </div>
        <a routerLink="/pharmacy/dashboard" class="btn-outline-cms btn-sm-cms">
          <i class="fa-solid fa-arrow-left me-1"></i> Dashboard
        </a>
      </div>

      <!-- Date filter card -->
      <div class="cms-card mb-4">
        <div class="cms-card-header">
          <span class="cms-card-title">
            <i class="fa-solid fa-filter"></i> Filter by Date Range
          </span>
        </div>
        <div class="cms-card-body">
          <div class="row g-3 align-items-end">
            <div class="col-md-4">
              <label class="form-label-cms">From Date</label>
              <input type="date" class="form-control-cms" [(ngModel)]="fromDate" />
            </div>
            <div class="col-md-4">
              <label class="form-label-cms">To Date</label>
              <input type="date" class="form-control-cms" [(ngModel)]="toDate" />
            </div>
            <div class="col-md-4 d-flex gap-2">
              <button class="btn-primary-cms" (click)="loadLogs()" [disabled]="loading">
                <i class="fa-solid fa-magnifying-glass"></i> Filter
              </button>
              <button class="btn-outline-cms" (click)="clearFilter()" [disabled]="loading">
                <i class="fa-solid fa-xmark"></i> Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="error" class="alert alert-danger">
        <i class="fa-solid fa-circle-exclamation me-2"></i>{{ error }}
      </div>
      <div *ngIf="loading" class="ph-loading">
        <div class="spinner-border text-primary"></div>
        <span class="text-muted">Loading audit logs…</span>
      </div>

      <div class="cms-card" *ngIf="!loading">
        <div class="cms-card-header">
          <span class="cms-card-title">
            <i class="fa-solid fa-shield-halved"></i> Activity Records
          </span>
          <span class="badge-cms badge-blue">{{ logs.length }} records</span>
        </div>

        <div style="overflow-x:auto;">
          <table class="cms-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Action</th>
                <th>Remarks / Details</th>
                <th>Date &amp; Time</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of logs">
                <td style="color:#94a3b8;font-size:12px;">{{ log.logId }}</td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <span style="width:28px;height:28px;background:#ede9fe;color:#6d28d9;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">
                      {{ (log.username || 'U').charAt(0).toUpperCase() }}
                    </span>
                    <span style="font-weight:600;">{{ log.username || '—' }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge-cms" [ngClass]="actionBadge(log.action)">
                    {{ log.action || '—' }}
                  </span>
                </td>
                <td style="color:#64748b;font-size:13px;max-width:260px;">{{ log.remarks || '—' }}</td>
                <td style="white-space:nowrap;">{{ log.logDate | date:'dd MMM yyyy, HH:mm' }}</td>
              </tr>
              <tr *ngIf="logs.length === 0">
                <td colspan="5" style="text-align:center;padding:36px;color:#94a3b8;">
                  <i class="fa-solid fa-shield-halved fa-2x d-block mb-2"></i>
                  No audit records found for the selected period.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class AuditLog implements OnInit {
  logs:     AuditLogModel[] = [];
  loading   = true;
  error     = '';
  fromDate  = '';
  toDate    = '';

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit(): void { this.loadLogs(); }

  loadLogs(): void {
    this.loading = true;
    this.error   = '';

    this.pharmacyService.getAuditLogs(this.fromDate || undefined, this.toDate || undefined).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (data) => { this.logs = data; },
      error: () => { this.error = 'Failed to load audit logs. Please try again.'; }
    });
  }

  clearFilter(): void { this.fromDate = ''; this.toDate = ''; this.loadLogs(); }

  actionBadge(action?: string): string {
    const a = action?.toLowerCase() ?? '';
    if (a.includes('add') || a.includes('creat'))                           return 'badge-success';
    if (a.includes('edit') || a.includes('updat'))                          return 'badge-blue';
    if (a.includes('delet') || a.includes('remov') || a.includes('cancel')) return 'badge-danger';
    if (a.includes('login') || a.includes('logout'))                        return 'badge-gray';
    if (a.includes('dispens') || a.includes('bill'))                        return 'badge-warn';
    return 'badge-gray';
  }
}
