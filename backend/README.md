# PesaWazi (backend)

"Wazi" — clear, transparent. Single-tenant MVP backend for a live M-Pesa
transaction dashboard. Built for **one Till or Paybill business at a time**
— this is the pilot version before any multi-tenant work happens.

Receives Daraja C2B Confirmation callbacks in real time and stores them in
Postgres, so a frontend dashboard can show transactions without ever touching
SMS.

## Stack

- NestJS + TypeScript
- TypeORM + PostgreSQL (Neon)
- Daraja C2B API (OAuth + Register URL + Confirmation/Validation)

## Setup

```bash
npm install
cp .env.example .env
# fill in .env — see field-by-field notes below
npm run start:dev
```

## Before you touch `.env`: confirm Paybill vs Till

Ask the business owner directly, don't assume:

- **Paybill** → transactions arrive as `CustomerPayBillOnline`, and customers
  usually enter an account number (`BillRefNumber`).
- **Till (Buy Goods)** → transactions arrive as `CustomerBuyGoodsOnline`, no
  account number involved.

Set `DARAJA_SHORTCODE_TYPE` accordingly. Mixing this up is a common source of
confusion later (e.g. expecting `BillRefNumber` on a till that will never
send one).

## Registering the Confirmation/Validation URLs

Daraja only lets **one Confirmation URL be registered per shortcode at a
time**, and the shortcode must be under the business's control (or you must
be authorized to configure it via their Daraja app).

1. Deploy the backend somewhere with a public HTTPS URL (Render, Railway,
   etc. — for local dev, use `ngrok http 3000` and put that URL in
   `DARAJA_CALLBACK_BASE_URL`).
2. Start the server.
3. Hit the registration endpoint once:

   ```bash
   curl -H "x-api-key: $DASHBOARD_API_KEY" https://your-url/mpesa/c2b/register
   ```

4. Safaricom will now POST every completed transaction on that shortcode to
   `POST /mpesa/c2b/confirmation`.

Re-run step 3 any time `DARAJA_CALLBACK_BASE_URL` changes (e.g. a new ngrok
URL) — it simply overwrites the previous registration.

## API

All endpoints below require `x-api-key: <DASHBOARD_API_KEY>` **except** the
two Daraja callback endpoints, which Safaricom calls directly and which
cannot send a custom header.

| Method | Path                     | Purpose                                      |
|--------|--------------------------|-----------------------------------------------|
| GET    | `/transactions`          | Paginated transaction list (`page`, `pageSize`, `from`, `to`, `msisdn`) |
| GET    | `/transactions/summary`  | Total count + total amount                    |
| GET    | `/mpesa/c2b/register`    | (Re)register Confirmation/Validation URLs      |
| POST   | `/mpesa/c2b/confirmation`| Daraja callback — do not call manually         |
| POST   | `/mpesa/c2b/validation`  | Daraja callback — do not call manually         |

## Database migrations

Schema changes go through TypeORM migrations, not `synchronize`, since this
is meant to hold real transaction data during the pilot.

```bash
# apply all pending migrations (also runs automatically on app boot)
npm run migration:run

# after changing an entity, generate a new migration from the diff
npm run migration:generate -- src/migrations/SomeDescriptiveName

# undo the most recent migration
npm run migration:revert
```

The initial migration (`src/migrations/*-InitTransactions.ts`) creates the
`transactions` table matching `transaction.entity.ts`. `migrationsRun: true`
in `app.module.ts` means pending migrations apply automatically each time
the app starts — fine for a single pilot deploy; revisit before multiple
environments are in play.

## What's deliberately left out of this MVP

- Multi-tenancy (one shortcode's credentials live in one `.env`)
- Real user auth (a single shared API key is enough for one pilot business)
- STK Push / payment initiation (this is a *read-only* dashboard — it only
  observes transactions that happen via the till/paybill itself)

These are the same gaps you'd close by porting over the multi-tenant patterns
already built for ElimuPay, once the pilot validates that a business owner
actually wants this over reading their M-PESA SMS.
