import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReceptionService } from '../../services/reception-service';

@Component({
  selector: 'app-reception-bills',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bills.html'
})
export class ReceptionBills implements OnInit {
  bills: any[] = [];
  loading = true;
  error = '';
  message = '';

  showForm = false;
  appointmentId: number | null = null;
  billPreview: any = null;
  amountReceived = 0;
  paymentMethod = 'Cash';
  submitting = false;

  selectedBill: any = null;
  createdBill: any = null;

  constructor(
    private receptionService: ReceptionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.load();

    // Arrived here from "Book Appointment -> Go to Billing"
    this.route.queryParams.subscribe((params) => {
      const appointmentId = params['appointmentId'] ? Number(params['appointmentId']) : null;
      if (appointmentId) {
        this.openCreateForm();
        this.appointmentId = appointmentId;
        this.loadPreview();
      }
    });
  }

  load(): void {
    this.loading = true;
    this.receptionService.getAllBills().subscribe({
      next: (res) => {
        this.bills = res ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load bills.';
        this.loading = false;
      }
    });
  }

  openCreateForm(): void {
    this.showForm = true;
    this.billPreview = null;
    this.appointmentId = null;
    this.amountReceived = 0;
    this.error = '';
    this.message = '';
  }

  loadPreview(): void {
    this.error = '';
    if (!this.appointmentId) {
      this.error = 'Please enter an appointment ID.';
      return;
    }
    this.receptionService.getBillCreateData(this.appointmentId).subscribe({
      next: (res) => {
        this.billPreview = res;
        // Default to full payment now; receptionist can still edit for partial payment
        this.amountReceived = res?.consultationFee ?? 0;
      },
      error: (err) => {
        this.billPreview = null;
        this.error = err?.error?.message ?? 'Could not load appointment.';
      }
    });
  }

  create(): void {
    if (!this.billPreview || this.submitting) return;

    this.error = '';

    if (this.amountReceived < 0) {
      this.error = 'Amount received cannot be negative.';
      return;
    }
    if (this.amountReceived > this.billPreview.consultationFee) {
      this.error = `Amount received cannot exceed the consultation fee (₹${this.billPreview.consultationFee}).`;
      return;
    }

    this.submitting = true;
    this.receptionService
      .createBill({
        patientId: this.billPreview.patientId,
        appointmentId: this.billPreview.appointmentId,
        paymentMethod: this.paymentMethod,
        amountReceived: this.amountReceived
      })
      .subscribe({
        next: (res) => {
          this.submitting = false;
          this.showForm = false;
          this.createdBill = res;
          this.load();
        },
        error: (err) => {
          this.submitting = false;
          this.error = err?.error?.message ?? 'Failed to create bill.';
        }
      });
  }

  dismissCreatedBill(): void {
    this.createdBill = null;
  }

  printBill(id: number): void {
    window.open(this.receptionService.getBillPdfUrl(id), '_blank');
  }

  view(id: number): void {
    this.receptionService.getBillById(id).subscribe({
      next: (res) => (this.selectedBill = res),
      error: (err) => (this.error = err?.error?.message ?? 'Failed to load bill.')
    });
  }

  receivePayment(id: number, method: string): void {
    if (!confirm(`Record a ${method} payment for the remaining balance on bill #${id}?`)) return;
    this.receptionService.receivePayment(id, method).subscribe({
      next: (res) => {
        this.message = res.message;
        this.load();
        if (this.selectedBill?.billId === id) this.view(id);
      },
      error: (err) => (this.error = err?.error?.message ?? 'Failed to receive payment.')
    });
  }
}