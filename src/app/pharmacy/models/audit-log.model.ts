// Matches C# AuditLog model exactly
export interface AuditLog {
  logId: number;
  userId: number;
  username?: string;
  action?: string;
  remarks?: string;
  logDate: string;
}

// Matches C# MedicineInventoryLog model exactly
export interface InventoryLog {
  inventoryLogId: number;       // C# field: InventoryLogId
  medicineName?: string;
  quantityChanged: number;
  transactionType?: string;     // C# field: TransactionType (not "changeType")
  transactionDate: string;      // C# field: TransactionDate (not "logDate")
  remarks?: string;
}

// ─── API Response Shapes ──────────────────────────────────────────────────

/** GET /api/pharmacist/audit-logs — returns { fromDate, toDate, logs } */
export interface AuditLogResponse {
  fromDate?: string;
  toDate?: string;
  logs: AuditLog[];
}
