import { AbstractControl, ValidationErrors } from '@angular/forms';

/** Expiry/future date: value must be strictly after today (tomorrow or later). */
export function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const chosen = new Date(control.value);
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  return chosen > today ? null : { futureDate: true };
}

/** Purchase date: value must not be in the future. */
export function notFutureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const chosen   = new Date(control.value);
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return chosen < tomorrow ? null : { notFutureDate: true };
}

/** Medicine code format: uppercase alphanumeric + hyphens only. */
export function medicineCodeFormatValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value || control.value.trim() === '') return null; // optional field
  const ok = /^[A-Za-z0-9\-]+$/.test(control.value.trim());
  return ok ? null : { medicineCodeFormat: true };
}
