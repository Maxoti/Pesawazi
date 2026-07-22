'use client';

import { Transaction } from '@/lib/api';
import { downloadCsv, transactionsToCsv } from '@/lib/csv';

export function DownloadButton({ transactions }: { transactions: Transaction[] }) {
  const handleDownload = () => {
    const csv = transactionsToCsv(transactions);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`pesawazi-ledger-${date}.csv`, csv);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={transactions.length === 0}
      className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-page-ink-soft hover:text-page-ink border border-white/15 hover:border-white/30 rounded-full px-4 py-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Download CSV
    </button>
  );
}