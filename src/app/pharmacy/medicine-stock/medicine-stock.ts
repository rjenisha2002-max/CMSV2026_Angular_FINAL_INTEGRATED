import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../services/pharmacy.service';
import { MedicineStock } from '../models/medicine-stock.model';

@Component({
  selector: 'app-medicine-stock',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './medicine-stock.html',
  styleUrl: './medicine-stock.css'
})
export class MedicineStockList implements OnInit {
  stocks:  MedicineStock[] = [];
  loading  = true;
  error    = '';

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit(): void {
    this.pharmacyService.getAllStock().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (data) => { this.stocks = data; },
      error: (err) => {
        this.error = err?.status === 401
          ? 'Session expired. Please log in again.'
          : 'Failed to load stock. Please try again.';
      }
    });
  }

  isLow(s: MedicineStock): boolean     { return s.quantity <= 10; }
  isExpired(s: MedicineStock): boolean  { return new Date(s.expiryDate) < new Date(); }
  isExpiring(s: MedicineStock): boolean {
    const d = new Date(s.expiryDate);
    const future = new Date(); future.setDate(future.getDate() + 30);
    return !this.isExpired(s) && d < future;
  }
}
