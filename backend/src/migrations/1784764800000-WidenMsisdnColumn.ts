import { MigrationInterface, QueryRunner } from 'typeorm';

export class WidenMsisdnColumn1784764800000 implements MigrationInterface {
  name = 'WidenMsisdnColumn1784764800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "transactions" ALTER COLUMN "msisdn" TYPE varchar(100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "transactions" ALTER COLUMN "msisdn" TYPE varchar(20)
    `);
  }
}