export function Header({ shortcodeLabel }: { shortcodeLabel?: string }) {
  return (
    <header className="flex items-start justify-between mb-10">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-page-ink-soft font-mono mb-2">
          Till receipt · live feed
        </p>
        <h1 className="font-display text-4xl font-semibold text-white tracking-tight flex items-center gap-2">
          pesa
          <span className="inline-flex items-center justify-center border-2 border-gold text-gold rounded-full px-4 py-0.5 text-3xl">
            wazi
          </span>
        </h1>
        <p className="text-sm text-page-ink-soft mt-2 font-mono">
          {shortcodeLabel ?? 'Real-time transaction ledger'}
        </p>
      </div>
      <div className="relative flex items-center gap-2 bg-teal-soft text-teal-dark text-xs font-medium px-3 py-1.5 rounded-full">
        <span className="relative w-1.5 h-1.5">
          <span className="absolute inset-0 rounded-full bg-teal pulse-dot" />
          <span className="absolute inset-0 rounded-full text-teal ripple" />
        </span>
        Live
      </div>
    </header>
  );
}