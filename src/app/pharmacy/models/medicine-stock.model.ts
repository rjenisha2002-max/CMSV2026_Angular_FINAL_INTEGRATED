// Matches C# MedicineStock model exactly
export interface MedicineStock {
  stockId: number;
  medicineId: number;
  medicineName?: string;
  batchNumber: string;
  quantity: number;
  purchasePrice?: number;
  expiryDate: string;       // ISO date string
  purchaseDate?: string;    // ISO date string
  createdAt?: string;
  daysRemaining?: number;

  // Dashboard list projections — returned by /api/pharmacist/dashboard
  reorderLevel?: number;        // present in lowStockList items
  quantityAvailable?: number;   // present in lowStockList and expiringList items
}

// Matches C# MedicineLookup model (used in stock form dropdown)
export interface MedicineLookup {
  medicineId: number;
  medicineCode?: string;
  medicineName?: string;
  unitPrice: number;
}

// ─── API Response Shapes ──────────────────────────────────────────────────

/** GET /api/pharmacist/medicine-stock/new */
export interface NewStockMetaResponse {
  medicines: MedicineLookup[];
}
