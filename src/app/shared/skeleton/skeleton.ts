import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, transition, animate } from '@angular/animations';

/**
 * Shimmering placeholder shown while dashboard data is loading, in place
 * of a plain "Loading..." alert. Fades out smoothly once real content is
 * ready (pair with *ngIf on the sibling content — the fade is on this
 * component's own leave transition).
 *
 *   <app-skeleton-cards *ngIf="loading" [count]="4"></app-skeleton-cards>
 *   <div *ngIf="!loading"> ...real cards... </div>
 */
@Component({
  selector: 'app-skeleton-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [style({ opacity: 0 }), animate('150ms ease-out', style({ opacity: 1 }))]),
      transition(':leave', [animate('150ms ease-in', style({ opacity: 0 }))])
    ])
  ]
})
export class SkeletonCards {
  /** Number of placeholder cards to render. */
  @Input() count = 4;
  /** Bootstrap column class for each placeholder, matching the real card grid. */
  @Input() colClass = 'col-md-3 mb-3';

  get items(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
