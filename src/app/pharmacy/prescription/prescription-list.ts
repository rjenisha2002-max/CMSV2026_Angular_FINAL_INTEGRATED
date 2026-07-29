import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../services/pharmacy.service';
import { Prescription } from '../models/prescription.model';

@Component({
  selector: 'app-prescription-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './prescription-list.html',
  styleUrl: './prescription-list.css'
})
export class PrescriptionList implements OnInit {
  prescriptions: Prescription[] = [];
  filtered:      Prescription[] = [];
  loading    = true;
  error      = '';
  searchTerm = '';

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit(): void {
    this.pharmacyService.getAllPrescriptions().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (data) => { this.prescriptions = data; this.filtered = data; },
      error: (err) => {
        this.error = err?.status === 401
          ? 'Session expired. Please log in again.'
          : 'Failed to load prescriptions. Please try again.';
      }
    });
  }

  filter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filtered = this.prescriptions.filter(p =>
      !term ||
      p.patientName?.toLowerCase().includes(term) ||
      p.doctorName?.toLowerCase().includes(term)  ||
      this.refNo(p.prescriptionId).toLowerCase().includes(term)
    );
  }

  clearSearch(): void { this.searchTerm = ''; this.filtered = this.prescriptions; }

  refNo(id: number): string { return `RX-${String(id).padStart(5, '0')}`; }

  statusClass(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'dispensed': return 'badge-success';
      case 'pending':   return 'badge-warn';
      case 'cancelled': return 'badge-danger';
      default:          return 'badge-gray';
    }
  }
}
