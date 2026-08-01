import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import {
  Medicine, MedicineCategory, Manufacturer,
  MedicineListResponse, NewMedicineMetaResponse, MedicineDetailResponse
} from '../models/medicine.model';
import {
  MedicineStock, MedicineLookup, NewStockMetaResponse
} from '../models/medicine-stock.model';
import { Prescription, PrescriptionItem, PrescriptionDetailResponse } from '../models/prescription.model';
import {
  BillViewModel, BillItemViewModel, CreateBillViewModel,
  MedicineForBilling, PatientLookup, BillPrescriptionLink,
  NewBillMetaResponse, BillDetailResponse
} from '../models/bill.model';
import {
  DispensingHistoryViewModel, DispenseBillResult,
  DispensingItem, DispenseResponse,
  StockCheckResult,
} from '../models/dispensing.model';
import { PharmacyDashboard } from '../models/pharmacy-dashboard.model';
import {
  SalesSummaryRow, MedicineWiseSalesRow, StockStatusRow,
  ExpiryReportRow, LowStockReportRow, DispensingReportRow, ReportResponse
} from '../models/report.model';
import { AuditLog, InventoryLog, AuditLogResponse } from '../models/audit-log.model';

/**
 * PharmacyService
 *
 * All endpoints target the ASP.NET Core Web API at environment.apiUrl
 * (https://localhost:7037/api/).
 *
 * withCredentials is handled globally by the authInterceptor so the
 * session cookie (.InfinityClinic.Session) is attached to every request.
 *
 * Base route prefix: api/pharmacist/
 */
@Injectable({ providedIn: 'root' })
export class PharmacyService {
  private api = environment.apiUrl;
  /** Shorthand: api/pharmacist/ — team's environment.apiUrl has no trailing slash */
  private ph = `${environment.apiUrl}/pharmacist/`;

  constructor(private http: HttpClient) { }

  // ─── Dashboard ──────────────────────────────────────────────────────────
  // GET /api/pharmacist/dashboard → PharmacyDashboard (direct object)

  getDashboard(): Observable<PharmacyDashboard> {
    return this.http.get<PharmacyDashboard>(`${this.ph}dashboard`);
  }

  // ─── Medicines ──────────────────────────────────────────────────────────
  // GET /api/pharmacist/medicines?searchTerm=  → { searchTerm, medicines }
  // GET /api/pharmacist/medicines/new          → { categories, manufacturers, nextMedicineCode }
  // GET /api/pharmacist/medicines/{id}         → { medicine, categories, manufacturers }
  // POST /api/pharmacist/medicines             → { message, medicine }
  // PUT  /api/pharmacist/medicines/{id}        → { message, medicine }
  // POST /api/pharmacist/medicines/{id}/disable → { message }

  getAllMedicines(searchTerm?: string): Observable<Medicine[]> {
    let params = new HttpParams();
    if (searchTerm) params = params.set('searchTerm', searchTerm);
    return this.http.get<MedicineListResponse>(`${this.ph}medicines`, { params })
      .pipe(map(res => res.medicines));
  }

  getNewMedicineMeta(): Observable<NewMedicineMetaResponse> {
    return this.http.get<NewMedicineMetaResponse>(`${this.ph}medicines/new`);
  }

  getMedicineById(id: number): Observable<MedicineDetailResponse> {
    return this.http.get<MedicineDetailResponse>(`${this.ph}medicines/${id}`);
  }

  createMedicine(medicine: Partial<Medicine>): Observable<{ message: string; medicine: Medicine }> {
    return this.http.post<{ message: string; medicine: Medicine }>(`${this.ph}medicines`, medicine);
  }

  updateMedicine(id: number, medicine: Partial<Medicine>): Observable<{ message: string; medicine: Medicine }> {
    return this.http.put<{ message: string; medicine: Medicine }>(`${this.ph}medicines/${id}`, medicine);
  }

