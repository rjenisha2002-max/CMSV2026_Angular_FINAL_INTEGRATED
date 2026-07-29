import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../services/pharmacy.service';
import { BillViewModel, BillItemViewModel, BillPrescriptionLink } from '../models/bill.model';
import { generateBillPdf } from '../utils/bill-pdf';

@Component({
  selector: 'app-bill-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './bill-details.html',
  styleUrl: './bill-details.css'
})
export class BillDetails implements OnInit {
  bill:             BillViewModel | null      = null;
  items:            BillItemViewModel[]       = [];
  prescriptionLink: BillPrescriptionLink | null = null;
  loading          = true;
  error            = '';
  successMsg       = '';
  cancelReason     = '';
  showCancelModal  = false;
  cancelling       = false;
  billId           = 0;

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(
    private pharmacyService: PharmacyService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.billId = +this.route.snapshot.paramMap.get('id')!;

    this.pharmacyService.getBillDetails(this.billId).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => {
        this.bill             = res.bill;
        this.items            = res.items;
        this.prescriptionLink = res.prescriptionLink;
      },
      error: () => { this.error = 'Bill not found or failed to load. Please go back and try again.'; }
    });
  }

  get totalAmount(): number { return this.items.reduce((sum, item) => sum + (item.amount ?? 0), 0); }

  billNo(id: number): string   { return `BILL-${String(id).padStart(6, '0')}`; }
  rxNo(id: number): string     { return `RX-${String(id).padStart(5, '0')}`; }
  dispNo(id: number): string   { return `DISP-${String(id).padStart(5, '0')}`; }

  statusClass(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'paid':                         return 'badge-success';
      case 'pending':                      return 'badge-warn';
      case 'cancelled': case 'canceled':   return 'badge-danger';
      default:                             return 'badge-gray';
    }
  }

  openCancelModal(): void {
    this.cancelReason    = '';
    this.error           = '';
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.cancelReason    = '';
  }

  cancelBill(): void {
    if (!this.bill || !this.cancelReason.trim()) return;
    this.cancelling = true;
    this.error      = '';
    this.successMsg = '';

    this.pharmacyService.cancelBill(this.bill.billId, this.cancelReason.trim()).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.cancelling = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => {
        if (this.bill) this.bill.status = 'Cancelled';
        this.successMsg  = res.message || 'Bill cancelled. Stock has been restored.';
        this.closeCancelModal();
      },
      error: (err) => {
        this.closeCancelModal();
        this.error = err?.error?.message || 'Failed to cancel bill. Please try again.';
      }
    });
  }

  openInvoicePdf(): void {
    if (!this.bill || !this.items.length) {
      this.error = 'Bill data not loaded yet. Please wait and try again.';
      return;
    }
    try {
      generateBillPdf(this.bill, this.items);
    } catch {
      this.error = 'PDF generation failed. Please try again.';
    }
  }
}
