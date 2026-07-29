import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../services/doctor-service';
import { DoctorSidebar } from '../doctor-sidebar/doctor-sidebar';
import { PdfExportService } from '../../services/pdf-export-service';

@Component({
  selector: 'app-doctor-patient-search',
  standalone: true,
  imports: [CommonModule, FormsModule, DoctorSidebar],
  templateUrl: './patient-search.html',
  styleUrl: './patient-search.scss'
})
export class DoctorPatientSearch {
  searchKeyword = '';
  results: any[] = [];
  report: any = null;
  loading = false;
  error = '';

  constructor(private doctorService: DoctorService, private pdfExportService: PdfExportService) {}

  search(): void {
    this.loading = true;
    this.error = '';
    this.report = null;
    this.doctorService.searchPatients(this.searchKeyword).subscribe({
      next: (res) => {
        this.results = res.results ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Search failed.';
        this.loading = false;
      }
    });
  }

  viewReport(mmrCode: string): void {
    this.loading = true;
    this.doctorService.getPatientReport(mmrCode).subscribe({
      next: (res) => {
        this.report = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load report.';
        this.loading = false;
      }
    });
  }

  /** New feature: download the currently open patient report as a PDF. */
  downloadPdf(): void {
    if (!this.report) return;

    const labRows = (this.report.labResults ?? []).map((r: any) => [
      r.testName, r.resultValue, r.normalRange, r.status,
      r.resultDate ? new Date(r.resultDate).toLocaleDateString() : '-', r.doctorName
    ]);

    this.pdfExportService.export({
      title: 'Patient Report',
      subtitle: `${this.report.patientName} (${this.report.mmrCode}) - ${this.report.age} / ${this.report.gender}`,
      headers: ['Test', 'Result', 'Normal Range', 'Status', 'Date', 'Doctor'],
      rows: labRows.length ? labRows : [['No lab results on file', '-', '-', '-', '-', '-']],
      fileName: `Patient-Report-${this.report.mmrCode ?? 'report'}.pdf`
    });
  }
}