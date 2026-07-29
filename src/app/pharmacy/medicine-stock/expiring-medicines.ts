import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../services/pharmacy.service';
import { MedicineStock } from '../models/medicine-stock.model';

@Component({
  selector: 'app-expiring-medicines',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="ph-page">

      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <div class="page-title">
            <i class="fa-solid fa-clock me-2" style="color:#f59e0b;font-size:18px;"></i>
            Expiring Medicines
          </div>
          <div class="page-sub">Medicines expiring within 30 days</div>
        </div>
        <a routerLink="/pharmacy/stock" class="btn-outline-cms btn-sm-cms">
          <i class="fa-solid fa-arrow-left"></i> Back to Stock
        </a>
      </div>

      <div *ngIf="loading" class="ph-loading">
        <div class="spinner-border text-warning"></div>
        <span class="text-muted">Loading expiring medicines…</span>
      </div>
      <div *ngIf="error" class="alert alert-danger">
        <i class="fa-solid fa-circle-exclamation me-2"></i>{{ error }}
      </div>

      <div class="cms-card" *ngIf="!loading">
        <div class="cms-card-header">
          <span class="cms-card-title">
            <i class="fa-solid fa-clock" style="color:#f59e0b;"></i>
            Expiring Soon (≤ 30 days)
          </span>
          <span class="badge-cms badge-warn">{{ stocks.length }} batches</span>
        </div>

        <div style="overflow-x:auto;">
          <table class="cms-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Batch No</th>
                <th class="text-center">Quantity</th>
                <th>Expiry Date</th>
                <th class="text-center">Days Remaining</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of stocks" class="alert-row">
                <td style="font-weight:600;">{{ s.medicineName }}</td>
                <td>{{ s.batchNumber }}</td>
                <td class="text-center" style="font-weight:600;">{{ s.quantity }}</td>
                <td>
                  <span class="badge-cms badge-warn">{{ s.expiryDate | date:'dd MMM yyyy' }}</span>
                </td>
                <td class="text-center">
                  <span class="badge-cms badge-warn" style="font-weight:700;">
                    {{ s.daysRemaining }} days
                  </span>
                </td>
              </tr>
              <tr *ngIf="stocks.length === 0">
                <td colspan="5" style="text-align:center;padding:36px;color:#94a3b8;">
                  <i class="fa-solid fa-circle-check fa-2x d-block mb-2" style="color:#16a34a;"></i>
                  No medicines expiring within 30 days.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class ExpiringMedicines implements OnInit {
  stocks:  MedicineStock[] = [];
  loading  = true;
  error    = '';

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit(): void {
    this.pharmacyService.getExpiringMedicines().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (d) => { this.stocks = d; },
      error: () => { this.error = 'Failed to load expiring medicines data. Please try again.'; }
    });
  }
}
