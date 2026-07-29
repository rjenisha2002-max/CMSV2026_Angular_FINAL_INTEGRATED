// Matches C# BillViewModel exactly
export interface BillViewModel {
  billId: number;
  patientId: number;
  patientName?: string;
  patientCode?: string;
  billDate: string;
  totalAmount: number;
  status?: string;
}

// Matches C# BillItemViewModel exactly
export interface BillItemViewModel {
  billItemId: number;
  billId: number;
  medicineId: number;
  medicineName?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// Matches C# CreateBillViewModel exactly
export interface CreateBillViewModel {
  patientId: number;
  billItems: BillItemEntryViewModel[];
  totalAmount: number;   // required: sent to sp_CreatePharmacyBillHeader @TotalAmount
}

// Matches C# BillItemEntryViewModel exactly
export interface BillItemEntryViewModel {
  medicineId: number;
  medicineName?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// Matches C# MedicineLookup used in billing (from GetMedicinesForBilling)
export interface MedicineForBilling {
  medicineId: number;
  medicineName?: string;
  medicineCode?: string;
  unitPrice: number;
}

// Matches C# PatientLookup model exactly
export interface PatientLookup {
  patientId: number;
  patientCode?: string;
  fullName?: string;
  displayText?: string;
}

// Matches C# BillPrescriptionLink model exactly
export interface BillPrescriptionLink {
  prescriptionId: number;
  dispenseId: number;
  prescriptionStatus?: string;
}

// ─── API Response Shapes ──────────────────────────────────────────────────

/** GET /api/pharmacist/bills/new */
export interface NewBillMetaResponse {
  patients: PatientLookup[];
  medicines: MedicineForBilling[];
}

/** GET /api/pharmacist/bills/{id} */
export interface BillDetailResponse {
  bill: BillViewModel;
  items: BillItemViewModel[];
  prescriptionLink: BillPrescriptionLink | null;
}
