import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ReceptionService } from '../../services/reception-service';

@Component({
  selector: 'app-register-patient',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-patient.html',
  styleUrl: './register-patient.scss'
})

export class ReceptionRegisterPatient implements OnInit {

  patientForm!: FormGroup;

  submitting = false;
  errorMessage = '';

  registeredPatient: any = null;

  // Used to bound the DOB date picker so a future date can't even be picked.
  today = this.toDateInput(new Date());

  constructor(
    private fb: FormBuilder,
    private receptionService: ReceptionService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  private toDateInput(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private notFutureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const entered = new Date(control.value);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // allow anything up to end of today
    return entered.getTime() > today.getTime() ? { futureDate: true } : null;
  }

  ngOnInit(): void {

    this.patientForm = this.fb.group({

      // Patient Information
      patientCode: [{ value: 'MMR000001', disabled: true }],

      firstName: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[A-Za-z ]+$')]],

      lastName: ['', Validators.pattern('^[A-Za-z ]+$')],

      dob: ['', [Validators.required, this.notFutureDateValidator]],

      age: [{ value: '', disabled: true }],

      gender: ['', Validators.required],

      bloodGroup: [''],

      aadhaarNo: ['', [Validators.pattern('^[0-9]{12}$')]],


      // Contact Information
      mobileNumber: [
        '',
        [
          Validators.required,
          Validators.pattern('^[6-9][0-9]{9}$')
        ]
      ],

      alternateMobile: ['', Validators.pattern('^[6-9][0-9]{9}$')],

      email: ['', Validators.email],

      address: [''],

      city: [''],

      state: [''],

      pincode: [
        '',
        Validators.pattern('^[0-9]{6}$')
      ],


      // Emergency Contact
      emergencyName: [''],

      relationship: [''],

      emergencyMobile: [
        '',
        Validators.pattern('^[6-9][0-9]{9}$')
      ]

    });


    // ADD THIS HERE
    this.patientForm.get('dob')?.valueChanges.subscribe(() => {
      this.calculateAge();
    });

    this.receptionService.getNextPatientCode().subscribe({
      next: (res) => {
        const code = res?.patientCode ?? res;
        if (code) {
          this.patientForm.get('patientCode')?.setValue(code);
        }
      },
      error: () => {
        // Keep the placeholder code if this call fails; the server
        // will assign the real code on save regardless.
      }
    });

    // Arrived here from dashboard "No patient found -> Register Patient"
    this.route.queryParams.subscribe((params) => {
      if (params['prefillMobile']) {
        this.patientForm.get('mobileNumber')?.setValue(params['prefillMobile']);
      }
      if (params['prefillName']) {
        this.patientForm.get('firstName')?.setValue(params['prefillName']);
      }
    });

  }


  // ADD THE METHOD HERE (inside class, below ngOnInit)

  calculateAge(): void {

    const dob = this.patientForm.get('dob')?.value;

    if (!dob) {
      this.patientForm.get('age')?.setValue('');
      return;
    }

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
       today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    this.patientForm.get('age')?.setValue(age);
  }

  onSubmit(): void {

    this.errorMessage = '';

    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    const form = this.patientForm.getRawValue();

    const fullName = [form.firstName, form.lastName]
      .filter((part: string) => !!part && part.trim().length > 0)
      .join(' ')
      .trim();

    const payload = {
      fullName,
      gender: form.gender,
      dob: form.dob || null,
      bloodGroup: form.bloodGroup || null,
      mobileNumber: form.mobileNumber,
      aadhaarNumber: form.aadhaarNo || null,
      alternateMobile: form.alternateMobile || null,
      email: form.email || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      pincode: form.pincode || null,
      emergencyContactName: form.emergencyName || null,
      emergencyContactRelationship: form.relationship || null,
      emergencyContactNumber: form.emergencyMobile || null
    };

    this.submitting = true;

    this.receptionService.createPatient(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        this.registeredPatient = {
          patientId: res?.patientId,
          patientCode: res?.patientCode,
          fullName: res?.fullName || fullName
        };
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  bookAppointment(): void {
    this.router.navigate(['/reception/appointments'], {
      queryParams: { patientId: this.registeredPatient?.patientId }
    });
  }

  registerAnother(): void {
    this.registeredPatient = null;
    this.resetForm();
  }

  resetForm(): void {
    this.patientForm.reset();
    this.patientForm.get('age')?.setValue('');

    this.receptionService.getNextPatientCode().subscribe({
      next: (res) => {
        const code = res?.patientCode ?? res;
        if (code) {
          this.patientForm.get('patientCode')?.setValue(code);
        }
      }
    });
  }

}