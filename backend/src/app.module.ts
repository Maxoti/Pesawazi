import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { Transaction } from './transactions/transaction.entity';
import { TransactionsModule } from './transactions/transactions.module';
import { MpesaModule } from './mpesa/mpesa.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('databaseUrl'),
        entities: [Transaction],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: true, // apply pending migrations automatically on boot
        synchronize: false, // schema changes go through migrations from here on
        ssl: { rejectUnauthorized: false }, // required for Neon
      }),
    }),
    TransactionsModule,
    MpesaModule,],
    controllers: [AppController],
})
export class AppModule {}
