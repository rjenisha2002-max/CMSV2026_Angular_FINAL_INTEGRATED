import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../services/pharmacy.service';
import { MedicineLookup } from '../models/medicine-stock.model';
import { futureDateValidator, notFutureDateValidator } from '../validators/pharmacy-validators';

@Component({
  selector: 'app-medicine-stock-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './medicine-stock-add.html',
  styleUrl: './medicine-stock.css'
})
export class MedicineStockAdd implements OnInit {
  form!: FormGroup;
  medicines:  MedicineLookup[] = [];
  submitting  = false;
  loading     = true;
  errorMsg    = '';
  successMsg  = '';

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(
    private fb: FormBuilder,
    private pharmacyService: PharmacyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];

    this.form = this.fb.group({
      medicineId:    [0, [Validators.required, Validators.min(1)]],
      batchNumber:   ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z0-9\/\-]+$/)
      ]],
      quantity:      [null, [
        Validators.required,
        Validators.min(1),
        Validators.max(100000)
      ]],
      purchasePrice: [null, [
        Validators.required,
        Validators.min(0.01),
        Validators.max(999999.99)
      ]],
      expiryDate:    ['', [Validators.required, futureDateValidator]],
      purchaseDate:  [today, [notFutureDateValidator]]
    });

    this.pharmacyService.getNewStockMeta().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (meta) => { this.medicines = meta.medicines; },
      error: () => { this.errorMsg = 'Failed to load medicines list. Please refresh and try again.'; }
    });
  }

  f(n: string) { return this.form.get(n); }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.submitting = true;
    this.errorMsg   = '';

    const value = { ...this.form.value };
    value.batchNumber = value.batchNumber?.trim().toUpperCase();

    this.pharmacyService.createStock(value).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.submitting = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => {
        this.successMsg = res.message || 'Stock added successfully.';
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
          this.errorMsg = msgs.length ? msgs.join(' | ') : (err.error?.message || 'Failed to add stock.');
        } else {
          this.errorMsg = 'Failed to add stock. Please try again.';
        }
      }
    });
  }
}
