import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DarajaConfig } from '../config/configuration';

interface DarajaTokenResponse {
  access_token: string;
  expires_in: string;
}

export interface RegisterUrlResponse {
  OriginatorConversationID?: string;
  ConversationID?: string;
  ResponseDescription?: string;
  [key: string]: unknown;
}

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);
  private cachedToken: { value: string; expiresAt: number } | null = null;

  constructor(private readonly configService: ConfigService) {}

  private get daraja(): DarajaConfig {
    return this.configService.get<DarajaConfig>('daraja')!;
  }

  private get baseUrl(): string {
    return this.daraja.env === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  /**
   * Fetches (and caches) an OAuth access token. Daraja tokens are valid for
   * ~1 hour; we refresh a little early to avoid edge-of-expiry failures.
   */
  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAt > now) {
      return this.cachedToken.value;
    }

    const { consumerKey, consumerSecret } = this.daraja;
    if (!consumerKey || !consumerSecret) {
      throw new HttpException(
        'Daraja consumer key/secret are not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
      const response = await axios.get<DarajaTokenResponse>(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        { headers: { Authorization: `Basic ${credentials}` } },
      );

      const expiresInMs = (parseInt(response.data.expires_in, 10) || 3599) * 1000;
      this.cachedToken = {
        value: response.data.access_token,
        // Refresh 60s before actual expiry
        expiresAt: now + expiresInMs - 60_000,
      };

      return this.cachedToken.value;
    } catch (error) {
  const axiosError = error as import('axios').AxiosError;

  this.logger.error('Failed to fetch Daraja access token');
  this.logger.error(`Status: ${axiosError.response?.status ?? 'No status'}`);
  this.logger.error(`URL: ${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`);
  this.logger.error(`Response: ${JSON.stringify(axiosError.response?.data ?? null)}`);
  this.logger.error(`Message: ${axiosError.message}`);

  throw new HttpException(
    'Failed to authenticate with Daraja',
    HttpStatus.BAD_GATEWAY,
  );
}
  }

  /**
   * Registers the Confirmation and Validation URLs against the configured
   * shortcode. Only needs to be called once per shortcode — re-registering
   * simply overwrites the previous URLs. Must be run against a shortcode
   * you control (or one you're authorized to configure).
   */
  async registerC2BUrls(): Promise<RegisterUrlResponse> {
    const token = await this.getAccessToken();
    const { shortcode, callbackBaseUrl } = this.daraja;

    if (!shortcode || !callbackBaseUrl) {
      throw new HttpException(
        'DARAJA_SHORTCODE and DARAJA_CALLBACK_BASE_URL must be set before registering URLs',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const response = await axios.post<RegisterUrlResponse>(
        `${this.baseUrl}/mpesa/c2b/v2/registerurl`,
        {
          ShortCode: shortcode,
          ResponseType: 'Completed',
          ConfirmationURL: `${callbackBaseUrl}/callbacks/c2b/confirmation`,
          ValidationURL: `${callbackBaseUrl}/callbacks/c2b/validation`,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      this.logger.log(`Registered C2B URLs for shortcode ${shortcode}`);
      return response.data;
    } catch (error) {
      const axiosError = error as import('axios').AxiosError;
      this.logger.error(
        'Failed to register C2B URLs',
        JSON.stringify(axiosError.response?.data ?? axiosError.message),
      );
      throw new HttpException('Failed to register C2B URLs with Daraja', HttpStatus.BAD_GATEWAY);
    }
  }

  get shortcodeType(): 'paybill' | 'till' {
    return this.daraja.shortcodeType;
  }
}