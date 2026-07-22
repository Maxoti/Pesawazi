'use client';

import { useMemo, useState } from 'react';
import { Transaction } from '@/lib/api';
import { formatKes, formatTransactionTime, maskMsisdn, payerName } from '@/lib/format';

export function LedgerTable({
  transactions,
  newIds,
  page,
  totalPages,
  total,
  onPageChange,
}: {
  transactions: Transaction[];
  newIds: Set<string>;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((t) => payerName(t).toLowerCase().includes(q));
  }, [transactions, query]);

  if (transactions.length === 0) {
    return (
      <div className="perforation pt-8">
        <div className="border border-dashed border-line rounded-lg p-12 text-center bg-paper-raised">
          <p className="text-ink-soft font-body">
            No transactions yet. Once a payment lands on the till or paybill,
            it appears here — no SMS required.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="perforation">
      {/* Search */}
      <div className="border border-b-0 border-line bg-paper-raised px-5 py-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search this page by client name…"
          className="w-full sm:w-72 rounded-md border border-line bg-white px-3 py-2 text-sm font-body text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-teal-dark"
        />
      </div>

      {filtered.length === 0 && (
        <div className="border border-t-0 border-line bg-paper-raised p-8 text-center">
          <p className="text-ink-soft font-body text-sm">
            No transactions match &ldquo;{query}&rdquo; on this page.
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <>
          {/* Mobile: stacked receipt stubs */}
          <div className="sm:hidden border border-t-0 border-line bg-paper-raised divide-y divide-dashed divide-line">
            {filtered.map((t) => (
              <div
                key={t.id}
                className={`relative px-5 py-4 border-l-4 border-l-transparent transition-all duration-150 hover:border-l-blue-400 hover:bg-blue-50/60 hover:shadow-[inset_0_0_0_1px_rgba(59,130,246,0.15)] ${
                  newIds.has(t.id) ? 'ledger-row-new bg-teal-soft' : ''
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-ink font-medium">{payerName(t)}</span>
                  <span className="font-mono tabular text-teal-dark font-semibold">
                    {formatKes(t.transAmount)}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between text-xs font-mono text-ink-soft">
                  <span>{formatTransactionTime(t.transTime)}</span>
                  <span>{maskMsisdn(t.msisdn)}</span>
                </div>
                {t.billRefNumber && (
                  <div className="mt-1 text-xs font-mono text-ink-soft">
                    Ref: {t.billRefNumber}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop / tablet: full table */}
          <div className="hidden sm:block border border-t-0 border-line overflow-hidden bg-paper-raised">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft font-mono">
                  <th className="px-6 py-4 font-medium">Time</th>
                  <th className="px-6 py-4 font-medium">From</th>
                  <th className="px-6 py-4 font-medium">Phone</th>
                  <th className="px-6 py-4 font-medium">Reference</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    className={`group border-b border-dashed border-line last:border-b-0 border-l-4 border-l-transparent transition-all duration-150 hover:border-l-blue-400 hover:bg-blue-50/60 hover:shadow-[inset_0_0_0_1px_rgba(59,130,246,0.15)] ${
                      newIds.has(t.id) ? 'ledger-row-new bg-teal-soft' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-mono text-ink-soft whitespace-nowrap">
                      {formatTransactionTime(t.transTime)}
                    </td>
                    <td className="px-6 py-4 text-ink font-medium group-hover:text-blue-900 transition-colors">
                      {payerName(t)}
                    </td>
                    <td className="px-6 py-4 font-mono text-ink-soft">
                      {maskMsisdn(t.msisdn)}
                    </td>
                    <td className="px-6 py-4 font-mono text-ink-soft">
                      {t.billRefNumber || '—'}
                    </td>
                    <td className="px-6 py-4 font-mono tabular text-right text-teal-dark font-semibold group-hover:text-blue-700 transition-colors">
                      {formatKes(t.transAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Pagination footer */}
      <div className="border border-t-0 border-line rounded-b-lg bg-paper-raised px-6 py-4 flex items-center justify-between text-xs font-mono text-ink-soft">
        <span>
          Page {page} of {totalPages} &middot; {total} total
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-md border border-line text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-teal-soft transition-colors"
          >
            Prev
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-md border border-line text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-teal-soft transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}