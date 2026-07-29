import jsPDF from 'jspdf';
import { BillViewModel, BillItemViewModel } from '../models/bill.model';

/**
 * Generates and downloads a PDF invoice for a given bill.
 * Completely client-side — no backend PDF endpoint required.
 */
export function generateBillPdf(
  bill: BillViewModel,
  items: BillItemViewModel[]
): void {
  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W    = doc.internal.pageSize.getWidth();   // 210mm
  const grey = '#64748b';
  const dark = '#1e293b';
  const grn  = '#16a34a';

  const fmt  = (n: number) => `Rs. ${n.toFixed(2)}`;
  const pad  = (n: number, len: number) => String(n).padStart(len, '0');
  const billNo = `BILL-${pad(bill.billId, 6)}`;

  const dateStr = bill.billDate
    ? new Date(bill.billDate).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    : '—';

  let y = 18;

  // ── Header bar ────────────────────────────────────────────────────────────
  doc.setFillColor(22, 163, 74);          // green-600
  doc.rect(0, 0, W, 14, 'F');

  doc.setTextColor('#ffffff');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Infinity Clinic', 14, 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Pharmacy Department', 14, 13.5);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', W - 14, 9, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(billNo, W - 14, 13.5, { align: 'right' });

  y = 24;

  // ── Bill meta row ─────────────────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setTextColor(grey);

  doc.text('Bill No.',  14, y);
  doc.text('Bill Date', 80, y);
  doc.text('Status',    140, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(dark);
  doc.setFontSize(10);

  doc.text(billNo,     14, y);
  doc.text(dateStr,    80, y);
  doc.text(bill.status || 'Paid', 140, y);

  y += 10;

  // ── Divider ───────────────────────────────────────────────────────────────
  doc.setDrawColor('#e2e8f0');
  doc.setLineWidth(0.4);
  doc.line(14, y, W - 14, y);
  y += 8;

  // ── Patient info ──────────────────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setTextColor(grey);
  doc.setFont('helvetica', 'normal');
  doc.text('BILLED TO', 14, y);
  y += 5;

  doc.setFontSize(11);
  doc.setTextColor(dark);
  doc.setFont('helvetica', 'bold');
  doc.text(bill.patientName || `Patient #${bill.patientId}`, 14, y);
  y += 5;

  if (bill.patientCode) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(grey);
    doc.text(`Patient Code: ${bill.patientCode}`, 14, y);
    y += 5;
  }

  y += 6;

  // ── Items table header ────────────────────────────────────────────────────
  doc.setFillColor('#f1f5f9');
  doc.rect(14, y - 4, W - 28, 8, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(grey);

  const colNo    = 14;
  const colName  = 26;
  const colQty   = 120;
  const colPrice = 150;
  const colAmt   = W - 14;

  doc.text('#',           colNo,    y);
  doc.text('Medicine',    colName,  y);
  doc.text('Qty',         colQty,   y, { align: 'right' });
  doc.text('Unit Price',  colPrice, y, { align: 'right' });
  doc.text('Amount',      colAmt,   y, { align: 'right' });
  y += 7;

  // ── Item rows ─────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(dark);

  items.forEach((item, idx) => {
    // Alternate row shade
    if (idx % 2 === 0) {
      doc.setFillColor('#f8fafc');
      doc.rect(14, y - 4.5, W - 28, 7, 'F');
    }

    doc.setTextColor(grey);
    doc.text(String(idx + 1), colNo, y);

    doc.setTextColor(dark);
    doc.setFont('helvetica', 'bold');
    const name = item.medicineName || `Medicine #${item.medicineId}`;
    doc.text(name.length > 45 ? name.slice(0, 43) + '…' : name, colName, y);

    doc.setFont('helvetica', 'normal');
    doc.text(String(item.quantity),           colQty,   y, { align: 'right' });
    doc.text(fmt(item.unitPrice ?? 0),        colPrice, y, { align: 'right' });
    doc.text(fmt(item.amount ?? 0),           colAmt,   y, { align: 'right' });

    y += 7;
  });

  // ── Total row ─────────────────────────────────────────────────────────────
  const total = items.reduce((s, i) => s + (i.amount ?? 0), 0);

  doc.setDrawColor('#e2e8f0');
  doc.line(14, y, W - 14, y);
  y += 6;

  doc.setFillColor('#f0fdf4');
  doc.rect(colPrice - 10, y - 5, W - colPrice, 8, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(dark);
  doc.text('Total Amount', colPrice - 10, y);

  doc.setTextColor(grn);
  doc.setFontSize(12);
  doc.text(fmt(total), colAmt, y, { align: 'right' });

  y += 14;

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.setDrawColor('#e2e8f0');
  doc.line(14, y, W - 14, y);
  y += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grey);
  doc.text(
    'This is a computer-generated invoice. Infinity Clinic Pharmacy — Thank you for your visit.',
    W / 2, y, { align: 'center' }
  );

  // ── Save ──────────────────────────────────────────────────────────────────
  doc.save(`${billNo}.pdf`);
}
