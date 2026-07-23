import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { SummaryRange, TransactionsService } from './transactions.service';

const VALID_RANGES: SummaryRange[] = ['today', 'week', 'all'];

@Controller('transactions')
@UseGuards(ApiKeyGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('msisdn') msisdn?: string,
  ) {
    return this.transactionsService.list({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      from,
      to,
      msisdn,
    });
  }

  @Get('summary')
  summary(@Query('range') range?: string) {
    const safeRange: SummaryRange = VALID_RANGES.includes(range as SummaryRange)
      ? (range as SummaryRange)
      : 'all';

    return this.transactionsService.summary({ range: safeRange });
  }
}