import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../services/pharmacy.service';
import { InventoryLog as InventoryLogModel } from '../models/audit-log.model';

@Component({
  selector: 'app-inventory-log',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="ph-page">

      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <div class="page-title">Inventory Log</div>
          <div class="page-sub">Complete stock movement history</div>
        </div>
        <a routerLink="/pharmacy/stock" class="btn-outline-cms btn-sm-cms">
          <i class="fa-solid fa-arrow-left me-1"></i> Back to Stock
        </a>
      </div>

      <div *ngIf="error" class="alert alert-danger">
        <i class="fa-solid fa-circle-exclamation me-2"></i>{{ error }}
      </div>
      <div *ngIf="loading" class="ph-loading">
        <div class="spinner-border text-info"></div>
        <span class="text-muted">Loading inventory movements…</span>
      </div>

      <div class="cms-card" *ngIf="!loading">
        <div class="cms-card-header">
          <span class="cms-card-title">
            <i class="fa-solid fa-list-check"></i> Stock Movements
          </span>
          <span class="badge-cms badge-blue">{{ logs.length }} records</span>
        </div>

        <div style="overflow-x:auto;">
          <table class="cms-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Qty Changed</th>
                <th>Transaction Type</th>
                <th>Date</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of logs">
                <td style="font-weight:600;">{{ log.medicineName || '—' }}</td>
                <td>
                  <span *ngIf="log.quantityChanged > 0" style="color:#198754;font-weight:600;">
                    +{{ log.quantityChanged }}
                  </span>
                  <span *ngIf="log.quantityChanged <= 0" style="color:#475569;font-weight:600;">
                    {{ log.quantityChanged }}
                  </span>
                </td>
                <td>
                  <span class="badge-cms" [ngClass]="typeClass(log.transactionType)">
                    {{ log.transactionType || '—' }}
                  </span>
                </td>
                <td>{{ log.transactionDate | date:'dd MMM yyyy' }}</td>
                <td style="color:#64748b;">{{ log.remarks || '—' }}</td>
              </tr>
              <tr *ngIf="logs.length === 0">
                <td colspan="5" style="text-align:center;padding:36px;color:#94a3b8;">
                  <i class="fa-solid fa-list-check fa-2x d-block mb-2"></i>
                  No inventory log records
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class InventoryLog implements OnInit {
  logs:   InventoryLogModel[] = [];
  loading = true;
  error   = '';

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit(): void {
    this.pharmacyService.getInventoryLogs().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (data) => { this.logs = data; },
      error: () => { this.error = 'Failed to load inventory logs. Please try again.'; }
    });
  }

  typeClass(type?: string): string {
    switch (type?.toLowerCase()) {
      case 'purchase':                              return 'badge-success';
      case 'sale': case 'dispense':                 return 'badge-blue';
      case 'cancel': case 'stockrestore':           return 'badge-warn';
      case 'adjustment':                            return 'badge-blue';
      case 'expired': case 'write-off':             return 'badge-danger';
      default:                                      return 'badge-gray';
    }
  }
}
