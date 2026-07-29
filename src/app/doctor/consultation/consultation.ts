import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from '../../services/doctor-service';
import { DoctorSidebar } from '../doctor-sidebar/doctor-sidebar';
import { PdfExportService } from '../../services/pdf-export-service';

@Component({
  selector: 'app-doctor-consultation',
  standalone: true,
  imports: [CommonModule, FormsModule, DoctorSidebar],
  templateUrl: './consultation.html',
  styleUrl: './consultation.scss'
})
export class DoctorConsultation implements OnInit {
  appointmentId = 0;
  model: any = null;
  selectedLabTests: number[] = [];
  prescriptionItems: any[] = [];
  loading = true;
  saving = false;
  error = '';
  summary: any = null;

  constructor(private route: ActivatedRoute, private router: Router, private doctorService: DoctorService, private pdfExportService: PdfExportService) {}

  ngOnInit(): void {
    this.appointmentId = Number(this.route.snapshot.paramMap.get('appointmentId'));
    this.doctorService.getConsultationSetup(this.appointmentId).subscribe({
      next: (res) => {
        this.model = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load consultation.';
        this.loading = false;
      }
    });
  }

  toggleLabTest(testId: number, checked: boolean): void {
    if (checked) {
      this.selectedLabTests.push(testId);
    } else {
      this.selectedLabTests = this.selectedLabTests.filter((id) => id !== testId);
    }
  }

  addPrescriptionItem(): void {
    this.prescriptionItems.push({ medicineId: null, dosage: '', frequency: '', duration: '', quantity: 1, instructions: '' });
  }

  removePrescriptionItem(index: number): void {
    this.prescriptionItems.splice(index, 1);
  }

  submit(): void {
    this.error = '';
    this.saving = true;

    const payload = {
      appointmentId: this.appointmentId,
      mmrCode: this.model.mmrCode,
      fullName: this.model.fullName,
      gender: this.model.gender,
      age: this.model.age,
      mobileNumber: this.model.mobileNumber,
      symptoms: this.model.symptoms,
      diagnosis: this.model.diagnosis,
      notes: this.model.notes,
      followUpDate: this.model.followUpDate || null,
      selectedLabTests: this.selectedLabTests,
      prescriptionItems: this.prescriptionItems
    };

    this.doctorService.submitConsultation(payload).subscribe({
      next: (res) => {
        this.saving = false;
        this.summary = res;
      },
      error: (err) => {
        this.saving = false;
        const errs = err?.error?.errors;
        this.error = errs ? Object.values(errs).flat().join(' | ') : err?.error?.message ?? 'Failed to save consultation.';
      }
    });
  }

  backToAppointments(): void {
    this.router.navigate(['/doctor/appointments']);
  }

  /** New feature: download the consultation summary as a PDF. */
  downloadPdf(): void {
    if (!this.summary) return;

    const medicineRows = (this.summary.prescribedMedicines ?? []).map((m: any) => [
      m.medicineName, m.dosage, m.frequency, String(m.quantity)
    ]);

    this.pdfExportService.export({
      title: 'Consultation Summary',
      subtitle: `${this.summary.patientName} (${this.summary.mmrCode})`,
      summary: [
        { label: 'Diagnosis', value: this.summary.diagnosis },
        { label: 'Follow-up', value: this.summary.followUpDate ? new Date(this.summary.followUpDate).toLocaleDateString() : '-' },
        { label: 'Lab Tests Ordered', value: this.summary.orderedLabTests?.length ?? 0 }
      ],
      headers: ['Medicine', 'Dosage', 'Frequency', 'Qty'],
      rows: medicineRows.length ? medicineRows : [['No medicines prescribed', '-', '-', '-']],
      fileName: `Consultation-${this.summary.mmrCode ?? 'summary'}.pdf`
    });
  }
}