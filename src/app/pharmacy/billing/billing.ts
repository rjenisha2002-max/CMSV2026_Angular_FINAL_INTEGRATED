import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../services/pharmacy.service';
import { BillViewModel } from '../models/bill.model';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './billing.html',
  styleUrl: './billing.css'
})
export class Billing implements OnInit {
  bills:     BillViewModel[] = [];
  filtered:  BillViewModel[] = [];
  loading    = true;
  error      = '';
  searchTerm = '';

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit(): void {
    this.pharmacyService.getAllBills().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (data) => { this.bills = data; this.filtered = data; },
      error: (err) => {
        this.error = err?.status === 401
          ? 'Session expired. Please log in again.'
          : 'Failed to load bills. Please try again.';
      }
    });
  }

  filter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filtered = this.bills.filter(b =>
      !term ||
      b.patientName?.toLowerCase().includes(term) ||
      b.patientCode?.toLowerCase().includes(term) ||
      this.billNo(b.billId).toLowerCase().includes(term)
    );
  }

  clearSearch(): void { this.searchTerm = ''; this.filtered = this.bills; }

  billNo(id: number): string { return `BILL-${String(id).padStart(6, '0')}`; }

  statusClass(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'paid':                         return 'badge-success';
      case 'pending':                      return 'badge-warn';
      case 'cancelled': case 'canceled':   return 'badge-danger';
      default:                             return 'badge-gray';
    }
  }
}
