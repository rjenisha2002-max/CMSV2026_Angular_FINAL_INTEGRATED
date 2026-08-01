import { Component, OnInit, OnDestroy, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../services/pharmacy.service';
import { BillViewModel, BillItemViewModel } from '../models/bill.model';
import { generateBillPdf } from '../utils/bill-pdf';
import { loadPharmacyTheme, unloadPharmacyTheme } from '../utils/pharmacy-theme';

@Component({
  selector: 'app-bill-invoice',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bill-invoice.html',
  styleUrl: './bill-invoice.css'
})
export class BillInvoice implements OnInit, OnDestroy {
  bill:  BillViewModel | null = null;
  items: BillItemViewModel[]  = [];
  loading = true;
  error   = '';

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(
    private pharmacyService: PharmacyService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    loadPharmacyTheme();
    const id = +this.route.snapshot.paramMap.get('id')!;

    this.pharmacyService.getBillDetails(id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => {
        this.bill  = res.bill;
        this.items = res.items;
        setTimeout(() => window.print(), 400);
      },
      error: () => { this.error = 'Invoice not found or failed to load. Please close this tab and try again.'; }
    });
  }

  get totalAmount(): number { return this.items.reduce((s, i) => s + i.amount, 0); }

  billNo(id: number): string { return `BILL-${String(id).padStart(6, '0')}`; }

  downloadPdf(): void {
    if (!this.bill || !this.items.length) return;
    try {
      generateBillPdf(this.bill, this.items);
    } catch {
      this.error = 'PDF generation failed. Please try again.';
    }
  }

  print(): void { window.print(); }

  ngOnDestroy(): void {
    unloadPharmacyTheme();
  }
}
