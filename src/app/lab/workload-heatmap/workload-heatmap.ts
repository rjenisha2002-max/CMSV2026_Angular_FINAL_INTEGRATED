import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { LabService } from '../../services/lab-service';

export interface HeatmapCell {
  day: number; // 0 = Monday ... 6 = Sunday
  hour: number; // 0-23
  count: number;
  intensity: number; // 0-1, relative to the busiest cell
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// Every 3rd hour is labelled to keep the header readable.
const HOURS = Array.from({ length: 24 }, (_, h) => h);

/**
 * Visualizes when the lab is busiest by plotting test volume across
 * day-of-week x hour-of-day. Combines pending-test request timestamps and
 * completed-result timestamps from the existing lab endpoints (no new
 * backend API required), so it reflects real request/turnaround load
 * rather than a single "tests completed" count.
 */
@Component({
  selector: 'app-lab-workload-heatmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workload-heatmap.html',
  styleUrl: './workload-heatmap.scss'
})
export class LabWorkloadHeatmap implements OnInit {
  readonly dayLabels = DAY_LABELS;
  readonly hours = HOURS;

  grid: HeatmapCell[][] = []; // grid[day][hour]
  maxCount = 0;
  totalEvents = 0;
  busiest: { day: string; hour: number; count: number } | null = null;
  loading = true;
  error = '';

  constructor(private labService: LabService) {}

  ngOnInit(): void {
    // Pull both pending (requested) and completed (resulted) tests, unfiltered,
    // and treat every timestamp as one unit of lab workload.
    forkJoin({
      pending: this.labService.getPendingTests(''),
      reports: this.labService.getReports('')
    }).subscribe({
      next: ({ pending, reports }) => {
        const requestDates: string[] = (pending.results ?? []).map((r: any) => r.requestDate).filter(Boolean);
        const resultDates: string[] = (reports.results ?? []).map((r: any) => r.resultDate).filter(Boolean);
        this.buildGrid([...requestDates, ...resultDates]);
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load workload data.';
        this.loading = false;
      }
    });
  }

  private buildGrid(timestamps: string[]): void {
    const counts: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

    for (const ts of timestamps) {
      const d = new Date(ts);
      if (isNaN(d.getTime())) continue;
      const jsDay = d.getDay(); // 0 = Sunday ... 6 = Saturday
      const day = (jsDay + 6) % 7; // convert to 0 = Monday ... 6 = Sunday
      const hour = d.getHours();
      counts[day][hour]++;
    }

    this.maxCount = Math.max(1, ...counts.flat());
    this.totalEvents = timestamps.length;

    this.grid = counts.map((hoursForDay, day) =>
      hoursForDay.map((count, hour) => ({
        day,
        hour,
        count,
        intensity: count / this.maxCount
      }))
    );

    let busiestCell: HeatmapCell | null = null;
    for (const row of this.grid) {
      for (const cell of row) {
        if (!busiestCell || cell.count > busiestCell.count) busiestCell = cell;
      }
    }
    this.busiest =
      busiestCell && busiestCell.count > 0
        ? { day: DAY_LABELS[busiestCell.day], hour: busiestCell.hour, count: busiestCell.count }
        : null;
  }

  formatHour(hour: number): string {
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    const suffix = hour < 12 ? 'AM' : 'PM';
    return `${h12}${suffix}`;
  }

  cellBackground(cell: HeatmapCell): string {
    if (cell.count === 0) return 'rgba(40, 167, 69, 0.06)';
    // Scale from light green (low) to deep red (high load).
    const alpha = 0.18 + cell.intensity * 0.72;
    return `rgba(220, 53, 69, ${alpha.toFixed(2)})`;
  }
}
