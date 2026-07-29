import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../services/pharmacy.service';
import { Medicine as MedicineModel } from '../models/medicine.model';

@Component({
  selector: 'app-medicine',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './medicine.html',
  styleUrl: './medicine.css'
})
export class Medicine implements OnInit {
  medicines: MedicineModel[] = [];
  loading    = true;
  error      = '';
  searchTerm = '';
  successMsg = '';

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit(): void { this.loadMedicines(); }

  loadMedicines(): void {
    this.loading    = true;
    this.error      = '';
    this.successMsg = '';

    this.pharmacyService.getAllMedicines(this.searchTerm || undefined).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (data) => { this.medicines = data; },
      error: (err) => {
        this.error = err?.status === 401
          ? 'Session expired. Please log in again.'
          : 'Failed to load medicines. Please try again.';
      }
    });
  }

  onSearch(): void  { this.loadMedicines(); }
  clearSearch(): void { this.searchTerm = ''; this.loadMedicines(); }

  disable(id: number): void {
    if (!confirm('Are you sure you want to disable this medicine? It will no longer be available for dispensing.')) return;

    this.pharmacyService.disableMedicine(id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.cdr.markForCheck())
    ).subscribe({
      next: (res) => {
        this.successMsg = res.message || 'Medicine disabled successfully.';
        this.error      = '';
        this.loadMedicines();
      },
      error: (err) => {
        this.error      = err?.error?.message || 'Failed to disable medicine. Please try again.';
        this.successMsg = '';
      }
    });
  }
}
