import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

import { Login } from './auth/login/login';

import { DoctorDashboard } from './doctor/dashboard/dashboard';
import { DoctorAppointments } from './doctor/appointments/appointments';
import { DoctorConsultation } from './doctor/consultation/consultation';
import { DoctorPatientSearch } from './doctor/patient-search/patient-search';

import { LabDashboard } from './lab/dashboard/dashboard';
import { LabPendingTests } from './lab/pending-tests/pending-tests';
import { LabResults } from './lab/results/results';
import { LabBilling } from './lab/billing/billing';
import { LabReports } from './lab/reports/reports';
import { LabPatientSearch } from './lab/patient-search/patient-search';

import { ReceptionDashboard } from './reception/dashboard/dashboard';
import { ReceptionPatients } from './reception/patients/patients';
import { ReceptionAppointments } from './reception/appointments/appointments';
import { ReceptionBills } from './reception/bills/bills';
import { ReceptionVisits } from './reception/visits/visits';
import { ReceptionReports } from './reception/reports/reports';
import { ReceptionRegisterPatient } from './reception/register-patient/register-patient';
import { Layout } from './reception/layout/layout';

import { PharmacyLayout } from './pharmacy/pharmacy-layout/pharmacy-layout';  // added

import { NotFound } from './shared/notfound/notfound';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },

  {
    path: 'doctor',
    canActivate: [authGuard, roleGuard('Doctor')],
    children: [
      { path: 'dashboard', component: DoctorDashboard },
      { path: 'appointments', component: DoctorAppointments },
      { path: 'consultation/:appointmentId', component: DoctorConsultation },
      { path: 'patient-search', component: DoctorPatientSearch }
    ]
  },

  {
    path: 'lab',
    canActivate: [authGuard, roleGuard('Lab Technician')],
    children: [
      { path: 'dashboard', component: LabDashboard },
      { path: 'pending-tests', component: LabPendingTests },
      { path: 'results/:requestItemId', component: LabResults },
      { path: 'billing', component: LabBilling },
      { path: 'reports', component: LabReports },
      { path: 'patient-search', component: LabPatientSearch }
    ]
  },

  {
    path: 'reception',
    component: Layout,
    canActivate: [authGuard, roleGuard('Receptionist')],
    children: [
      { path: 'dashboard', component: ReceptionDashboard },
      { path: 'register-patient', component: ReceptionRegisterPatient },
      { path: 'patients', component: ReceptionPatients },
      { path: 'appointments', component: ReceptionAppointments },
      { path: 'bills', component: ReceptionBills },
      { path: 'visits', component: ReceptionVisits },
      { path: 'reports', component: ReceptionReports },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // {
  //   path: 'pharmacy',
  //   loadComponent: () => import('./pharmacy/pharmacy-layout/pharmacy-layout').then(m => m.PharmacyLayout),
  //   canActivate: [authGuard, roleGuard('Pharmacist')],
  //   children: [
  //     { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  //     { path: 'dashboard',       loadComponent: () => import('./pharmacy/dashboard/dashboard').then(m => m.PharmacyDashboard) },
  //     { path: 'medicine',        loadComponent: () => import('./pharmacy/medicine/medicine').then(m => m.Medicine) },
  //     { path: 'medicine/add',    loadComponent: () => import('./pharmacy/medicine-add/medicine-add').then(m => m.MedicineAdd) },
  //     { path: 'medicine/edit/:id', loadComponent: () => import('./pharmacy/medicine-edit/medicine-edit').then(m => m.MedicineEdit) },
  //     { path: 'stock',           loadComponent: () => import('./pharmacy/medicine-stock/medicine-stock').then(m => m.MedicineStockList) },
  //     { path: 'stock/add',       loadComponent: () => import('./pharmacy/medicine-stock/medicine-stock-add').then(m => m.MedicineStockAdd) },
  //     { path: 'stock/edit/:id',  loadComponent: () => import('./pharmacy/medicine-stock/medicine-stock-edit').then(m => m.MedicineStockEdit) },
  //     { path: 'stock/low-stock', loadComponent: () => import('./pharmacy/medicine-stock/low-stock').then(m => m.LowStock) },
  //     { path: 'stock/expiring',  loadComponent: () => import('./pharmacy/medicine-stock/expiring-medicines').then(m => m.ExpiringMedicines) },
  //     { path: 'stock/expired',   loadComponent: () => import('./pharmacy/medicine-stock/expired-medicines').then(m => m.ExpiredMedicines) },
  //     { path: 'prescription',    loadComponent: () => import('./pharmacy/prescription/prescription-list').then(m => m.PrescriptionList) },
  //     { path: 'prescription/:id', loadComponent: () => import('./pharmacy/prescription/prescription-details').then(m => m.PrescriptionDetails) },
  //     { path: 'dispensing',      loadComponent: () => import('./pharmacy/dispensing/dispensing-create').then(m => m.DispensingCreate) },
  //     { path: 'dispensing/history', loadComponent: () => import('./pharmacy/dispensing/dispensing-history').then(m => m.DispensingHistory) },
  //     { path: 'dispensing/:id/items', loadComponent: () => import('./pharmacy/dispensing/dispensing-detail').then(m => m.DispensingDetail) },
  //     { path: 'bills',           loadComponent: () => import('./pharmacy/billing/billing').then(m => m.Billing) },
  //     { path: 'bills/create',    loadComponent: () => import('./pharmacy/bill-create/bill-create').then(m => m.BillCreate) },
  //     { path: 'bills/:id',       loadComponent: () => import('./pharmacy/bill-details/bill-details').then(m => m.BillDetails) },
  //     { path: 'reports',         loadComponent: () => import('./pharmacy/reports/reports').then(m => m.Reports) },
  //     { path: 'inventory-log',   loadComponent: () => import('./pharmacy/inventory-log/inventory-log').then(m => m.InventoryLog) },
  //     { path: 'audit-log',       loadComponent: () => import('./pharmacy/audit-log/audit-log').then(m => m.AuditLog) }
  //   ]
  // },


    {
    path: 'pharmacy',
    component: PharmacyLayout,         // ← CHANGE: was loadComponent + dynamic import
    canActivate: [authGuard, roleGuard('Pharmacist')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',       loadComponent: () => import('./pharmacy/dashboard/dashboard').then(m => m.PharmacyDashboard) },
      { path: 'medicine',        loadComponent: () => import('./pharmacy/medicine/medicine').then(m => m.Medicine) },
      { path: 'medicine/add',    loadComponent: () => import('./pharmacy/medicine-add/medicine-add').then(m => m.MedicineAdd) },
      { path: 'medicine/edit/:id', loadComponent: () => import('./pharmacy/medicine-edit/medicine-edit').then(m => m.MedicineEdit) },
      { path: 'stock',           loadComponent: () => import('./pharmacy/medicine-stock/medicine-stock').then(m => m.MedicineStockList) },
      { path: 'stock/add',       loadComponent: () => import('./pharmacy/medicine-stock/medicine-stock-add').then(m => m.MedicineStockAdd) },
      { path: 'stock/edit/:id',  loadComponent: () => import('./pharmacy/medicine-stock/medicine-stock-edit').then(m => m.MedicineStockEdit) },
      { path: 'stock/low-stock', loadComponent: () => import('./pharmacy/medicine-stock/low-stock').then(m => m.LowStock) },
      { path: 'stock/expiring',  loadComponent: () => import('./pharmacy/medicine-stock/expiring-medicines').then(m => m.ExpiringMedicines) },
      { path: 'stock/expired',   loadComponent: () => import('./pharmacy/medicine-stock/expired-medicines').then(m => m.ExpiredMedicines) },
      { path: 'prescription',    loadComponent: () => import('./pharmacy/prescription/prescription-list').then(m => m.PrescriptionList) },
      { path: 'prescription/:id', loadComponent: () => import('./pharmacy/prescription/prescription-details').then(m => m.PrescriptionDetails) },
      { path: 'dispensing',      loadComponent: () => import('./pharmacy/dispensing/dispensing-create').then(m => m.DispensingCreate) },
      { path: 'dispensing/history', loadComponent: () => import('./pharmacy/dispensing/dispensing-history').then(m => m.DispensingHistory) },
      { path: 'dispensing/:id/items', loadComponent: () => import('./pharmacy/dispensing/dispensing-detail').then(m => m.DispensingDetail) },
      { path: 'bills',           loadComponent: () => import('./pharmacy/billing/billing').then(m => m.Billing) },
      { path: 'bills/create',    loadComponent: () => import('./pharmacy/bill-create/bill-create').then(m => m.BillCreate) },
      { path: 'bills/:id',       loadComponent: () => import('./pharmacy/bill-details/bill-details').then(m => m.BillDetails) },
      { path: 'reports',         loadComponent: () => import('./pharmacy/reports/reports').then(m => m.Reports) },
      { path: 'inventory-log',   loadComponent: () => import('./pharmacy/inventory-log/inventory-log').then(m => m.InventoryLog) },
      { path: 'audit-log',       loadComponent: () => import('./pharmacy/audit-log/audit-log').then(m => m.AuditLog) }
    ]
  },

  // Standalone printable invoice page — guarded but rendered outside the
  // PharmacyLayout shell (no sidebar), same as the standalone Pharmacy app.
  {
    path: 'pharmacy/bills/:id/invoice',
    canActivate: [authGuard, roleGuard('Pharmacist')],
    loadComponent: () => import('./pharmacy/bill-invoice/bill-invoice').then(m => m.BillInvoice)
  },

  { path: '**', component: NotFound }
];
