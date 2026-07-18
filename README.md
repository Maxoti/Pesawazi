# Pesawazi

*Pesa* (money) + *wazi* (open) — a live transaction dashboard for a Till or
Paybill business, with no dependency on reading M-Pesa SMS.

Single-tenant MVP for piloting with one business before any multi-tenant
work happens.

```
pesawazi/
├── backend/    NestJS + TypeORM + Postgres — Daraja C2B integration
└── frontend/   Next.js + Tailwind — live ledger dashboard
```

## Quick start

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
curl -H "x-api-key: $DASHBOARD_API_KEY" https://your-url/mpesa/c2b/register
```

**2. Frontend** — see `frontend/README.md` for full detail.

```bash
cd frontend
npm install
cp .env.local.example .env.local   # point at the backend + matching API key
npm run dev
```

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
