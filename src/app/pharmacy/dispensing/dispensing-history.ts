import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../services/pharmacy.service';
import { DispensingHistoryViewModel } from '../models/dispensing.model';

@Component({
  selector: 'app-dispensing-history',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dispensing-history.html',
  styleUrl: './dispensing-create.css'
})
export class DispensingHistory implements OnInit {
  history:    DispensingHistoryViewModel[] = [];
  filtered:   DispensingHistoryViewModel[] = [];
  loading     = true;
  error       = '';
  searchTerm  = '';
  dateFilter  = '';

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit(): void {
    this.pharmacyService.getDispensingHistory().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (d) => { this.history = d; this.filtered = d; },
      error: (err) => {
        this.error = err?.status === 401
          ? 'Session expired. Please log in again.'
          : 'Failed to load dispensing history. Please try again.';
      }
    });
  }

  filter(): void {
    this.filtered = this.history.filter(h => {
      const matchSearch = !this.searchTerm ||
        (h.patientName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ?? false);
      const matchDate = !this.dateFilter || h.dispenseDate?.startsWith(this.dateFilter);
      return matchSearch && matchDate;
    });
  }

  clearFilters(): void { this.searchTerm = ''; this.dateFilter = ''; this.filtered = this.history; }

  dispNo(id: number): string { return `DISP-${String(id).padStart(5, '0')}`; }
  rxNo(id: number): string   { return `RX-${String(id).padStart(5, '0')}`; }
}
