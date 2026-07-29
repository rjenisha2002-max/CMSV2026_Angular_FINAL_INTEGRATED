import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PdfSummaryItem {
  label: string;
  value: string | number;
}

export interface PdfExportOptions {
  /** Document title, e.g. "Appointment Report" */
  title: string;
  /** Optional subtitle line, e.g. the date range or filters applied */
  subtitle?: string;
  /** Optional row of summary stat boxes (Total, Completed, Pending, etc.) */
  summary?: PdfSummaryItem[];
  /** Table header row */
  headers: string[];
  /** Table body rows, same column count/order as headers */
  rows: (string | number)[][];
  /** Downloaded file name, e.g. "appointment-report.pdf" */
  fileName?: string;
}

/**
 * Generates a clean, printable PDF entirely client-side (no backend call,
 * no extra network round-trip) using jsPDF + jspdf-autotable.
 *
 * Reusable across any report screen — Reception, Lab, Pharmacy — just
 * pass in a title/summary/headers/rows built from that page's own data.
 */
@Injectable({ providedIn: 'root' })
export class PdfExportService {
  export(options: PdfExportOptions): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let cursorY = 18;

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('InfinityCoderzz Clinic Management System', pageWidth / 2, cursorY, { align: 'center' });

    cursorY += 8;
    doc.setFontSize(13);
    doc.text(options.title, pageWidth / 2, cursorY, { align: 'center' });

    if (options.subtitle) {
      cursorY += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(options.subtitle, pageWidth / 2, cursorY, { align: 'center' });
    }

    cursorY += 4;
    doc.setDrawColor(200);
    doc.line(14, cursorY, pageWidth - 14, cursorY);
    cursorY += 8;

    // Summary stat boxes
    if (options.summary?.length) {
      doc.setFontSize(10);
      const colWidth = (pageWidth - 28) / options.summary.length;

      options.summary.forEach((item, i) => {
        const x = 14 + i * colWidth;
        doc.setFont('helvetica', 'normal');
        doc.text(item.label, x, cursorY);
        doc.setFont('helvetica', 'bold');
        doc.text(String(item.value), x, cursorY + 6);
      });

      cursorY += 14;
    }

    // Table
    autoTable(doc, {
      startY: cursorY,
      head: [options.headers],
      body: options.rows,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [13, 110, 90] }, // matches the app's teal sidebar
      alternateRowStyles: { fillColor: [245, 250, 249] }
    });

    // Footer: generated timestamp
    const finalY = (doc as any).lastAutoTable?.finalY ?? cursorY;
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, finalY + 10);

    doc.save(options.fileName ?? 'report.pdf');
  }
}
