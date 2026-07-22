import { SummaryResponse } from '@/lib/api';
import { formatKes } from '@/lib/format';

export function SummaryCards({ summary }: { summary: SummaryResponse }) {
  return (
    <div className="receipt receipt-torn border border-line rounded-t-lg px-8 py-8 mb-8">
      <div className="flex items-end justify-between flex-wrap gap-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft font-mono">
            Total received
          </p>
          <p className="mt-3 font-mono text-5xl tabular text-ink font-medium">
            {formatKes(summary.totalAmount)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft font-mono">
            Transactions
          </p>
          <p className="mt-3 font-mono text-5xl tabular text-teal-dark font-medium">
            {summary.transactionCount.toLocaleString('en-KE')}
          </p>
        </div>
      </div>
    </div>
  );
}