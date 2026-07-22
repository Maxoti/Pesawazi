'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { fetchSummary, fetchTransactions, SummaryResponse, Transaction } from '@/lib/api';
import { Header } from '@/components/Header';
import { SummaryCards } from '@/components/SummaryCards';
import { LedgerTable } from '@/components/LedgerTable';
import { DownloadButton } from '@/components/DownloadButton';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
const FALLBACK_POLL_MS = 60000;

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const knownIds = useRef<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  const loadInitial = useCallback(async () => {
    try {
      const [txRes, summaryRes] = await Promise.all([
        fetchTransactions({ page: 1, pageSize: 25 }),
        fetchSummary(),
      ]);

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

  const flashNew = useCallback((id: string) => {
    setNewIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setNewIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 1500);
  }, []);

  useEffect(() => {
    loadInitial();

    const socket = io(API_BASE_URL, {
      transports: ['websocket'],
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => setError(null));

    socket.on('connect_error', () => {
      setError('Live connection lost — retrying…');
    });

    socket.on('transaction:new', (transaction: Transaction) => {
      if (knownIds.current.has(transaction.id)) return;

      knownIds.current.add(transaction.id);
      setTransactions((prev) => [transaction, ...prev].slice(0, 25));
      setSummary((prev) =>
        prev
          ? {
              transactionCount: prev.transactionCount + 1,
              totalAmount: prev.totalAmount + Number(transaction.transAmount),
            }
          : prev,
      );
      flashNew(transaction.id);
    });

    const fallback = setInterval(loadInitial, FALLBACK_POLL_MS);

    return () => {
      socket.disconnect();
      clearInterval(fallback);
    };
  }, [loadInitial, flashNew]);

  return (
    <main>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <Header />
        <div className="sm:pt-1">
          <DownloadButton
            transactions={transactions}
            totalAmount={summary?.totalAmount ?? 0}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 border border-amber/40 bg-amber-soft text-amber rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading && !error ? (
        <p className="text-page-ink-soft text-sm">Loading ledger…</p>
      ) : (
        <div className="space-y-6">
          {summary && <SummaryCards summary={summary} />}
          <LedgerTable transactions={transactions} newIds={newIds} />
        </div>
      )}
    </main>
  );
}