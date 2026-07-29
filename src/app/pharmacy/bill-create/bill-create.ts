import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../services/pharmacy.service';
import { PatientLookup, MedicineForBilling, BillItemEntryViewModel } from '../models/bill.model';

@Component({
  selector: 'app-bill-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './bill-create.html',
  styleUrl: './bill-create.css'
})
export class BillCreate implements OnInit {
  patients:          PatientLookup[]         = [];
  medicines:         MedicineForBilling[]     = [];
  billItems:         BillItemEntryViewModel[] = [];
  selectedPatientId  = 0;
  selectedMedicineId = 0;
  selectedQty        = 1;
  errorMsg           = '';
  submitting         = false;
  loading            = true;

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(private pharmacyService: PharmacyService, private router: Router) {}

  ngOnInit(): void {
    this.pharmacyService.getNewBillMeta().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (meta) => { this.patients = meta.patients; this.medicines = meta.medicines; },
      error: () => { this.errorMsg = 'Failed to load billing form data. Please refresh and try again.'; }
    });
  }

  get selectedMedicine(): MedicineForBilling | undefined {
    return this.medicines.find(m => m.medicineId === +this.selectedMedicineId);
  }

  get totalAmount(): number { return this.billItems.reduce((sum, i) => sum + i.amount, 0); }

  addItem(): void {
    const med = this.selectedMedicine;
    if (!med) { this.errorMsg = 'Please select a medicine.'; return; }
    if (this.selectedQty < 1) { this.errorMsg = 'Quantity must be at least 1.'; return; }

    const existing = this.billItems.find(i => i.medicineId === med.medicineId);
    if (existing) {
      existing.quantity += +this.selectedQty;
      existing.amount    = existing.quantity * existing.unitPrice;
    } else {
      this.billItems.push({
        medicineId:   med.medicineId,
        medicineName: med.medicineName,
        quantity:     +this.selectedQty,
        unitPrice:    med.unitPrice,
        amount:       +this.selectedQty * med.unitPrice
      });
    }
    this.errorMsg           = '';
    this.selectedMedicineId = 0;
    this.selectedQty        = 1;
  }

  removeItem(index: number): void { this.billItems.splice(index, 1); }

  onSubmit(): void {
    if (!this.selectedPatientId || +this.selectedPatientId === 0) {
      this.errorMsg = 'Please select a patient.'; return;
    }
    if (this.billItems.length === 0) {
      this.errorMsg = 'Please add at least one medicine to the bill.'; return;
    }

    this.submitting = true;
    this.errorMsg   = '';

    this.pharmacyService.createBill({
      patientId:   +this.selectedPatientId,
      billItems:   this.billItems,
      totalAmount: this.totalAmount
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.submitting = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => { this.router.navigate(['/pharmacy/bills', res.bill.billId]); },
      error: (err) => { this.errorMsg = err?.error?.message || 'Failed to create bill. Please try again.'; }
    });
  }
}
