// Matches C# Prescription model exactly
export interface Prescription {
  prescriptionId: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  prescriptionDate: string;
  remarks?: string;
  status?: string;
}

// Matches C# PrescriptionItem model exactly
export interface PrescriptionItem {
  prescriptionItemId: number;   // C# field name
  prescriptionId: number;
  medicineId: number;
  medicineName?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity: number;
  instructions?: string;        // C# field name (not "notes")
}

// ─── API Response Shapes ──────────────────────────────────────────────────

/** GET /api/pharmacist/prescriptions/{id} */
export interface PrescriptionDetailResponse {
  prescription: Prescription;
  items: PrescriptionItem[];
}
