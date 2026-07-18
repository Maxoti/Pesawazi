export function Header({ shortcodeLabel }: { shortcodeLabel?: string }) {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">
          pesa<span className="text-teal">wazi</span>
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          {shortcodeLabel ?? 'Live transaction ledger'}
        </p>
      </div>
      <div className="flex items-center gap-2 bg-teal-soft text-teal-dark text-xs font-medium px-3 py-1.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-teal pulse-dot" />
        Live
      </div>
    </header>
  );
}
