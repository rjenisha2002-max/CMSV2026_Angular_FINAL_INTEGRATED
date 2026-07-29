import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReceptionService } from '../../services/reception-service';

@Component({
  selector: 'app-reception-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.html'
})
export class ReceptionAppointments implements OnInit {
  appointments: any[] = [];
  doctors: any[] = [];
  departments: any[] = [];
  loading = true;
  error = '';
  message = '';

  filter = { departmentId: '', doctorId: '', patientCode: '', fromDate: '', toDate: '' };
  patientCodeError = '';

  showForm = false;
  createData: any = null;
  bookedSlots: string[] = [];
  availableSlots: string[] = [];
  filterDepartmentId: number | null = null;
  newAppointment: any = { patientId: null, doctorId: null, appointmentDate: '', appointmentTime: '' };

  // When arriving from Quick Search / Registration with a known patient
  lockedPatient: any = null;
  patientLockedFromNav = false;

  // Patient search, used only for direct "+ Book Appointment" (no nav patient)
  patientSearchBy = 'Name';
  patientSearchText = '';
  patientSearchResults: any[] = [];
  patientSearching = false;
  patientSearchError = '';

  // Date policy: today or tomorrow only
  // Use local date parts, not toISOString() (which converts to UTC and
  // would roll back to the previous day for IST and other UTC+ zones).
  today = this.toDateInput(new Date());
  maxDate = this.toDateInput(new Date(Date.now() + 86400000));

  // Booking success (with token)
  bookingResult: any = null;
  submitting = false;

