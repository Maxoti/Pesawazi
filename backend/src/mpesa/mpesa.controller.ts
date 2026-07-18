import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { C2BCallbackDto } from './dto/c2b-callback.dto';
import { MpesaService, RegisterUrlResponse } from './mpesa.service';
import { TransactionsService } from '../transactions/transactions.service';

@Controller('mpesa')
export class MpesaController {
  constructor(
    private readonly mpesaService: MpesaService,
    private readonly transactionsService: TransactionsService,
  ) {}

  /**
   * Safaricom calls this before completing the transaction. Since we're not
   * doing any accept/reject logic for the MVP (that requires a special
   * Safaricom-approved use case), we always accept.
   * IMPORTANT: must respond with HTTP 200 and this exact body shape, fast,
   * or Safaricom will retry / eventually stop calling it.
   */
  @Post('c2b/validation')
  @HttpCode(200)
  validation(@Body() _payload: C2BCallbackDto) {
    return { ResultCode: 0, ResultDesc: 'Accepted' };
  }

  /**
   * Safaricom calls this once the transaction has actually completed.
   * This is the source of truth we persist to the DB.
   */
  @Post('c2b/confirmation')
  @HttpCode(200)
  async confirmation(@Body() payload: C2BCallbackDto) {
    await this.transactionsService.recordFromCallback({
      transId: payload.TransID,
      transTime: payload.TransTime,
      transactionType: payload.TransactionType,
      transAmount: payload.TransAmount,
      businessShortCode: payload.BusinessShortCode,
      billRefNumber: payload.BillRefNumber ?? null,
      invoiceNumber: payload.InvoiceNumber ?? null,
      orgAccountBalance: payload.OrgAccountBalance ?? null,
      thirdPartyTransId: payload.ThirdPartyTransID ?? null,
      msisdn: payload.MSISDN,
      firstName: payload.FirstName ?? null,
      middleName: payload.MiddleName ?? null,
      lastName: payload.LastName ?? null,
      rawPayload: payload as unknown as Record<string, unknown>,
    });

    // Safaricom just wants a 200 with this body — it doesn't do anything
    // with ResultCode/ResultDesc at the confirmation stage, but the shape
    // is expected.
    return { ResultCode: 0, ResultDesc: 'Confirmation received successfully' };
  }

  /**
   * Manual, API-key-protected trigger to (re)register the Confirmation and
   * Validation URLs against the configured shortcode. Run this once after
   * deploying, whenever the callback base URL changes (e.g. new ngrok URL
   * in local dev), or when switching between sandbox and production.
   */
  @Get('c2b/register')
  @UseGuards(ApiKeyGuard)
  async registerUrls() : Promise<RegisterUrlResponse> {
    return this.mpesaService.registerC2BUrls();
  }
}
