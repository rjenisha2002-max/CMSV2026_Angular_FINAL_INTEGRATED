// Matches C# Medicine model exactly
export interface Medicine {
  medicineId: number;
  medicineCode: string;
  medicineName: string;
  genericName?: string;
  categoryId: number;
  categoryName?: string;
  manufacturerId: number;
  manufacturerName?: string;
  unit?: string;
  unitPrice: number;
  reorderLevel: number;
  isActive: boolean;
}

// Matches C# MedicineCategory model
export interface MedicineCategory {
  categoryId: number;
  categoryName: string;
  description?: string;
}

// Matches C# Manufacturer model
export interface Manufacturer {
  manufacturerId: number;
  manufacturerName: string;
}

// ─── API Response Shapes ──────────────────────────────────────────────────

/** GET /api/pharmacist/medicines — returns { searchTerm, medicines } */
export interface MedicineListResponse {
  searchTerm?: string;
  medicines: Medicine[];
}

/** GET /api/pharmacist/medicines/new — returns form metadata */
export interface NewMedicineMetaResponse {
  categories: MedicineCategory[];
  manufacturers: Manufacturer[];
  nextMedicineCode: string;
}

/** GET /api/pharmacist/medicines/{id} — returns medicine + lookup data */
export interface MedicineDetailResponse {
  medicine: Medicine;
  categories: MedicineCategory[];
  manufacturers: Manufacturer[];
}
