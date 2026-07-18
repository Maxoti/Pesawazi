'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchSummary, fetchTransactions, SummaryResponse, Transaction } from '@/lib/api';
import { Header } from '@/components/Header';
import { SummaryCards } from '@/components/SummaryCards';
import { LedgerTable } from '@/components/LedgerTable';

const POLL_INTERVAL_MS = 8000;

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const knownIds = useRef<Set<string>>(new Set());

  const poll = useCallback(async () => {
    try {
      const [txRes, summaryRes] = await Promise.all([
        fetchTransactions({ page: 1, pageSize: 25 }),
        fetchSummary(),
      ]);

      const freshlyArrived = new Set(
        txRes.items
          .filter((t) => !knownIds.current.has(t.id))
          .map((t) => t.id),
      );

      // Don't flag everything as "new" on the very first load.
      if (knownIds.current.size > 0) {
        setNewIds(freshlyArrived);
        if (freshlyArrived.size > 0) {
          setTimeout(() => setNewIds(new Set()), 1500);
        }
      }

      txRes.items.forEach((t) => knownIds.current.add(t.id));
      setTransactions(txRes.items);
      setSummary(summaryRes);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not reach the Pesawazi backend.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [poll]);

  return (
    <main>
      <Header />

      {error && (
        <div className="mb-6 border border-amber/40 bg-amber-soft text-amber rounded-lg px-4 py-3 text-sm">
          {error} — check that the backend is running and{' '}
          <code className="font-mono">NEXT_PUBLIC_API_BASE_URL</code> is set
          correctly.
        </div>
      )}

      {loading && !error ? (
        <p className="text-ink-soft text-sm">Loading ledger…</p>
      ) : (
        <div className="space-y-6">
          {summary && <SummaryCards summary={summary} />}
          <LedgerTable transactions={transactions} newIds={newIds} />
        </div>
      )}
    </main>
  );
}
