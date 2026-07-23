import { SummaryRange, SummaryResponse } from '@/lib/api';
import { formatKes } from '@/lib/format';

const RANGE_OPTIONS: { value: SummaryRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: '7 Days' },
  { value: 'all', label: 'All time' },
];

const RANGE_CAPTION: Record<SummaryRange, string> = {
  today: "today's takings",
  week: 'last 7 days',
  all: 'since you went live',
};

export function SummaryCards({
  summary,
  onRangeChange,
}: {
  summary: SummaryResponse;
  onRangeChange: (range: SummaryRange) => void;
}) {
  const average =
    summary.transactionCount > 0
      ? summary.totalAmount / summary.transactionCount
      : 0;

  return (
    <div className="receipt receipt-torn border border-line rounded-t-lg overflow-hidden mb-8 relative">
      <div className="h-1.5 bg-gradient-to-r from-teal-dark via-amber to-teal-dark" />

      {/* corner stamp — reinforces the "receipt" feel without competing with the numbers */}
      <div className="pointer-events-none absolute top-4 right-4 rotate-6 opacity-[0.08] select-none hidden sm:block">
        <div className="border-2 border-teal-dark rounded-full w-20 h-20 flex items-center justify-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-teal-dark text-center leading-tight">
            Pesa<br />Wazi
          </span>
        </div>
      </div>

      <div className="px-5 sm:px-8 py-6 sm:py-8">
        {/* Range toggle */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft font-mono">
            Showing: {RANGE_CAPTION[summary.range]}
          </p>
          <div className="inline-flex rounded-md border border-line bg-paper-raised p-0.5 font-mono text-xs">
            {RANGE_OPTIONS.map((opt) => {
              const active = summary.range === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onRangeChange(opt.value)}
                  aria-pressed={active}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    active
                      ? 'bg-teal-dark text-white'
                      : 'text-ink-soft hover:text-ink hover:bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/*
          Explicit column-stack on mobile, row on sm+. Deliberately NOT
          using flex-wrap here — combined with shrinkable/truncated
          children, flex-wrap won't reliably break the row (children just
          shrink toward zero-width instead of wrapping), which is what
          caused the amount to collapse to a single character on phones.
        */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 sm:gap-8">
          {/* TOTAL RECEIVED */}
          <div className="w-full sm:flex-1 sm:min-w-[200px]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-teal-dark animate-ping opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-dark" />
              </span>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-soft font-mono">
                Total received
              </p>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-teal-dark/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-teal-dark"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M6 6v12M18 6v12" />
                </svg>
              </div>
              <p className="font-mono text-3xl sm:text-4xl md:text-5xl tabular text-ink font-medium">
                {formatKes(summary.totalAmount)}
              </p>
            </div>

            <p className="mt-2 ml-11 sm:ml-14 text-xs font-mono text-ink-soft">
              avg {formatKes(average)} / transaction
            </p>
          </div>

          <div className="hidden sm:block self-stretch w-px bg-line" />

          {/* TRANSACTIONS */}
          <div className="w-full sm:w-auto text-left sm:text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-soft font-mono">
              Transactions
            </p>

            <div className="mt-3 flex items-center gap-3 sm:justify-end">
              <div className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-teal-dark/10 flex items-center justify-center sm:order-2">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-teal-dark"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M9 3h6a1 1 0 0 1 1 1v16l-4-2-4 2V4a1 1 0 0 1 1-1z" />
                  <path d="M9 8h6M9 12h6" />
                </svg>
              </div>
              <p className="font-mono text-3xl sm:text-4xl md:text-5xl tabular text-teal-dark font-medium sm:order-1">
                {summary.transactionCount.toLocaleString('en-KE')}
              </p>
            </div>

            <p className="mt-2 text-xs font-mono text-ink-soft">
              across all payment methods
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}