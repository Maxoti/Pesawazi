export interface Transaction {
  id: string;
  transId: string;
  transTime: string;
  transactionType: string;
  transAmount: string;
  businessShortCode: string;
  billRefNumber: string | null;
  invoiceNumber: string | null;
  msisdn: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  receivedAt: string;
}

export interface TransactionsResponse {
  items: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SummaryResponse {
  transactionCount: number;
  totalAmount: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
const API_KEY = process.env.NEXT_PUBLIC_DASHBOARD_API_KEY ?? '';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'x-api-key': API_KEY },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Request to ${path} failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export function fetchTransactions(params: {
  page?: number;
  pageSize?: number;
} = {}): Promise<TransactionsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  const qs = query.toString();
  return apiFetch<TransactionsResponse>(`/transactions${qs ? `?${qs}` : ''}`);
}

export function fetchSummary(): Promise<SummaryResponse> {
  return apiFetch<SummaryResponse>('/transactions/summary');
}
