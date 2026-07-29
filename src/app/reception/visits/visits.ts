import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceptionService } from '../../services/reception-service';

@Component({
  selector: 'app-reception-visits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visits.html'
})
export class ReceptionVisits implements OnInit {
  visits: any[] = [];
  loading = true;
  error = '';

  constructor(private receptionService: ReceptionService) {}

  ngOnInit(): void {
    this.receptionService.getAllVisits().subscribe({
      next: (res) => {
        this.visits = res ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load visits.';
        this.loading = false;
      }
    });
  }
}
