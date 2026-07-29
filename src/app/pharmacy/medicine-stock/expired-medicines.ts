import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../services/pharmacy.service';
import { MedicineStock } from '../models/medicine-stock.model';

@Component({
  selector: 'app-expired-medicines',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="ph-page">

      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <div class="page-title">
            <i class="fa-solid fa-skull-crossbones me-2" style="color:#dc2626;font-size:18px;"></i>
            Expired Medicines
          </div>
          <div class="page-sub">All expired stock batches requiring disposal</div>
        </div>
        <a routerLink="/pharmacy/stock" class="btn-outline-cms btn-sm-cms">
          <i class="fa-solid fa-arrow-left"></i> Back to Stock
        </a>
      </div>

      <div *ngIf="loading" class="ph-loading">
        <div class="spinner-border text-danger"></div>
        <span class="text-muted">Loading expired medicines…</span>
      </div>
      <div *ngIf="error" class="alert alert-danger">
        <i class="fa-solid fa-circle-exclamation me-2"></i>{{ error }}
      </div>

      <div class="cms-card" *ngIf="!loading">
        <div class="cms-card-header">
          <span class="cms-card-title">
            <i class="fa-solid fa-skull-crossbones" style="color:#dc2626;"></i>
            Expired Stock Batches
          </span>
          <span class="badge-cms badge-danger">{{ stocks.length }} batches</span>
        </div>

        <div style="overflow-x:auto;">
          <table class="cms-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Batch No</th>
                <th class="text-center">Quantity</th>
                <th>Expiry Date</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of stocks" class="alert-row">
                <td style="font-weight:600;">{{ s.medicineName }}</td>
                <td>{{ s.batchNumber }}</td>
                <td class="text-center" style="font-weight:600;">{{ s.quantity }}</td>
                <td>
                  <span class="badge-cms badge-danger">{{ s.expiryDate | date:'dd MMM yyyy' }}</span>
                </td>
                <td class="text-center">
                  <span class="badge-cms badge-danger" style="font-weight:700;">
                    <i class="fa-solid fa-ban me-1"></i>Expired
                  </span>
                </td>
              </tr>
              <tr *ngIf="stocks.length === 0">
                <td colspan="5" style="text-align:center;padding:36px;color:#94a3b8;">
                  <i class="fa-solid fa-circle-check fa-2x d-block mb-2" style="color:#16a34a;"></i>
                  No expired medicines found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class ExpiredMedicines implements OnInit {
  stocks:  MedicineStock[] = [];
  loading  = true;
  error    = '';

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit(): void {
    this.pharmacyService.getExpiredMedicines().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (d) => { this.stocks = d; },
      error: () => { this.error = 'Failed to load expired medicines data. Please try again.'; }
    });
  }
}
