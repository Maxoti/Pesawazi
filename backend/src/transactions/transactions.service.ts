import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { TransactionsGateway } from './transactions.gateway';

export interface RecordTransactionInput {
  transId: string;
  transTime: string;
  transactionType: string;
  transAmount: string;
  businessShortCode: string;
  billRefNumber?: string | null;
  invoiceNumber?: string | null;
  orgAccountBalance?: string | null;
  thirdPartyTransId?: string | null;
  msisdn: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  rawPayload: Record<string, unknown>;
}

export interface ListTransactionsQuery {
  page?: number;
  pageSize?: number;
  from?: string; // ISO date
  to?: string; // ISO date
  msisdn?: string;
}

export type SummaryRange = 'today' | 'week' | 'all';

export interface SummaryQuery {
  range?: SummaryRange;
}

// Kenya is UTC+3 year-round (no DST), so this can be a fixed offset.
const NAIROBI_OFFSET_MS = 3 * 60 * 60 * 1000;

/**
 * Returns the UTC instant corresponding to local midnight in Nairobi,
 * `daysAgo` days before today. e.g. daysAgo=0 -> start of today (Nairobi),
 * daysAgo=6 -> start of the day 6 days ago (Nairobi) — useful for a
 * rolling 7-day "this week" window.
 */
function nairobiMidnightUtc(daysAgo: number): Date {
  const nowNairobi = new Date(Date.now() + NAIROBI_OFFSET_MS);
  const y = nowNairobi.getUTCFullYear();
  const m = nowNairobi.getUTCMonth();
  const d = nowNairobi.getUTCDate();

  // Midnight in Nairobi, `daysAgo` days back, expressed as a UTC instant.
  return new Date(Date.UTC(y, m, d - daysAgo, 0, 0, 0) - NAIROBI_OFFSET_MS);
}

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepo: Repository<Transaction>,
    private readonly transactionsGateway: TransactionsGateway,
  ) {}

  /**
   * Idempotent insert keyed on Daraja's TransID. Safaricom retries the
   * Confirmation callback if it doesn't get a fast 200 OK, so this must
   * never throw on a duplicate — it should just no-op.
   */
  async recordFromCallback(input: RecordTransactionInput): Promise<{ created: boolean }> {
    const existing = await this.transactionsRepo.findOne({
      where: { transId: input.transId },
    });

    if (existing) {
      this.logger.warn(`Duplicate callback for TransID ${input.transId}, ignoring`);
      return { created: false };
    }

    const entity = this.transactionsRepo.create({
      transId: input.transId,
      transTime: input.transTime,
      transactionType: input.transactionType,
      transAmount: input.transAmount,
      businessShortCode: input.businessShortCode,
      billRefNumber: input.billRefNumber ?? null,
      invoiceNumber: input.invoiceNumber ?? null,
      orgAccountBalance: input.orgAccountBalance ?? null,
      thirdPartyTransId: input.thirdPartyTransId ?? null,
      msisdn: input.msisdn,
      firstName: input.firstName ?? null,
      middleName: input.middleName ?? null,
      lastName: input.lastName ?? null,
      rawPayload: input.rawPayload,
    });

    const saved = await this.transactionsRepo.save(entity);

    // Push to any connected dashboards immediately — no need to wait for polling.
    this.transactionsGateway.emitNewTransaction(saved);

    return { created: true };
  }

  async list(query: ListTransactionsQuery) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSize = query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 100) : 25;

    const qb = this.transactionsRepo
      .createQueryBuilder('t')
      .orderBy('t.receivedAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (query.from) {
      qb.andWhere('t.receivedAt >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('t.receivedAt <= :to', { to: query.to });
    }
    if (query.msisdn) {
      qb.andWhere('t.msisdn = :msisdn', { msisdn: query.msisdn });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize };
  }

  /**
   * Totals for a given window, computed in Nairobi local time so "today"
   * matches what a till owner actually means when they say "today's
   * takings" — not a UTC day, which would cut off at 3am local time.
   */
  async summary(query: SummaryQuery = {}) {
    const range = query.range ?? 'all';

    const qb = this.transactionsRepo
      .createQueryBuilder('t')
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(t.transAmount), 0)', 'total');

    if (range === 'today') {
      qb.where('t.receivedAt >= :from', { from: nairobiMidnightUtc(0) });
    } else if (range === 'week') {
      // Rolling 7-day window (today + previous 6 days), not calendar week —
      // simpler to reason about and avoids Monday-vs-Sunday debates.
      qb.where('t.receivedAt >= :from', { from: nairobiMidnightUtc(6) });
    }
    // range === 'all' -> no filter

    const raw = await qb.getRawOne<{ count: string; total: string }>();

    return {
      range,
      transactionCount: Number(raw?.count ?? 0),
      totalAmount: Number(raw?.total ?? 0),
    };
  }
}