  constructor(
    private receptionService: ReceptionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  private toDateInput(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  ngOnInit(): void {
    this.load();
    this.receptionService.getDoctorsAndDepartments().subscribe((res) => {
      this.doctors = res.doctors ?? [];
      this.departments = res.departments ?? [];
    });

    this.route.queryParams.subscribe((params) => {
      const patientId = params['patientId'] ? Number(params['patientId']) : null;
      if (patientId) {
        this.openBookingForm(patientId);
      }
    });
  }

  load(): void {
    this.error = '';
    this.patientCodeError = '';

    const patientCode = this.filter.patientCode.trim();
    if (patientCode && !/^MMR[0-9]+$/i.test(patientCode)) {
      this.patientCodeError = 'Invalid MMR code format.';
      return;
    }

    if (this.filter.fromDate && this.filter.toDate && this.filter.fromDate > this.filter.toDate) {
      this.error = '"From" date cannot be after "To" date.';
      return;
    }

    this.loading = true;
    const f: any = {};
    Object.entries(this.filter).forEach(([k, v]) => {
      if (v) f[k] = v;
    });
    this.receptionService.getAppointments(f).subscribe({
      next: (res) => {
        this.appointments = res ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load appointments.';
        this.loading = false;
      }
    });
  }

  openBookingForm(patientId?: number): void {
    this.message = '';
    this.error = '';
    this.bookingResult = null;
    this.lockedPatient = null;
    this.patientLockedFromNav = !!patientId;
    this.patientSearchText = '';
    this.patientSearchResults = [];
    this.patientSearchError = '';
    this.newAppointment = { patientId: patientId ?? null, doctorId: null, appointmentDate: '', appointmentTime: '' };
    this.bookedSlots = [];
    this.availableSlots = [];

    this.receptionService.getAppointmentCreateData(patientId ?? undefined).subscribe((res) => {
      this.createData = res;
      if (patientId && res.selectedPatient) {
        this.lockedPatient = res.selectedPatient;
        this.newAppointment.patientId = res.selectedPatient.patientId;
      }
    });

    this.showForm = true;
  }

  searchPatientForBooking(): void {
    const term = this.patientSearchText.trim();
    this.patientSearchError = '';
    this.patientSearchResults = [];
    if (!term) return;

    if (this.patientSearchBy === 'Mobile' && !/^[6-9][0-9]{9}$/.test(term)) {
      this.patientSearchError = 'Enter a valid 10-digit mobile number starting with 6-9.';
      return;
    }
    if (this.patientSearchBy === 'MMR' && !/^MMR[0-9]+$/i.test(term)) {
      this.patientSearchError = 'MMR code should look like MMR000123.';
      return;
    }
    if (this.patientSearchBy === 'Name' && !/^[A-Za-z ]+$/.test(term)) {
      this.patientSearchError = 'Name should contain only letters and spaces (no numbers or special characters).';
      return;
    }

    this.patientSearching = true;
    this.receptionService.searchPatients(term).subscribe({
      next: (res) => {
        this.patientSearching = false;
        this.patientSearchResults = res?.patients ?? [];
        if (this.patientSearchResults.length === 0) {
          this.patientSearchError = res?.message || 'No patient found matching that search.';
        }
      },
      error: (err) => {
        this.patientSearching = false;
        this.patientSearchError = err?.error?.message ?? 'Search failed.';
      }
    });
  }

  selectPatientForBooking(p: any): void {
    this.lockedPatient = p;
    this.newAppointment.patientId = p.patientId;
    this.patientSearchResults = [];
    this.patientSearchText = '';
    this.patientSearchError = '';
  }

  changePatient(): void {
    this.lockedPatient = null;
    this.newAppointment.patientId = null;
    this.patientSearchResults = [];
    this.patientSearchText = '';
    this.patientSearchError = '';
  }

  // Doctors available for the currently selected department
  get doctorsInDepartment(): any[] {
    if (!this.createData?.doctors) return [];
    if (!this.filterDepartmentId) return this.createData.doctors;
    return this.createData.doctors.filter((d: any) => d.departmentId === this.filterDepartmentId);
  }

  onDepartmentChange(): void {
    this.newAppointment.doctorId = null;
    this.bookedSlots = [];
    this.availableSlots = [];
  }

  // 15-minute slot grid, 09:00–17:00, with booked ones hidden and,
  // if the selected date is today, past times hidden too
  onDoctorOrDateChange(): void {
    this.availableSlots = [];
    this.newAppointment.appointmentTime = '';

    if (this.newAppointment.doctorId && this.newAppointment.appointmentDate) {
      this.receptionService.getBookedSlots(this.newAppointment.doctorId, this.newAppointment.appointmentDate).subscribe((slots) => {
        this.bookedSlots = (slots ?? []).map((s) => s.substring(0, 5));
        this.availableSlots = this.generateSlots()
          .filter((s) => !this.bookedSlots.includes(s))
          .filter((s) => !this.isPastSlot(s));
      });
    }
  }

  // True if appointmentDate is today AND the slot's time has already passed
  private isPastSlot(slot: string): boolean {
    if (this.newAppointment.appointmentDate !== this.today) {
      return false;
    }
    const now = new Date();
    const [h, m] = slot.split(':').map(Number);
    const slotDate = new Date();
    slotDate.setHours(h, m, 0, 0);
    return slotDate.getTime() <= now.getTime();
  }

  private generateSlots(): string[] {
    const slots: string[] = [];
    for (let h = 9; h < 17; h++) {
      for (let m = 0; m < 60; m += 15) {
        slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  }

  pickSlot(slot: string): void {
    this.newAppointment.appointmentTime = slot;
  }

  book(): void {
    this.error = '';
    this.submitting = true;

    const payload = {
      ...this.newAppointment,
      appointmentTime:
        this.newAppointment.appointmentTime && this.newAppointment.appointmentTime.length === 5
          ? `${this.newAppointment.appointmentTime}:00`
          : this.newAppointment.appointmentTime
    };
    this.receptionService.createAppointment(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        this.bookingResult = res;
        this.showForm = false;
        this.load();
      },
      error: (err) => {
        this.submitting = false;
        this.error = err?.error?.message ?? 'Failed to book appointment.';
        // The slot we tried may have just been taken by someone else —
        // refresh the list so it's no longer offered.
        this.onDoctorOrDateChange();
      }
    });
  }

  dismissBookingResult(): void {
    this.bookingResult = null;
  }

  goToBilling(): void {
    this.router.navigate(['/reception/bills'], {
      queryParams: { appointmentId: this.bookingResult?.appointmentId }
    });
  }

  cancel(id: number): void {
    if (!confirm('Cancel this appointment?')) return;
    this.receptionService.cancelAppointment(id).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = err?.error?.message ?? 'Failed to cancel appointment.')
    });
  }
}