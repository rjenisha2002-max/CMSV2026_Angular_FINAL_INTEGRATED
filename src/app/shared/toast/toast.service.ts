import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

/**
 * App-wide toast notifications. Call from any component/service:
 *
 *   constructor(private toast: ToastService) {}
 *   this.toast.success('Medicine saved successfully.');
 *   this.toast.error('Failed to save medicine.');
 *
 * <app-toast-container> (mounted once in app.html) renders and animates
 * whatever is in the list; nothing else needs to change per-page.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();

  private nextId = 1;

  show(message: string, type: ToastType = 'info', duration = 4000): void {
    const toast: Toast = { id: this.nextId++, message, type, duration };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(toast.id), duration);
    }
  }

  success(message: string, duration = 4000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 5000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 4000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration = 4500): void {
    this.show(message, 'warning', duration);
  }

  dismiss(id: number): void {
    this.toastsSubject.next(this.toastsSubject.value.filter((t) => t.id !== id));
  }
}
