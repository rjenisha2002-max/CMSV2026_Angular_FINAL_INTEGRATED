import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../services/pharmacy.service';
import { Prescription } from '../models/prescription.model';
import { StockCheckResult } from '../models/dispensing.model';

@Component({
  selector: 'app-dispensing-create',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dispensing-create.html',
  styleUrl: './dispensing-create.css'
})
export class DispensingCreate implements OnInit {
  prescriptions:      Prescription[]    = [];
  loading             = true;
  dispensing          = false;
  error               = '';

  // Modal state
  modalPrescription:  Prescription | null = null;
  modalRemarks        = '';
  showModal           = false;

  // Stock check state
  stockCheck:         StockCheckResult | null = null;
  stockChecking       = false;

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(private pharmacyService: PharmacyService, private router: Router) {}

  ngOnInit(): void {
    this.pharmacyService.getDispensablePrescriptions().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (data) => { this.prescriptions = data; },
      error: (err) => {
        this.error = err?.status === 401
          ? 'Session expired. Please log in again.'
          : 'Failed to load pending prescriptions. Please try again.';
      }
    });
  }

  refNo(id: number): string { return `RX-${String(id).padStart(5, '0')}`; }

  statusClass(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':              return 'badge-warn';
      case 'partially dispensed':  return 'badge-orange';
      default:                     return 'badge-gray';
    }
  }

  openModal(rx: Prescription): void {
    this.modalPrescription = rx;
    this.modalRemarks      = '';
    this.error             = '';
    this.stockCheck        = null;
    this.showModal         = true;

    // Run stock check immediately when modal opens
    this.stockChecking = true;
    this.pharmacyService.checkStock(rx.prescriptionId).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.stockChecking = false; this.cdr.markForCheck(); })
    ).subscribe({
      next:  (result) => { this.stockCheck = result; },
      error: () => {
        // If check fails, still allow dispense attempt — the SP will catch it
        this.stockCheck = null;
      }
    });
  }

  closeModal(): void {
    this.showModal         = false;
    this.modalPrescription = null;
    this.modalRemarks      = '';
    this.stockCheck        = null;
  }

  /** True only when stock check passed (or check not yet returned). */
  get canConfirm(): boolean {
    if (this.dispensing)    return false;
    if (this.stockChecking) return false;
    if (this.stockCheck === null) return true;   // check failed to load — allow attempt
    return this.stockCheck.canDispense;
  }

  confirmDispense(): void {
    if (!this.modalPrescription) return;
    this.dispensing = true;
    this.error      = '';

    this.pharmacyService.dispenseAndBill(
      this.modalPrescription.prescriptionId,
      this.modalRemarks || undefined
    ).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.dispensing = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => { this.router.navigate(['/pharmacy/bills', res.result.billId]); },
      error: (err) => {
        this.closeModal();
        this.error = err?.error?.message || 'Failed to dispense prescription. Please try again.';
      }
    });
  }
}
