export interface DarajaConfig {
  consumerKey: string;
  consumerSecret: string;
  env: 'sandbox' | 'production';
  shortcode: string;
  shortcodeType: 'paybill' | 'till';
  callbackBaseUrl: string;
  passkey?: string;
}

export interface AppConfig {
  port: number;
  databaseUrl: string;
  dashboardApiKey: string;
  daraja: DarajaConfig;
}

export default (): AppConfig => ({
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  databaseUrl: process.env.DATABASE_URL ?? '',
  dashboardApiKey: process.env.DASHBOARD_API_KEY ?? '',
  daraja: {
    consumerKey: process.env.DARAJA_CONSUMER_KEY ?? '',
    consumerSecret: process.env.DARAJA_CONSUMER_SECRET ?? '',
    env: (process.env.DARAJA_ENV as 'sandbox' | 'production') ?? 'sandbox',
    shortcode: process.env.DARAJA_SHORTCODE ?? '',
    shortcodeType: (process.env.DARAJA_SHORTCODE_TYPE as 'paybill' | 'till') ?? 'paybill',
    callbackBaseUrl: process.env.DARAJA_CALLBACK_BASE_URL ?? '',
    passkey: process.env.DARAJA_PASSKEY,
  },
});
