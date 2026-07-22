'use client';

import { Transaction } from '@/lib/api';
import { formatKes, formatTransactionTime, maskMsisdn, payerName } from '@/lib/format';

export function LedgerTable({
  transactions,
  newIds,
}: {
  transactions: Transaction[];
  newIds: Set<string>;
}) {
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
      {/* Mobile: stacked receipt stubs */}
      <div className="sm:hidden border border-t-0 border-line rounded-b-lg bg-paper-raised divide-y divide-dashed divide-line">
        {transactions.map((t) => (
          <div
            key={t.id}
            className={`px-5 py-4 ${newIds.has(t.id) ? 'ledger-row-new bg-teal-soft' : ''}`}
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
      <div className="hidden sm:block border border-t-0 border-line rounded-b-lg overflow-hidden bg-paper-raised">
        <table className="w-full text-sm">
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
            {transactions.map((t) => (
              <tr
                key={t.id}
                className={`border-b border-dashed border-line last:border-b-0 ${
                  newIds.has(t.id) ? 'ledger-row-new bg-teal-soft' : ''
                }`}
              >
                <td className="px-6 py-4 font-mono text-ink-soft whitespace-nowrap">
                  {formatTransactionTime(t.transTime)}
                </td>
                <td className="px-6 py-4 text-ink font-medium">{payerName(t)}</td>
                <td className="px-6 py-4 font-mono text-ink-soft">
                  {maskMsisdn(t.msisdn)}
                </td>
                <td className="px-6 py-4 font-mono text-ink-soft">
                  {t.billRefNumber || '—'}
                </td>
                <td className="px-6 py-4 font-mono tabular text-right text-teal-dark font-semibold">
                  {formatKes(t.transAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}