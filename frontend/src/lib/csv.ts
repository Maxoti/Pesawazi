import { Transaction } from './api';
import { formatTransactionTime, maskMsisdn, payerName } from './format';

export function transactionsToCsv(transactions: Transaction[]): string {
  const headers = ['Time', 'From', 'Phone', 'Reference', 'Amount (KES)', 'Transaction ID'];

  const rows = transactions.map((t) => [
    formatTransactionTime(t.transTime),
    payerName(t),
    maskMsisdn(t.msisdn),
    t.billRefNumber ?? '',
    t.transAmount,
    t.transId,
  ]);

  const escapeCell = (cell: string) =>
    /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;

  return [headers, ...rows]
    .map((row) => row.map((cell) => escapeCell(String(cell))).join(','))
    .join('\n');
}

export function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}