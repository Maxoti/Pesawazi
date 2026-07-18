/**
 * Shape of the payload Safaricom POSTs to the Confirmation and Validation
 * URLs for C2B transactions (both Pay Bill and Buy Goods).
 * Field names are exactly as Daraja sends them (PascalCase) — do not rename.
 */
export interface C2BCallbackDto {
  TransactionType: string;
  TransID: string;
  TransTime: string;
  TransAmount: string;
  BusinessShortCode: string;
  BillRefNumber?: string;
  InvoiceNumber?: string;
  OrgAccountBalance?: string;
  ThirdPartyTransID?: string;
  MSISDN: string;
  FirstName?: string;
  MiddleName?: string;
  LastName?: string;
}
