import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReceptionService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboard() {
    return this.http.get<any>(`${this.base}/receptionists/dashboard`);
  }

  // ---- Patients ----
  getNextPatientCode() {
    return this.http.get<any>(`${this.base}/patients/next-code`);
  }

  createPatient(patient: any) {
    return this.http.post<any>(`${this.base}/patients`, patient);
  }

  searchPatients(searchText: string) {
  return this.http.get<any>(
    `${this.base}/receptionists/search-patient?keyword=${encodeURIComponent(searchText)}`
  );
}

  getAllPatients() {
    return this.http.get<any[]>(`${this.base}/patients`);
  }

  getPatientById(id: number) {
    return this.http.get<any>(`${this.base}/patients/${id}`);
  }

  updatePatient(id: number, patient: any) {
    return this.http.put<any>(`${this.base}/patients/${id}`, patient);
  }

  // ---- Appointments ----
  getAppointments(filter?: { departmentId?: number; doctorId?: number; patientCode?: string; fromDate?: string; toDate?: string }) {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
      });
    }
    const qs = params.toString();
    return this.http.get<any[]>(`${this.base}/appointments${qs ? '?' + qs : ''}`);
  }

  getDoctorsAndDepartments() {
    return this.http.get<any>(`${this.base}/appointments/doctors`);
  }

  getAppointmentCreateData(patientId?: number) {
    const qs = patientId ? `?patientId=${patientId}` : '';
    return this.http.get<any>(`${this.base}/appointments/create-data${qs}`);
  }

  createAppointment(appointment: any) {
    return this.http.post<any>(`${this.base}/appointments`, appointment);
  }

  getBookedSlots(doctorId: number, appointmentDate: string) {
    return this.http.get<string[]>(`${this.base}/appointments/booked-slots?doctorId=${doctorId}&appointmentDate=${appointmentDate}`);
  }

  getAppointmentById(id: number) {
    return this.http.get<any>(`${this.base}/appointments/${id}`);
  }

  cancelAppointment(id: number) {
    return this.http.post<any>(`${this.base}/appointments/${id}/cancel`, {});
  }

  // ---- Bills ----
  getAllBills() {
    return this.http.get<any[]>(`${this.base}/bills`);
  }

  getBillCreateData(appointmentId: number) {
    return this.http.get<any>(`${this.base}/bills/create-data?appointmentId=${appointmentId}`);
  }

  createBill(request: { patientId: number; appointmentId: number; paymentMethod?: string; amountReceived: number }) {
    return this.http.post<any>(`${this.base}/bills`, request);
  }

  getBillById(id: number) {
    return this.http.get<any>(`${this.base}/bills/${id}`);
  }

  getBillPdfUrl(id: number): string {
    return `${this.base}/bills/${id}/pdf`;
  }

  receivePayment(id: number, paymentMethod: string) {
    return this.http.post<any>(`${this.base}/bills/${id}/payments`, { paymentMethod });
  }

  // ---- Patient Visits ----
  getAllVisits() {
    return this.http.get<any[]>(`${this.base}/patientvisits`);
  }

  getVisitById(id: number) {
    return this.http.get<any>(`${this.base}/patientvisits/${id}`);
  }

  // ---- Reports ----
  getReceptionistReport(params: { reportType?: string; fromDate?: string; toDate?: string; doctorId?: number; departmentId?: number }) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    return this.http.get<any>(`${this.base}/receptionistreports?${qs.toString()}`);
  }
}