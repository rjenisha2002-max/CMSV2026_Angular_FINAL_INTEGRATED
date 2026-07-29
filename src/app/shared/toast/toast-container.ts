import { Component } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { trigger, style, transition, animate } from '@angular/animations';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
  animations: [
    trigger('toastAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(24px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [animate('180ms ease-in', style({ opacity: 0, transform: 'translateX(24px)' }))])
    ])
  ]
})
export class ToastContainer {
  constructor(public toastService: ToastService) {}

  iconFor(type: string): string {
    switch (type) {
      case 'success':
        return '✔';
      case 'error':
        return '✖';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  }
}
