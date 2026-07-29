import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../services/pharmacy.service';
import { Prescription, PrescriptionItem } from '../models/prescription.model';

@Component({
  selector: 'app-prescription-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './prescription-details.html',
  styleUrl: './prescription-list.css'
})
export class PrescriptionDetails implements OnInit {
  prescription: Prescription | null = null;
  items:        PrescriptionItem[]  = [];
  loading        = true;
  error          = '';
  dispensing     = false;

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(
    private pharmacyService: PharmacyService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;

    this.pharmacyService.getPrescriptionDetails(id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => { this.prescription = res.prescription; this.items = res.items; },
      error: () => { this.error = 'Prescription not found or failed to load. Please go back and try again.'; }
    });
  }

  refNo(id: number): string { return `RX-${String(id).padStart(5, '0')}`; }

  statusClass(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'dispensed': return 'badge-success';
      case 'pending':   return 'badge-warn';
      case 'cancelled': return 'badge-danger';
      default:          return 'badge-gray';
    }
  }

  dispenseThisPrescription(): void {
    if (!this.prescription) return;
    const ok = confirm(
      'Dispense all medicines for this prescription?\n\nStock will be deducted (FEFO) and a paid bill will be generated automatically.'
    );
    if (!ok) return;

    this.dispensing = true;
    this.error      = '';

    this.pharmacyService.dispenseAndBill(
      this.prescription.prescriptionId,
      undefined
    ).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.dispensing = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => { this.router.navigate(['/pharmacy/bills', res.result.billId]); },
      error: (err) => { this.error = err?.error?.message || 'Failed to dispense prescription. Please try again.'; }
    });
  }
}
