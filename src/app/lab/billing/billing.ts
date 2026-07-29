import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabService } from '../../services/lab-service';

@Component({
  selector: 'app-lab-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.html'
})
export class LabBilling implements OnInit {
  searchMMR = '';
  unbilled: any[] = [];
  bills: any[] = [];
  loading = true;
  error = '';
  message = '';
  selectedBill: any = null;

  constructor(private labService: LabService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.labService.getBillingDashboard(this.searchMMR).subscribe({
      next: (res) => {
        this.unbilled = res.unbilled ?? [];
        this.bills = res.bills ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load billing data.';
        this.loading = false;
      }
    });
  }

  generateBill(requestId: number): void {
    this.message = '';
    this.labService.generateBill(requestId, this.searchMMR).subscribe({
      next: (res) => {
        this.message = res.message;
        this.load();
      },
      error: (err) => (this.error = err?.error?.message ?? 'Failed to generate bill.')
    });
  }

  updatePayment(billId: number, status: string): void {
    this.labService.updateBillPayment(billId, status).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = err?.error?.message ?? 'Failed to update payment.')
    });
  }

  viewBill(billId: number): void {
    this.labService.getBillDetails(billId).subscribe({
      next: (res) => (this.selectedBill = res),
      error: (err) => (this.error = err?.error?.message ?? 'Failed to load bill.')
    });
  }

  downloadPdfUrl(billId: number): string {
    return this.labService.downloadBillPdfUrl(billId);
  }
}
