import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private base = `${environment.apiUrl}/doctor`;

  constructor(private http: HttpClient) {}

  getDashboard() {
    return this.http.get<any>(`${this.base}/dashboard`);
  }

  getAppointments(targetDay: 'today' | 'tomorrow' = 'today') {
    return this.http.get<any>(`${this.base}/appointments?targetDay=${targetDay}`);
  }

  getConsultationSetup(appointmentId: number) {
    return this.http.get<any>(`${this.base}/consultation/setup?appointmentId=${appointmentId}`);
  }

  submitConsultation(payload: any) {
    return this.http.post<any>(`${this.base}/consultation`, payload);
  }

  searchPatients(searchKeyword: string) {
    return this.http.get<any>(`${this.base}/patients/search?searchKeyword=${encodeURIComponent(searchKeyword)}`);
  }

  getPatientReport(mmrCode: string) {
    return this.http.get<any>(`${this.base}/patients/${encodeURIComponent(mmrCode)}/report`);
  }
}
