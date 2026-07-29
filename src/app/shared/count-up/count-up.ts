import { Directive, ElementRef, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';

/**
 * Animates the host element's text content counting up from its previous
 * value to a new target whenever the input changes — e.g. dashboard stat
 * cards going from 0 -> 150 on first load, or updating smoothly on refresh.
 *
 *   <p class="display-4" [appCountUp]="stats.pendingTests"></p>
 *   <p [appCountUp]="data.todaysRevenue" countUpPrefix="₹" [countUpDecimals]="2"></p>
 */
@Directive({
  selector: '[appCountUp]',
  standalone: true
})
export class CountUp implements OnChanges, OnDestroy {
  @Input() appCountUp: number | null = 0;
  @Input() countUpDuration = 900; // ms
  @Input() countUpPrefix = '';
  @Input() countUpSuffix = '';
  @Input() countUpDecimals = 0;

  private currentValue = 0;
  private rafId: number | null = null;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['appCountUp']) return;
    const target = Number(this.appCountUp) || 0;
    const from = Number(changes['appCountUp'].previousValue) || 0;
    this.animate(from, target);
  }

  private animate(from: number, to: number): void {
    this.cancel();
    const start = performance.now();
    const duration = Math.max(0, this.countUpDuration);

    if (duration === 0 || from === to) {
      this.render(to);
      return;
    }

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = from + (to - from) * eased;
      this.render(value);

      if (progress < 1) {
        this.rafId = requestAnimationFrame(step);
      } else {
        this.render(to);
      }
    };

    this.rafId = requestAnimationFrame(step);
  }

  private render(value: number): void {
    this.currentValue = value;
    const formatted = this.countUpDecimals > 0 ? value.toFixed(this.countUpDecimals) : Math.round(value).toString();
    this.el.nativeElement.textContent = `${this.countUpPrefix}${this.formatThousands(formatted)}${this.countUpSuffix}`;
  }

  private formatThousands(value: string): string {
    const [intPart, decPart] = value.split('.');
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decPart ? `${withCommas}.${decPart}` : withCommas;
  }

  private cancel(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  ngOnDestroy(): void {
    this.cancel();
  }
}
