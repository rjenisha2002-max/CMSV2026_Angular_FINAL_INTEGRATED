import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReceptionService } from '../../services/reception-service';

@Component({
  selector: 'app-reception-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html'
})
export class ReceptionReports implements OnInit {
  filter = { reportType: 'Appointment', fromDate: '', toDate: '', doctorId: '', departmentId: '' };
  data: any = null;
  loading = true;
  error = '';

  constructor(private receptionService: ReceptionService) {}

  ngOnInit(): void {
    // Default to "this month so far" instead of leaving blank, which the
    // backend would otherwise interpret as "today only" — easy to mistake
    // for "no data" on a quiet day.
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    this.filter.fromDate = this.toDateInput(firstOfMonth);
    this.filter.toDate = this.toDateInput(today);

    this.load();
  }

  private toDateInput(d: Date): string {
    // Use local date parts, not toISOString() (which converts to UTC and
    // would roll back to the previous day for IST and other UTC+ zones).
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get filteredDoctors(): any[] {
    const doctors = this.data?.doctors ?? [];
    if (!this.filter.departmentId) return doctors;
    return doctors.filter((d: any) => String(d.departmentId) === String(this.filter.departmentId));
  }

  onDepartmentChange(): void {
    // Selected doctor may no longer belong to the chosen department
    this.filter.doctorId = '';
  }

  clearFilters(): void {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    this.filter = {
      reportType: 'Appointment',
      fromDate: this.toDateInput(firstOfMonth),
      toDate: this.toDateInput(today),
      doctorId: '',
      departmentId: ''
    };
    this.load();
  }

  load(): void {
    this.error = '';

    if (this.filter.fromDate && this.filter.toDate && this.filter.fromDate > this.filter.toDate) {
      this.error = '"From" date cannot be after "To" date.';
      return;
    }

    this.loading = true;
    const params: any = {};
    Object.entries(this.filter).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    this.receptionService.getReceptionistReport(params).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load report.';
        this.loading = false;
      }
    });
  }
}