import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DoctorService } from '../../services/doctor-service';
import { DoctorSidebar } from '../doctor-sidebar/doctor-sidebar';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink, DoctorSidebar],
  templateUrl: './appointments.html',
  styleUrl: './appointments.scss'
})
export class DoctorAppointments implements OnInit {
  currentSelection: 'today' | 'tomorrow' = 'today';
  appointments: any[] = [];
  loading = true;
  error = '';

  constructor(private doctorService: DoctorService) {}

  ngOnInit(): void {
    this.load('today');
  }

  load(day: 'today' | 'tomorrow'): void {
    this.loading = true;
    this.currentSelection = day;
    this.doctorService.getAppointments(day).subscribe({
      next: (res) => {
        this.appointments = res.appointments ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load appointments.';
        this.loading = false;
      }
    });
  }
}