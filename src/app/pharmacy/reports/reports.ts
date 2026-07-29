import { Component, OnInit, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PharmacyService } from '../services/pharmacy.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {
  reportType = 'sales';
  fromDate   = '';
  toDate     = '';
  days       = 30;
  data: any[] = [];
  loading    = false;
  exporting  = false;
  error      = '';

  private destroyRef = inject(DestroyRef);
  private cdr        = inject(ChangeDetectorRef);

  constructor(private pharmacyService: PharmacyService) {}

  ngOnInit(): void { this.loadReport(); }

  loadReport(): void {
    this.loading = true;
    this.error   = '';

    this.pharmacyService.getReport(
      this.reportType,
      this.fromDate || undefined,
      this.toDate   || undefined,
      this.days
    ).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => { this.data = res.data ?? []; },
      error: () => { this.error = 'Failed to load report. Please check the API connection and try again.'; }
    });
  }

  exportCsv(): void {
    if (this.exporting) return;
    this.exporting = true;
    this.error     = '';

    this.pharmacyService.exportCsv(
      this.reportType,
      this.fromDate || undefined,
      this.toDate   || undefined,
      this.days
    ).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.exporting = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = `${this.reportType}-report.csv`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => { this.error = 'Failed to export CSV. Please try again.'; }
    });
  }

  reportHeaders(): string[] {
    switch (this.reportType) {
      case 'sales':        return ['Sale Date', 'Bill Count', 'Items Sold', 'Total Amount'];
      case 'medicinewise': return ['Medicine', 'Qty Sold', 'Total Amount'];
      case 'stock':        return ['Code', 'Medicine', 'Reorder Level', 'Total Qty', 'Status'];
      case 'expiry':       return ['Code', 'Medicine', 'Batch', 'Qty', 'Expiry Date', 'Days Remaining', 'Status'];
      case 'lowstock':     return ['Code', 'Medicine', 'Reorder Level', 'Current Qty'];
      case 'dispensing':   return ['Dispense No', 'Prescription', 'Patient', 'Pharmacist', 'Date', 'Items', 'Amount'];
      default:             return [];
    }
  }

  reportRow(row: any): string[] {
    switch (this.reportType) {
      case 'sales':
        return [row.saleDate?.split('T')[0] ?? '', row.billCount, row.itemsSold, '₹' + Number(row.totalAmount || 0).toFixed(2)];
      case 'medicinewise':
        return [row.medicineName ?? '', row.quantitySold, '₹' + Number(row.totalAmount || 0).toFixed(2)];
      case 'stock':
        return [row.medicineCode ?? '', row.medicineName ?? '', row.reorderLevel, row.totalQuantity, row.stockStatus ?? ''];
      case 'expiry':
        return [row.medicineCode ?? '', row.medicineName ?? '', row.batchNumber ?? '', row.quantity,
                row.expiryDate?.split('T')[0] ?? '', row.daysRemaining, row.expiryStatus ?? ''];
      case 'lowstock':
        return [row.medicineCode ?? '', row.medicineName ?? '', row.reorderLevel, row.totalQuantity];
      case 'dispensing':
        return [
          `DISP-${String(row.dispenseId).padStart(5, '0')}`,
          `RX-${String(row.prescriptionId).padStart(5, '0')}`,
          row.patientName ?? '', row.pharmacistName ?? '',
          row.dispenseDate?.split('T')[0] ?? '', row.totalItems,
          '₹' + Number(row.totalAmount || 0).toFixed(2)
        ];
      default: return [];
    }
  }

  statusBadge(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'ok':       return 'badge-success';
      case 'low':      return 'badge-warn';
      case 'critical': return 'badge-danger';
      default:         return 'badge-gray';
    }
  }

  expiryBadge(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'expired':  return 'badge-danger';
      case 'expiring': return 'badge-warn';
      default:         return 'badge-success';
    }
  }

  /**
   * Dispatches to the correct badge method depending on the active report type.
   * The stock report status column uses statusBadge (ok/low/critical).
   * The expiry report status column uses expiryBadge (expired/expiring/ok).
   */
  cellBadge(cell: string): string {
    return this.reportType === 'expiry' ? this.expiryBadge(cell) : this.statusBadge(cell);
  }

  /** Grand Total row — only used for Sales Summary */
  grandTotalRow(): string[] {
    const totalBills  = this.data.reduce((s, r) => s + (Number(r.billCount) || 0), 0);
    const totalItems  = this.data.reduce((s, r) => s + (Number(r.itemsSold) || 0), 0);
    const totalAmount = this.data.reduce((s, r) => s + (Number(r.totalAmount) || 0), 0);
    return ['Grand Total', String(totalBills), String(totalItems), '₹' + totalAmount.toFixed(2)];
  }
}
