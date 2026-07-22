'use client';

import { Transaction } from '@/lib/api';
import { generateLedgerPdf } from '@/lib/pdf';

export function DownloadButton({
  transactions,
  totalAmount,
}: {
  transactions: Transaction[];
  totalAmount: number;
}) {
  const handleDownload = () => {
    generateLedgerPdf(transactions, totalAmount);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={transactions.length === 0}
      className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wide font-semibold text-black bg-gold hover:bg-gold/90 rounded-full px-4 py-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Download PDF
    </button>
  );
}