# Pesawazi

*Pesa* (money) + *wazi* (open) — a live transaction dashboard for a Till or
Paybill business, with no dependency on reading M-Pesa SMS.

Single-tenant MVP for piloting with one business before any multi-tenant
work happens.

pesawazi/
├── backend/ NestJS + TypeORM + Postgres — Daraja C2B integration
└── frontend/ Next.js + Tailwind — live ledger dashboard
## Quick start

## Development environment

Developed in WSL2 (Ubuntu) on Windows. If the project directory is under
a Windows-mounted path (e.g. `/mnt/c/...`), expect slower `npm install`
and file-watch performance, and occasional filesystem boundary quirks
with tools that rely on inotify. Keeping the project under the native
WSL filesystem (e.g. `~/Project/pesawazi`) avoids most of this — this repo
already lives there rather than under `/mnt/c`.

**1. Backend** — see `backend/README.md` for full detail.

```bash
cd backend
npm install
cp .env.example .env   # fill in Daraja credentials + shortcode
npm run migration:run
npm run start:dev
```

Register the Confirmation/Validation URLs once (needs a public HTTPS URL,
e.g. via ngrok in local dev):

```bash
curl -H "x-api-key: $DASHBOARD_API_KEY" https://your-url/callbacks/c2b/register
```

**2. Frontend** — see `frontend/README.md` for full detail.

```bash
cd frontend
npm install
cp .env.local.example .env.local   # point at the backend + matching API key
npm run dev
```

## Live updates

The dashboard doesn't poll. The backend's `TransactionsGateway`
(`@nestjs/websockets` + Socket.IO) emits a `transaction:new` event the
moment a Confirmation callback is saved to the database, and the frontend
holds an open Socket.IO connection that appends new rows and updates the
summary totals instantly. A 60-second REST fallback re-sync exists as a
safety net in case the socket briefly disconnects — it's not the primary
delivery path.

## Exporting the ledger

A "Download PDF" button on the dashboard generates a branded PDF (via
`jspdf` + `jspdf-autotable`) of the currently loaded transactions. It only
covers the most recent 25 rows currently on screen — there's no
full-history export endpoint yet.

## What this validates

Whether a Till/Paybill business owner actually wants a live web dashboard
over reading M-Pesa SMS notifications directly. If the pilot lands, the
multi-tenant patterns already built for ElimuPay (encrypted per-tenant
Daraja credentials, tenant onboarding, multi-tenant webhook routing) are
the next step — this MVP intentionally skips all of that.

## Known limits of this MVP

- One shortcode, one business, one `.env` — no multi-tenancy yet
- A single shared API key stands in for real auth
- Read-only: observes transactions, doesn't initiate STK Push
- The API key currently ships in the frontend's client bundle — see the
  security note in `frontend/README.md` before using this with a real
  business's live transactions
- PDF/CSV export only covers the 25 most recently loaded transactions,
  not the full historical ledger
- Safaricom sends `MSISDN` as a hashed 64-character string in production
  C2B callbacks, not a plain phone number — the `msisdn` column is
  `varchar(100)` to accommodate this, and the real phone number isn't
  recoverable from this field alone without a third-party unhashing
  service
- Till (Buy Goods) payments don't populate `BillRefNumber` — that field
  only exists for Paybill transactions where the customer enters an
  account number