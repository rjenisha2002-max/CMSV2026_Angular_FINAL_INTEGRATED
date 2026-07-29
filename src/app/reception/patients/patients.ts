import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ReceptionService } from '../../services/reception-service';

const MOBILE_10_DIGIT = /^[6-9][0-9]{9}$/;
const MMR_CODE = /^MMR[0-9]+$/i;
const NAME_ONLY = /^[A-Za-z ]+$/;

@Component({
  selector: 'app-reception-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patients.html'
})
export class ReceptionPatients implements OnInit {
  patients: any[] = [];
  searchBy = 'MMR';
  searchText = '';
  loading = true;
  error = '';
  message = '';

  showForm = false;
  form: any = {};
  age: number | null = null;

  // Used to bound the DOB date picker so a future date can't be picked.
  today = this.toDateInput(new Date());

  // Optional columns are hidden from the table when every visible
  // patient has a blank value for them, so the table doesn't overflow
  // with columns nobody has filled in yet.
  columnVisibility = {
    email: true,
    alternateMobile: true,
    bloodGroup: true,
    aadhaarNumber: true,
    address: true,
    city: true,
    state: true,
    pincode: true,
    emergencyContact: true
  };

  constructor(
    private receptionService: ReceptionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  private toDateInput(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadAll(): void {
    this.loading = true;
    this.receptionService.getAllPatients().subscribe({
      next: (res) => {
        this.patients = res ?? [];
        this.updateColumnVisibility();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load patients.';
        this.loading = false;
      }
    });
  }

  search(): void {
    this.error = '';
    const text = this.searchText.trim();

    if (!text) {
      this.loadAll();
      return;
    }

    // Format-aware validation based on the selected search type, so an
    // obviously-wrong query doesn't silently return zero results.
    if (this.searchBy === 'Mobile' && !MOBILE_10_DIGIT.test(text)) {
      this.error = 'Enter a valid 10-digit mobile number starting with 6-9.';
      return;
    }
    if (this.searchBy === 'MMR' && !MMR_CODE.test(text)) {
      this.error = 'MMR code should look like MMR000123.';
      return;
    }
    if (this.searchBy === 'Name' && !NAME_ONLY.test(text)) {
      this.error = 'Name should contain only letters and spaces (no numbers or special characters).';
      return;
    }

    this.loading = true;
    this.receptionService.searchPatients(text).subscribe({
      next: (res) => {
        this.patients = res.patients ?? [];
        this.updateColumnVisibility();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Search failed.';
        this.loading = false;
      }
    });
  }

  private updateColumnVisibility(): void {
    const anyHasValue = (field: string) =>
      this.patients.some((p) => {
        const v = p?.[field];
        return v !== null && v !== undefined && String(v).trim().length > 0;
      });

    this.columnVisibility = {
      email: anyHasValue('email'),
      alternateMobile: anyHasValue('alternateMobile'),
      bloodGroup: anyHasValue('bloodGroup'),
      aadhaarNumber: anyHasValue('aadhaarNumber'),
      address: anyHasValue('address'),
      city: anyHasValue('city'),
      state: anyHasValue('state'),
      pincode: anyHasValue('pincode'),
      emergencyContact: this.patients.some(
        (p) => p?.emergencyContactNumber || p?.emergencyContactName
      )
    };
  }

  clearSearch(): void {
    this.searchText = '';
    this.error = '';
    this.loadAll();
  }

  goToRegister(): void {
    this.router.navigate(['/reception/register-patient']);
  }

  bookAppointment(patient: any): void {
    this.router.navigate(['/reception/appointments'], {
      queryParams: { patientId: patient.patientId }
    });
  }

  openEditForm(patient: any): void {
    this.form = {
      ...patient,
      dob: patient.dob ? patient.dob.substring(0, 10) : ''
    };
    this.age = patient.age ?? null;
    this.message = '';
    this.error = '';
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
  }

  // Real-time age calculation as DOB changes, readonly Age box
  onDobChange(): void {
    if (!this.form.dob) {
      this.age = null;
      return;
    }
    const dob = new Date(this.form.dob);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    this.age = age;
  }

  // DOB more than 120 years ago - almost certainly a typo, same floor as
  // Register Patient.
  get dobTooOld(): boolean {
    if (!this.form.dob) return false;
    const entered = new Date(this.form.dob);
    const today = new Date();
    const floor = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    return entered.getTime() < floor.getTime();
  }

  // Cross-field warnings (non-blocking) - same idea as Register Patient.
  get alternateMobileSameAsMobile(): boolean {
    return !!this.form.mobileNumber && !!this.form.alternateMobile &&
      this.form.mobileNumber === this.form.alternateMobile;
  }

  get emergencyMobileSameAsMobile(): boolean {
    return !!this.form.mobileNumber && !!this.form.emergencyContactNumber &&
      this.form.mobileNumber === this.form.emergencyContactNumber;
  }

  save(editForm: NgForm): void {
    this.error = '';
    this.message = '';

    if (editForm.invalid) {
      editForm.control.markAllAsTouched();
      this.error = 'Please fix the highlighted fields.';
      return;
    }

    if (this.form.dob && this.form.dob > this.today) {
      this.error = 'Date of birth cannot be in the future.';
      return;
    }

    if (this.dobTooOld) {
      this.error = "Please double-check the date of birth - it's over 120 years ago.";
      return;
    }

    const payload = { ...this.form };

    this.receptionService.updatePatient(payload.patientId, payload).subscribe({
      next: (res) => {
        this.message = res.message;
        this.showForm = false;
        this.loadAll();
      },
      error: (err) => (this.error = err?.error?.message ?? 'Failed to update patient.')
    });
  }
}