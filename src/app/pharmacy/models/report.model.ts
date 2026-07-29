// Matches C# SalesSummaryRow exactly
export interface SalesSummaryRow {
  saleDate: string;
  billCount: number;
  itemsSold: number;
  totalAmount: number;
}

// Matches C# MedicineWiseSalesRow exactly
export interface MedicineWiseSalesRow {
  medicineId: number;
  medicineName?: string;
  quantitySold: number;
  totalAmount: number;
}

// Matches C# StockStatusRow exactly
export interface StockStatusRow {
  medicineId: number;
  medicineCode?: string;
  medicineName?: string;
  reorderLevel: number;
  totalQuantity: number;
  stockStatus?: string;
}

// Matches C# ExpiryReportRow exactly
export interface ExpiryReportRow {
  stockId: number;
  medicineCode?: string;
  medicineName?: string;
  batchNumber?: string;
  quantity: number;
  expiryDate: string;
  daysRemaining: number;
  expiryStatus?: string;
}

// Matches C# LowStockReportRow exactly
export interface LowStockReportRow {
  medicineId: number;
  medicineCode?: string;
  medicineName?: string;
  reorderLevel: number;
  totalQuantity: number;
}

// Matches C# DispensingReportRow exactly
export interface DispensingReportRow {
  dispenseId: number;
  prescriptionId: number;
  patientName?: string;
  pharmacistName?: string;
  dispenseDate: string;
  totalItems: number;
  totalAmount: number;
}

// ─── API Response Shape ───────────────────────────────────────────────────

/** GET /api/pharmacist/reports — returns { report, fromDate, toDate, days, data } */
export interface ReportResponse {
  report: string;
  fromDate?: string;
  toDate?: string;
  days?: number;
  data: any[];
}
