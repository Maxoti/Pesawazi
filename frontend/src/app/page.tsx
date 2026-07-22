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
const PAGE_SIZE = 25;

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasNewOffPage, setHasNewOffPage] = useState(false);
  const knownIds = useRef<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);
  const pageRef = useRef(1);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const loadPage = useCallback(async (targetPage: number) => {
    setLoading(true);
    try {
      const [txRes, summaryRes] = await Promise.all([
        fetchTransactions({ page: targetPage, pageSize: PAGE_SIZE }),
        fetchSummary(),
      ]);

      txRes.items.forEach((t) => knownIds.current.add(t.id));
      setTransactions(txRes.items);
      setTotal(txRes.total);
      setSummary(summaryRes);
      setError(null);
      if (targetPage === 1) setHasNewOffPage(false);
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
    loadPage(1);

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

      setTotal((prev) => prev + 1);
      setSummary((prev) =>
        prev
          ? {
              transactionCount: prev.transactionCount + 1,
              totalAmount: prev.totalAmount + Number(transaction.transAmount),
            }
          : prev,
      );

      if (pageRef.current === 1) {
        setTransactions((prev) => [transaction, ...prev].slice(0, PAGE_SIZE));
        flashNew(transaction.id);
      } else {
        setHasNewOffPage(true);
      }
    });

    const fallback = setInterval(() => loadPage(pageRef.current), FALLBACK_POLL_MS);

    return () => {
      socket.disconnect();
      clearInterval(fallback);
    };
  }, [loadPage, flashNew]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const goToPage = (target: number) => {
    const clamped = Math.min(Math.max(target, 1), totalPages);
    setPage(clamped);
    loadPage(clamped);
  };

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

      {hasNewOffPage && page !== 1 && (
        <div className="mb-6 border border-teal-dark/40 bg-teal-soft text-teal-dark rounded-lg px-4 py-3 text-sm flex items-center justify-between">
          <span>New transactions have arrived.</span>
          <button
            onClick={() => goToPage(1)}
            className="font-medium underline underline-offset-2"
          >
            Jump to latest
          </button>
        </div>
      )}

      {loading && !error && transactions.length === 0 ? (
        <p className="text-page-ink-soft text-sm">Loading ledger…</p>
      ) : (
        <div className="space-y-6">
          {summary && <SummaryCards summary={summary} />}
          <LedgerTable
            transactions={transactions}
            newIds={newIds}
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={goToPage}
          />
        </div>
      )}
    </main>
  );
}