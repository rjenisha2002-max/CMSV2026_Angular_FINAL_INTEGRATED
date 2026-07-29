import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabService } from '../../services/lab-service';
import { VoiceSearch } from '../../shared/voice-search/voice-search';

@Component({
  selector: 'app-lab-patient-search',
  standalone: true,
  imports: [CommonModule, FormsModule, VoiceSearch],
  templateUrl: './patient-search.html'
})
export class LabPatientSearch {
  term = '';
  results: any[] = [];
  loading = false;
  error = '';

  constructor(private labService: LabService) {}

  onVoiceResult(text: string): void {
    this.term = text;
    this.search();
  }

  search(): void {
    if (!this.term.trim()) return;
    this.loading = true;
    this.labService.searchPatientByMmr(this.term).subscribe({
      next: (res) => {
        this.results = res ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Search failed.';
        this.loading = false;
      }
    });
  }
}
