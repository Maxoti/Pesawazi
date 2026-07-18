import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTransactions1721260800000 implements MigrationInterface {
  name = 'InitTransactions1721260800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "trans_id" varchar(32) NOT NULL,
        "trans_time" varchar(20) NOT NULL,
        "transaction_type" varchar(40) NOT NULL,
        "trans_amount" numeric(12,2) NOT NULL,
        "business_short_code" varchar(20) NOT NULL,
        "bill_ref_number" varchar(100),
        "invoice_number" varchar(100),
        "org_account_balance" varchar(40),
        "third_party_trans_id" varchar(100),
        "msisdn" varchar(20) NOT NULL,
        "first_name" varchar(100),
        "middle_name" varchar(100),
        "last_name" varchar(100),
        "raw_payload" jsonb NOT NULL,
        "received_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transactions_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_transactions_trans_id" ON "transactions" ("trans_id")
    `);

    // Supports the dashboard's default "most recent first" listing
    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_received_at" ON "transactions" ("received_at" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_transactions_received_at"`);
    await queryRunner.query(`DROP INDEX "IDX_transactions_trans_id"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
  }
}
