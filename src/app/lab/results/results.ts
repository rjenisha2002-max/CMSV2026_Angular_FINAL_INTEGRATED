import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LabService } from '../../services/lab-service';

/**
 * A numeric result must start with a number, optionally followed by a unit
 * (e.g. "135", "98.6", "5.7%", "135 mg/dL"). This intentionally allows a
 * trailing unit since the doctor/technician often re-types the unit shown
 * in the normal range alongside the value.
 */
const NUMERIC_RESULT_PATTERN = /^-?\d+(\.\d+)?\s*[a-zA-Z%/µ]*$/;

/** Any digit at all means the range is numeric, even inside worded text
 * like "Less than 140 mg/dL" or "Up to 5.7%". Purely descriptive ranges
 * such as "Negative" or "Positive/Negative" have no digits and are left
 * as free text. */
const RANGE_HAS_DIGIT = /\d/;

@Component({
  selector: 'app-lab-results',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './results.html'
})
export class LabResults implements OnInit {
  requestItemId = 0;
  model: any = null;
  alreadyEntered = false;
  loading = true;
  saving = false;
  error = '';
  successMessage = '';

  resultForm!: FormGroup;
  isSubmitted = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private labService: LabService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.resultForm = this.formBuilder.group({
      resultValue: ['', [Validators.required, Validators.maxLength(100)]],
      observation: ['', [Validators.maxLength(1000)]],
      remarks: ['', [Validators.maxLength(1000)]],
      isAbnormal: [false]
    });

    this.requestItemId = Number(this.route.snapshot.paramMap.get('requestItemId'));

    if (!this.requestItemId || this.requestItemId <= 0) {
      this.error = 'Invalid or missing test request. Please open this page from the pending tests list.';
      this.loading = false;
      return;
    }

    this.labService.getResultEntryForm(this.requestItemId).subscribe({
      next: (res) => {
        if (res.message && res.data) {
          this.alreadyEntered = true;
          this.model = res.data;
        } else {
          this.model = res;
          this.resultForm.patchValue({
            resultValue: this.model?.resultValue ?? '',
            observation: this.model?.observation ?? '',
            remarks: this.model?.remarks ?? '',
            isAbnormal: this.model?.isAbnormal ?? false
          });

          // When the test's normal range contains a number at all — plain
          // ("70-110") or worded ("Less than 140 mg/dL") — require the
          // entered result to start with a number too.
          if (this.isNumericRange(this.model?.normalRange)) {
            this.resultForm.get('resultValue')?.addValidators(Validators.pattern(NUMERIC_RESULT_PATTERN));
            this.resultForm.get('resultValue')?.updateValueAndValidity();
          }
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load result form.';
        this.loading = false;
      }
    });
  }

  get f() {
    return this.resultForm.controls;
  }

  private isNumericRange(normalRange: string | null | undefined): boolean {
    return !!normalRange && RANGE_HAS_DIGIT.test(normalRange);
  }

  submit(): void {
    this.isSubmitted = true;
    this.error = '';

    if (this.resultForm.invalid) {
      this.resultForm.markAllAsTouched();
      this.error = 'Please fix the highlighted fields before saving.';
      return;
    }

    const { resultValue, observation, remarks, isAbnormal } = this.resultForm.value;
    const payload = {
      ...this.model,
      resultValue: (resultValue ?? '').toString().trim(),
      observation: (observation ?? '').toString().trim(),
      remarks: (remarks ?? '').toString().trim(),
      isAbnormal
    };

    this.saving = true;
    this.labService.saveResult(payload).subscribe({
      next: (res) => {
        this.saving = false;
        this.successMessage = res.message;
      },
      error: (err) => {
        this.saving = false;
        const errs = err?.error?.errors;
        this.error = errs ? errs.join(' | ') : err?.error?.message ?? 'Failed to save result.';
      }
    });
  }

  backToPending(): void {
    this.router.navigate(['/lab/pending-tests']);
  }
}