  disableMedicine(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.ph}medicines/${id}/disable`, {});
  }

  // ─── Medicine Stock ─────────────────────────────────────────────────────
  // GET  /api/pharmacist/medicine-stock           → MedicineStock[] (direct array)
  // GET  /api/pharmacist/medicine-stock/new       → { medicines: MedicineLookup[] }
  // POST /api/pharmacist/medicine-stock           → { message, stock }
  // GET  /api/pharmacist/medicine-stock/{id}      → MedicineStock (direct object)
  // PUT  /api/pharmacist/medicine-stock/{id}      → { message, stock }
  // GET  /api/pharmacist/medicine-stock/low-stock → MedicineStock[]
  // GET  /api/pharmacist/medicine-stock/expiring  → MedicineStock[]
  // GET  /api/pharmacist/medicine-stock/expired   → MedicineStock[]

  getAllStock(): Observable<MedicineStock[]> {
    return this.http.get<MedicineStock[]>(`${this.ph}medicine-stock`);
  }

  getNewStockMeta(): Observable<NewStockMetaResponse> {
    return this.http.get<NewStockMetaResponse>(`${this.ph}medicine-stock/new`);
  }

  createStock(stock: Partial<MedicineStock>): Observable<{ message: string; stock: MedicineStock }> {
    return this.http.post<{ message: string; stock: MedicineStock }>(`${this.ph}medicine-stock`, stock);
  }

  getStockById(id: number): Observable<MedicineStock> {
    return this.http.get<MedicineStock>(`${this.ph}medicine-stock/${id}`);
  }

  updateStock(id: number, stock: Partial<MedicineStock>): Observable<{ message: string; stock: MedicineStock }> {
    return this.http.put<{ message: string; stock: MedicineStock }>(`${this.ph}medicine-stock/${id}`, stock);
  }

  getLowStock(): Observable<MedicineStock[]> {
    return this.http.get<MedicineStock[]>(`${this.ph}medicine-stock/low-stock`);
  }

  getExpiringMedicines(): Observable<MedicineStock[]> {
    return this.http.get<MedicineStock[]>(`${this.ph}medicine-stock/expiring`);
  }

  getExpiredMedicines(): Observable<MedicineStock[]> {
    return this.http.get<MedicineStock[]>(`${this.ph}medicine-stock/expired`);
  }

  // ─── Prescriptions ──────────────────────────────────────────────────────
  // GET  /api/pharmacist/prescriptions        → Prescription[] (direct array)
  // GET  /api/pharmacist/prescriptions/{id}   → { prescription, items }
  // POST /api/pharmacist/prescriptions/{id}/dispense → { message }
  // PUT  /api/pharmacist/prescriptions/{id}/status   → { message }

  getAllPrescriptions(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.ph}prescriptions`);
  }

  getPrescriptionDetails(id: number): Observable<PrescriptionDetailResponse> {
    return this.http.get<PrescriptionDetailResponse>(`${this.ph}prescriptions/${id}`);
  }

  markPrescriptionDispensed(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.ph}prescriptions/${id}/dispense`, {});
  }

  updatePrescriptionStatus(id: number, status: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.ph}prescriptions/${id}/status`, { status });
  }

  // ─── Dispensing ─────────────────────────────────────────────────────────
  // GET  /api/pharmacist/dispensing              → Prescription[] (dispensable)
  // POST /api/pharmacist/dispensing              → { message, result: DispenseBillResult }
  // GET  /api/pharmacist/dispensing/history      → DispensingHistoryViewModel[]
  // GET  /api/pharmacist/dispensing/{id}/items   → DispensingItem[]

  getDispensablePrescriptions(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.ph}dispensing`);
  }

  checkStock(prescriptionId: number): Observable<StockCheckResult> {
    return this.http.get<StockCheckResult>(`${this.ph}dispensing/${prescriptionId}/stock-check`);
  }

  dispenseAndBill(prescriptionId: number, remarks?: string): Observable<DispenseResponse> {
    return this.http.post<DispenseResponse>(`${this.ph}dispensing`, { prescriptionId, remarks });
  }

  getDispensingHistory(): Observable<DispensingHistoryViewModel[]> {
    return this.http.get<DispensingHistoryViewModel[]>(`${this.ph}dispensing/history`);
  }

  getDispensingItems(dispenseId: number): Observable<DispensingItem[]> {
    return this.http.get<DispensingItem[]>(`${this.ph}dispensing/${dispenseId}/items`);
  }

  // ─── Bills ──────────────────────────────────────────────────────────────
  // GET  /api/pharmacist/bills         → BillViewModel[] (direct array)
  // GET  /api/pharmacist/bills/new     → { patients, medicines }
  // POST /api/pharmacist/bills         → { message, bill }
  // GET  /api/pharmacist/bills/{id}    → { bill, items, prescriptionLink }
  // POST /api/pharmacist/bills/{id}/cancel → { message }
  // GET  /api/pharmacist/bills/{id}/invoice → PDF blob (streamed by backend)

  getAllBills(): Observable<BillViewModel[]> {
    return this.http.get<BillViewModel[]>(`${this.ph}bills`);
  }

  getNewBillMeta(): Observable<NewBillMetaResponse> {
    return this.http.get<NewBillMetaResponse>(`${this.ph}bills/new`);
  }

  createBill(model: CreateBillViewModel): Observable<{ message: string; bill: BillViewModel }> {
    return this.http.post<{ message: string; bill: BillViewModel }>(`${this.ph}bills`, model);
  }

  getBillDetails(id: number): Observable<BillDetailResponse> {
    return this.http.get<BillDetailResponse>(`${this.ph}bills/${id}`);
  }

  cancelBill(id: number, reason?: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.ph}bills/${id}/cancel`, { reason });
  }

  /**
   * Downloads the PDF invoice as a Blob via HttpClient so the
   * auth interceptor attaches withCredentials (session cookie).
   * Use URL.createObjectURL on the result to trigger a file download.
   * Endpoint: GET /api/pharmacist/bills/{id}/invoice/pdf → application/pdf blob
   * (Note: GET /bills/{id}/invoice returns JSON { bill, items } — this method
   *  uses the /pdf suffix which returns the actual binary PDF stream.)
   */
  downloadInvoicePdf(billId: number): Observable<Blob> {
    return this.http.get(`${this.ph}bills/${billId}/invoice/pdf`, { responseType: 'blob' });
  }

  // ─── Reports ────────────────────────────────────────────────────────────
  // GET /api/pharmacist/reports?report=&fromDate=&toDate=&days=
  //     → { report, fromDate, toDate, days, data }
  // GET /api/pharmacist/reports/export?report=&fromDate=&toDate=&days=
  //     → CSV blob

  getReport(
    report: string,
    fromDate?: string,
    toDate?: string,
    days: number = 30
  ): Observable<ReportResponse> {
    let params = new HttpParams().set('report', report).set('days', days.toString());
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get<ReportResponse>(`${this.ph}reports`, { params });
  }

  exportCsv(
    report: string,
    fromDate?: string,
    toDate?: string,
    days: number = 30
  ): Observable<Blob> {
    let params = new HttpParams().set('report', report).set('days', days.toString());
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get(`${this.ph}reports/export`, { params, responseType: 'blob' });
  }

  // ─── Audit Logs ─────────────────────────────────────────────────────────
  // GET /api/pharmacist/audit-logs?fromDate=&toDate=
  //     → { fromDate, toDate, logs: AuditLog[] }

  getAuditLogs(fromDate?: string, toDate?: string): Observable<AuditLog[]> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get<AuditLogResponse>(`${this.ph}audit-logs`, { params })
      .pipe(map(res => res.logs));
  }

  // ─── Inventory Logs ─────────────────────────────────────────────────────
  // GET /api/pharmacist/inventory-logs → MedicineInventoryLog[] (direct array)

  getInventoryLogs(): Observable<InventoryLog[]> {
    return this.http.get<InventoryLog[]>(`${this.ph}inventory-logs`);
  }
}
