import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from './api';
import { formatKes, formatTransactionTime, maskMsisdn, payerName } from './format';

export function generateLedgerPdf(transactions: Transaction[], totalAmount: number) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('pesawazi', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Till receipt · live feed', 14, 27);

  const generatedAt = new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());
  doc.text(`Generated: ${generatedAt}`, 14, 33);

  // Summary line
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total received: ${formatKes(totalAmount)}`, 14, 43);
  doc.text(`Transactions: ${transactions.length}`, 140, 43);

  // Table
  const rows = transactions.map((t) => [
    formatTransactionTime(t.transTime),
    payerName(t),
    maskMsisdn(t.msisdn),
    t.billRefNumber || '—',
    formatKes(t.transAmount),
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['Time', 'From', 'Phone', 'Reference', 'Amount']],
    body: rows,
    headStyles: {
      fillColor: [27, 42, 107], // brand blue
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      4: { halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [245, 246, 242],
    },
  });

  const date = new Date().toISOString().slice(0, 10);
  doc.save(`pesawazi-ledger-${date}.pdf`);
}