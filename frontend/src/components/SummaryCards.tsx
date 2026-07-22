import { SummaryResponse } from '@/lib/api';
import { formatKes } from '@/lib/format';

export function SummaryCards({ summary }: { summary: SummaryResponse }) {
  return (
    <div className="receipt receipt-torn border border-line rounded-t-lg overflow-hidden mb-8">
      <div className="h-1.5 bg-gradient-to-r from-teal-dark via-amber to-teal-dark" />
      <div className="px-8 py-8">
        <div className="flex items-end justify-between flex-wrap gap-8">
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-teal-dark" />
              </span>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-soft font-mono">
                Total received
              </p>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <svg
                className="w-8 h-8 text-teal-dark shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <circle cx="12" cy="12" r="3" />
                <path d="M6 6v12M18 6v12" />
              </svg>
              <p className="font-mono text-5xl tabular text-ink font-medium">
                {formatKes(summary.totalAmount)}
              </p>
            </div>
          </div>

          <div className="hidden sm:block self-stretch w-px bg-line" />

          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-soft font-mono">
              Transactions
            </p>
            <div className="mt-3 flex items-center justify-end gap-3">
              <p className="font-mono text-5xl tabular text-teal-dark font-medium">
                {summary.transactionCount.toLocaleString('en-KE')}
              </p>
              <svg
                className="w-8 h-8 text-teal-dark shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M9 3h6a1 1 0 0 1 1 1v16l-4-2-4 2V4a1 1 0 0 1 1-1z" />
                <path d="M9 8h6M9 12h6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}