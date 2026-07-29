import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LabService {
  private base = `${environment.apiUrl}/labtechnician`;

  constructor(private http: HttpClient) {}

  getDashboard() {
    return this.http.get<any>(`${this.base}/dashboard`);
  }

  getPendingTests(searchMMR = '') {
    return this.http.get<any>(`${this.base}/pending-tests?searchMMR=${encodeURIComponent(searchMMR)}`);
  }

  getResultEntryForm(requestItemId: number) {
    return this.http.get<any>(`${this.base}/results/${requestItemId}`);
  }

  saveResult(payload: any) {
    return this.http.post<any>(`${this.base}/results`, payload);
  }

  getReports(searchMMR = '') {
    return this.http.get<any>(`${this.base}/reports?searchMMR=${encodeURIComponent(searchMMR)}`);
  }

  getResultDetail(resultId: number) {
    return this.http.get<any>(`${this.base}/results/${resultId}/detail`);
  }

  resendEmail(resultId: number, searchMMR = '') {
    return this.http.post<any>(`${this.base}/results/${resultId}/resend-email?searchMMR=${encodeURIComponent(searchMMR)}`, {});
  }

  getBillingDashboard(searchMMR = '') {
    return this.http.get<any>(`${this.base}/billing?searchMMR=${encodeURIComponent(searchMMR)}`);
  }

  generateBill(requestId: number, searchMMR = '') {
    return this.http.post<any>(`${this.base}/billing/generate?searchMMR=${encodeURIComponent(searchMMR)}`, { requestId });
  }

  updateBillPayment(billId: number, paymentStatus: string) {
    return this.http.put<any>(`${this.base}/billing/${billId}/payment-status`, { paymentStatus });
  }

  getBillDetails(billId: number) {
    return this.http.get<any>(`${this.base}/billing/${billId}`);
  }

  downloadBillPdfUrl(billId: number) {
    return `${this.base}/billing/${billId}/pdf`;
  }

  searchPatientByMmr(term: string) {
    return this.http.get<any>(`${this.base}/patients/search?term=${encodeURIComponent(term)}`);
  }
}
