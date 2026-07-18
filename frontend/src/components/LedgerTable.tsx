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
      <div className="border border-dashed border-line rounded-lg p-12 text-center">
        <p className="text-ink-soft font-body">
          No transactions yet. Once a payment lands on the till or paybill,
          it appears here — no SMS required.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-line rounded-lg overflow-hidden bg-paper-raised">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-soft">
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">From</th>
            <th className="px-4 py-3 font-medium">Phone</th>
            <th className="px-4 py-3 font-medium">Reference</th>
            <th className="px-4 py-3 font-medium text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr
              key={t.id}
              className={`border-b border-line last:border-b-0 ${
                newIds.has(t.id) ? 'ledger-row-new bg-teal-soft' : ''
              }`}
            >
              <td className="px-4 py-3 font-mono text-ink-soft whitespace-nowrap">
                {formatTransactionTime(t.transTime)}
              </td>
              <td className="px-4 py-3 text-ink">{payerName(t)}</td>
              <td className="px-4 py-3 font-mono text-ink-soft">
                {maskMsisdn(t.msisdn)}
              </td>
              <td className="px-4 py-3 font-mono text-ink-soft">
                {t.billRefNumber ?? '—'}
              </td>
              <td className="px-4 py-3 font-mono tabular text-right text-teal-dark font-medium">
                {formatKes(t.transAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
