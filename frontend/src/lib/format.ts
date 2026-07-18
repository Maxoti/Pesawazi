import { Transaction } from './api';

export function formatKes(amount: string | number): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 2,
  }).format(value);
}

/** Daraja sends TransTime as YYYYMMDDHHmmss (no separators). */
export function parseDarajaTime(transTime: string): Date | null {
  if (!/^\d{14}$/.test(transTime)) return null;
  const year = Number(transTime.slice(0, 4));
  const month = Number(transTime.slice(4, 6)) - 1;
  const day = Number(transTime.slice(6, 8));
  const hour = Number(transTime.slice(8, 10));
  const minute = Number(transTime.slice(10, 12));
  const second = Number(transTime.slice(12, 14));
  return new Date(year, month, day, hour, minute, second);
}

export function formatTransactionTime(transTime: string): string {
  const date = parseDarajaTime(transTime);
  if (!date) return transTime;
  return new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function payerName(t: Transaction): string {
  const parts = [t.firstName, t.middleName, t.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : '—';
}

export function maskMsisdn(msisdn: string): string {
  if (msisdn.length < 6) return msisdn;
  return `${msisdn.slice(0, 6)}••${msisdn.slice(-2)}`;
}
