import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../services/pharmacy.service';

@Component({
  selector: 'app-medicine-stock-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './medicine-stock-edit.html',
  styleUrl: './medicine-stock.css'
})
export class MedicineStockEdit implements OnInit {
  form!: FormGroup;
  loading              = true;
  submitting           = false;
  errorMsg             = '';
  successMsg           = '';
  stockId              = 0;
  medicineName         = '';
  batchNumber          = '';
  purchaseDateDisplay  = '';   // readonly — sp_UpdateMedicineStock does not update PurchaseDate

  /** The expiry date string as loaded from the server (yyyy-MM-dd).
   *  If the pharmacist leaves it unchanged, it is always valid even if already expired.
   *  Only changing it TO a new past date is blocked — matching MVC behaviour. */
  private originalExpiryDate = '';

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(
    private fb: FormBuilder,
    private pharmacyService: PharmacyService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.stockId = +this.route.snapshot.paramMap.get('id')!;

    this.form = this.fb.group({
      medicineId:    [0],
      batchNumber:   [''],
      quantity:      [null, [Validators.required, Validators.min(1), Validators.max(100000)]],
      purchasePrice: [null, [Validators.required, Validators.min(0.01), Validators.max(999999.99)]],
      expiryDate:    ['', [Validators.required]]   // real validator applied after load
      // purchaseDate intentionally omitted: sp_UpdateMedicineStock does not persist it
    });

    this.pharmacyService.getStockById(this.stockId).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (s) => {
        this.medicineName        = s.medicineName ?? '';
        this.batchNumber         = s.batchNumber;
        this.purchaseDateDisplay = s.purchaseDate ? s.purchaseDate.split('T')[0] : '';

        const expiryStr = s.expiryDate ? s.expiryDate.split('T')[0] : '';
        this.originalExpiryDate = expiryStr;

        this.form.patchValue({
          medicineId:    s.medicineId,
          batchNumber:   s.batchNumber,
          quantity:      s.quantity,
          purchasePrice: s.purchasePrice,
          expiryDate:    expiryStr
        });

        // Apply the edit-aware expiry validator now that we know the original date.
        // Allows keeping the existing date unchanged even if it is in the past.
        this.form.get('expiryDate')!.setValidators([
          Validators.required,
          this.editExpiryValidator()
        ]);
        this.form.get('expiryDate')!.updateValueAndValidity();
      },
      error: () => { this.errorMsg = 'Stock record not found or failed to load. Please go back and try again.'; }
    });
  }

  /** Returns a validator that only applies the future-date rule when the
   *  pharmacist has actually changed the expiry date to a new value. */
  private editExpiryValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      // Unchanged from what was loaded → always valid (MVC behaviour)
      if (control.value === this.originalExpiryDate) return null;
      // Changed → must be a future date
      const chosen = new Date(control.value);
      const today  = new Date();
      today.setHours(0, 0, 0, 0);
      return chosen > today ? null : { futureDate: true };
    };
  }

  f(n: string) { return this.form.get(n); }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    this.errorMsg   = '';

    this.pharmacyService.updateStock(this.stockId, this.form.value).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.submitting = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => {
        this.successMsg = res.message || 'Stock updated successfully.';
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate(['/pharmacy/stock']), 800);
      },
      error: (err) => {
        if (err?.error) {
          const errors = err.error.errors || err.error;
          const msgs: string[] = [];
          if (typeof errors === 'object') {
            Object.values(errors).forEach((v: any) => {
              if (Array.isArray(v)) msgs.push(...v); else msgs.push(String(v));
            });
          }
          this.errorMsg = msgs.length ? msgs.join(' | ') : (err.error?.message || 'Failed to update stock.');
        } else {
          this.errorMsg = 'Failed to update stock. Please try again.';
        }
      }
    });
  }
}
