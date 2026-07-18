# pesawazi-frontend

Minimal Next.js dashboard for the Pesawazi MVP — a live ledger view of Till
or Paybill transactions, polling the backend every 8 seconds.

## Setup

```bash
npm install
cp .env.local.example .env.local
# point NEXT_PUBLIC_API_BASE_URL at your backend, matching DASHBOARD_API_KEY
npm run dev
```

Open http://localhost:3001 (or whatever port Next picks if 3000 is taken by
the backend).

## Design

- **Signature idea**: transactions render as a monospace ledger feed, not
  generic stat tiles — new rows ease in and briefly highlight in teal as
  they arrive, making the "no SMS needed, it's just here" value concrete.
- **Palette**: paper `#F5F6F2` / ink `#16211D` / teal `#0B6E4F` (a deliberate
  step away from Safaricom's exact green) / amber `#C98A2C` for alerts.
- **Type**: Space Grotesk for the wordmark and headings, Inter for body
  copy, IBM Plex Mono for every money/phone/reference value so the numbers
  read like a ledger, not a webpage.

##  Before piloting with real money

`NEXT_PUBLIC_DASHBOARD_API_KEY` is bundled into the client-side JS bundle by
Next.js — anyone who opens dev tools on the deployed dashboard can read it.
That's an acceptable shortcut for local development, but **not** for a
pilot business owner viewing this from their phone on the open internet.

Before going live, move the API key server-side:

1. Add a Next.js API route (e.g. `src/app/api/transactions/route.ts`) that
   holds `DASHBOARD_API_KEY` as a private (non-`NEXT_PUBLIC_`) env var and
   forwards requests to the backend.
2. Point `src/lib/api.ts` at that local route instead of the backend
   directly.
3. Optionally put the dashboard itself behind a simple password/login,
   since it displays real customer phone numbers and payment amounts.
