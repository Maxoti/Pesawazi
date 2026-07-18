import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Transaction } from './transactions/transaction.entity';

/**
 * Used only by the `typeorm` CLI (via package.json scripts) to generate and
 * run migrations. The NestJS app itself gets its connection from
 * app.module.ts / ConfigService — this file is not imported at runtime.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Transaction],
  migrations: ['src/migrations/*.ts'],
  ssl: { rejectUnauthorized: false }, // required for Neon
});
