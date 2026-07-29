import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../services/pharmacy.service';
import { DispensingItem } from '../models/dispensing.model';

@Component({
  selector: 'app-dispensing-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="ph-page">

      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <div class="page-title">{{ dispNo(dispenseId) }}</div>
          <div class="page-sub">Items dispensed in this transaction</div>
        </div>
        <a routerLink="/pharmacy/dispensing/history" class="btn-outline-cms btn-sm-cms">
          <i class="fa-solid fa-arrow-left me-1"></i> Back to History
        </a>
      </div>

      <div *ngIf="loading" class="ph-loading">
        <div class="spinner-border text-primary"></div>
        <span class="text-muted">Loading dispense items…</span>
      </div>
      <div *ngIf="error" class="alert alert-danger">
        <i class="fa-solid fa-circle-exclamation me-2"></i>{{ error }}
      </div>

      <div class="cms-card" *ngIf="!loading && !error">
        <div class="cms-card-header">
          <span class="cms-card-title">
            <i class="fa-solid fa-pills"></i> Dispensed Medicines
          </span>
          <span class="badge-cms badge-blue">{{ items.length }} item(s)</span>
        </div>

        <div style="overflow-x:auto;">
          <table class="cms-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th class="text-center">Qty</th>
                <th class="text-end">Unit Price</th>
                <th class="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of items; let i = index">
                <td style="color:#94a3b8;">{{ i + 1 }}</td>
                <td style="font-weight:600;">{{ item.medicineName || '—' }}</td>
                <td class="text-center">{{ item.quantityDispensed }}</td>
                <td class="text-end">₹{{ (item.unitPrice ?? 0) | number:'1.2-2' }}</td>
                <td class="text-end" style="font-weight:700;">₹{{ item.amount | number:'1.2-2' }}</td>
              </tr>
              <tr style="background:#f8fafc;font-weight:700;">
                <td colspan="4" class="text-end" style="padding:11px 14px;font-size:13px;color:#334155;letter-spacing:.3px;">
                  TOTAL AMOUNT
                </td>
                <td class="text-end" style="font-size:15px;color:#16a34a;padding:11px 14px;">
                  ₹{{ total | number:'1.2-2' }}
                </td>
              </tr>
              <tr *ngIf="items.length === 0">
                <td colspan="5" style="text-align:center;padding:36px;color:#94a3b8;">
                  <i class="fa-solid fa-pills fa-2x d-block mb-2"></i>
                  No items found for this dispense transaction.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class DispensingDetail implements OnInit {
  items:      DispensingItem[] = [];
  dispenseId  = 0;
  loading     = true;
  error       = '';

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(
    private pharmacyService: PharmacyService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.dispenseId = +this.route.snapshot.paramMap.get('id')!;

    this.pharmacyService.getDispensingItems(this.dispenseId).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (data) => { this.items = data; },
      error: () => { this.error = 'Failed to load dispense items. Please go back and try again.'; }
    });
  }

  get total(): number { return this.items.reduce((s, i) => s + (i.amount ?? 0), 0); }
  dispNo(id: number): string { return `DISP-${String(id).padStart(5, '0')}`; }
}
