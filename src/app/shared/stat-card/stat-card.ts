import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, transition, animate, state } from '@angular/animations';
import { CountUp } from '../count-up/count-up';

/**
 * A single animated dashboard stat card: fades/rises in on load (staggered
 * via [index]) and its number counts up from 0 to the target value.
 *
 *   <div class="row mt-3">
 *     <div class="col-md-3 mb-3" *ngFor="let c of cards; let i = index">
 *       <app-stat-card [label]="c.label" [value]="c.value" [colorClass]="c.color" [index]="i"></app-stat-card>
 *     </div>
 *   </div>
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, CountUp],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
  animations: [
    trigger('cardEnter', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => in', [
        style({ opacity: 0, transform: 'translateY(14px)' }),
        animate('300ms {{ delay }}ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class StatCard {
  @Input() label = '';
  @Input() value = 0;
  @Input() colorClass = 'bg-primary';
  @Input() prefix = '';
  @Input() decimals = 0;
  /** Position in a card row/grid; used to stagger the entrance animation. */
  @Input() index = 0;

  get animationParams() {
    return { value: 'in', params: { delay: Math.min(this.index, 8) * 70 } };
  }
}
