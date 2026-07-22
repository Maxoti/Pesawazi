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

  async summary() {
    const raw = await this.transactionsRepo
      .createQueryBuilder('t')
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(t.transAmount), 0)', 'total')
      .getRawOne<{ count: string; total: string }>();

    return {
      transactionCount: Number(raw?.count ?? 0),
      totalAmount: Number(raw?.total ?? 0),
    };
  }
}