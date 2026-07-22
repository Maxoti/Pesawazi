import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * One row per Daraja C2B Confirmation callback.
 * TransID is Safaricom's unique receipt number for the transaction —
 * used as the natural dedupe key since Safaricom may retry the callback
 * if it doesn't get a fast 200 response.
 */
@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'trans_id', type: 'varchar', length: 32 })
  transId!: string;

  @Column({ name: 'trans_time', type: 'varchar', length: 20 })
  transTime!: string; // raw Daraja format: YYYYMMDDHHmmss

  @Column({ name: 'transaction_type', type: 'varchar', length: 40 })
  transactionType!: string; // e.g. Pay Bill, Buy Goods

  @Column({ name: 'trans_amount', type: 'decimal', precision: 12, scale: 2 })
  transAmount!: string;

  @Column({ name: 'business_short_code', type: 'varchar', length: 20 })
  businessShortCode!: string;

  @Column({ name: 'bill_ref_number', type: 'varchar', length: 100, nullable: true })
  billRefNumber!: string | null;

  @Column({ name: 'invoice_number', type: 'varchar', length: 100, nullable: true })
  invoiceNumber!: string | null;

  @Column({ name: 'org_account_balance', type: 'varchar', length: 40, nullable: true })
  orgAccountBalance!: string | null;

  @Column({ name: 'third_party_trans_id', type: 'varchar', length: 100, nullable: true })
  thirdPartyTransId!: string | null;

 @Column({ name: 'msisdn', type: 'varchar', length: 100 })
msisdn!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName!: string | null;

  @Column({ name: 'middle_name', type: 'varchar', length: 100, nullable: true })
  middleName!: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName!: string | null;

  @Column({ name: 'raw_payload', type: 'jsonb' })
  rawPayload!: Record<string, unknown>;

  @CreateDateColumn({ name: 'received_at' })
  receivedAt!: Date;
}
