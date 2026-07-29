import { MedicineStock } from './medicine-stock.model';

// Matches C# ChartPoint model exactly
export interface ChartPoint {
  label: string;
  value: number;
}

// Matches C# PharmacyDashboard model exactly
export interface PharmacyDashboard {
  totalMedicines: number;
  totalStockBatches: number;
  lowStockMedicines: number;
  expiringMedicines: number;
  expiredMedicines: number;
  pendingPrescriptions: number;
  todaysBills: number;
  todaysRevenue: number;
  availableMedicines: number;
  reorderRequired: number;
  todaysDispensed: number;
  monthlyRevenue: number;
  lowStockList: MedicineStock[];
  expiringList: MedicineStock[];
  revenueChart: ChartPoint[];
  dispensingChart: ChartPoint[];
}
