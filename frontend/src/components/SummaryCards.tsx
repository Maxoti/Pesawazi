import { SummaryResponse } from '@/lib/api';
import { formatKes } from '@/lib/format';

export function SummaryCards({ summary }: { summary: SummaryResponse }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-paper-raised border border-line rounded-lg p-6">
        <p className="text-xs uppercase tracking-wide text-ink-soft font-medium">
          Total received
        </p>
        <p className="mt-2 font-mono text-3xl tabular text-ink">
          {formatKes(summary.totalAmount)}
        </p>
      </div>
      <div className="bg-paper-raised border border-line rounded-lg p-6">
        <p className="text-xs uppercase tracking-wide text-ink-soft font-medium">
          Transactions
        </p>
        <p className="mt-2 font-mono text-3xl tabular text-ink">
          {summary.transactionCount.toLocaleString('en-KE')}
        </p>
      </div>
    </div>
  );
}
