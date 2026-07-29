import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../services/pharmacy.service';
import { MedicineCategory, Manufacturer } from '../models/medicine.model';

@Component({
  selector: 'app-medicine-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './medicine-edit.html',
  styleUrl: './medicine-edit.css'
})
export class MedicineEdit implements OnInit {
  form!: FormGroup;
  categories:    MedicineCategory[] = [];
  manufacturers: Manufacturer[]     = [];
  submitting  = false;
  loading     = true;
  errorMsg    = '';
  successMsg  = '';
  medicineId  = 0;

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(
    private fb: FormBuilder,
    private pharmacyService: PharmacyService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.medicineId = +this.route.snapshot.paramMap.get('id')!;

    this.form = this.fb.group({
      medicineId:     [0],
      medicineCode:   [{ value: '', disabled: true }],   // readonly, shown for reference only
      medicineName:   ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z0-9\s\-\.\(\)\/&']+$/)
      ]],
      genericName:    ['', [
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z0-9\s\-\.]*$/)
      ]],
      categoryId:     [0, [Validators.required, Validators.min(1)]],
      manufacturerId: [0, [Validators.required, Validators.min(1)]],
      unit:           ['', [
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9\s\.\/]*$/)
      ]],
      unitPrice:      [null, [
        Validators.required,
        Validators.min(0.01),
        Validators.max(99999.99)
      ]],
      reorderLevel:   [0, [
        Validators.min(0),
        Validators.max(9999)
      ]],
      isActive:       [true]
    });

    this.pharmacyService.getMedicineById(this.medicineId).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => {
        this.categories    = res.categories;
        this.manufacturers = res.manufacturers;
        this.form.patchValue(res.medicine);
      },
      error: () => { this.errorMsg = 'Medicine not found or failed to load. Please go back and try again.'; }
    });
  }

  f(name: string) { return this.form.get(name); }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    this.errorMsg   = '';

    // Trim string fields before submitting
    const raw = this.form.getRawValue();
    raw.medicineName = raw.medicineName?.trim();
    raw.genericName  = raw.genericName?.trim() || null;
    raw.unit         = raw.unit?.trim() || null;

    this.pharmacyService.updateMedicine(this.medicineId, raw).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.submitting = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => {
        this.successMsg = res.message || 'Medicine updated successfully.';
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate(['/pharmacy/medicine']), 800);
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
          this.errorMsg = msgs.length ? msgs.join(' | ') : (err.error?.message || 'Failed to update medicine.');
        } else {
          this.errorMsg = 'Failed to update medicine. Please try again.';
        }
      }
    });
  }
}
