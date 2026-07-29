import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LabService } from '../../services/lab-service';

@Component({
  selector: 'app-lab-pending-tests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pending-tests.html'
})
export class LabPendingTests implements OnInit {
  searchMMR = '';
  results: any[] = [];
  loading = true;
  error = '';

  constructor(private labService: LabService) {}

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    this.loading = true;
    this.labService.getPendingTests(this.searchMMR).subscribe({
      next: (res) => {
        this.results = res.results ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load pending tests.';
        this.loading = false;
      }
    });
  }
}
