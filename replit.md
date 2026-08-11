# CertifyPath

## Overview
CertifyPath is a course/certification marketplace front end — short, focused courses with an
option to buy the certification exam alone. Imported from Lovable (a GitHub repo synced with
lovable.dev). It now has a real backend: orders, certificates, and exam attempts are persisted
in Postgres via Drizzle ORM, called through TanStack Start server functions.

## Tech stack
- **Framework**: TanStack Start (SSR) on Vite, React 19
- **Routing**: TanStack Router (file-based routes in `src/routes`, generated `src/routeTree.gen.ts`)
- **Styling/UI**: Tailwind CSS v4 + shadcn/radix-ui components (`src/components`)
- **Data/forms**: TanStack Query, react-hook-form, zod
- **Backend**: Supabase PostgreSQL, accessed via Drizzle ORM (`pg`/node-postgres).
  Schema lives in `src/server/schema.ts`; DB client in `src/server/db.ts` (both server-only —
  never imported by client code). Callable server functions (`createServerFn`) live in
  `src/actions/*.ts` — kept out of `src/server/` on purpose, see note below.
  Tables: `orders`, `certificates` (unique validation `code`, DB-issued), `exam_attempts`,
  `pending_checkouts`. Schema changes: edit `src/server/schema.ts` then run `bunx drizzle-kit push`.
  **Required env var**: `DATABASE_URL` → Supabase connection string (Settings → Database →
  Connection string → Transaction pooler, port 6543).
- **Build config**: `@lovable.dev/vite-tanstack-config` wraps Vite/Tailwind/TanStack Start plugins —
  don't add those plugins manually, it breaks with duplicates (see comment in `vite.config.ts`).
  It also enables TanStack Start's `importProtection`, blocking any client-bundle import whose
  resolved path matches `**/server/**` (glob matches any path segment literally named `server`,
  regardless of nesting) — this is why server-callable files (`createServerFn` wrappers) live in
  `src/actions/`, not `src/server/functions/`. Keep raw DB/schema/credential code strictly inside
  `src/server/` and callable server functions in `src/actions/`.
- **Payments**: Whop for non-Nigerian buyers and Paystack for Nigerian buyers.
  Whop calls go through `src/server/whopClient.ts`; Paystack calls go through
  `src/server/paystackClient.ts`.
  **Required Vercel env vars**: `WHOP_API_KEY`, `WHOP_COMPANY_ID`, and
  `PAYSTACK_SECRET_KEY`. Paystack uses the server-only secret key and never
  exposes it to the browser. Whop plan IDs are mapped in
  `src/data/whop-plans.ts`; Paystack converts catalog USD prices to NGN at the
  rate in `src/data/payment.ts` and sends the amount in kobo.
- **Package manager**: bun (`bun.lock`, `bunfig.toml`)

## Running on Replit
- Workflow "Start application" runs `bun run dev` (Vite dev server) and is bound to `0.0.0.0:5000`.
- The Lovable Vite config defaults to `host: "::", port: 8080` for its own hosted sandbox, which
  doesn't work in Replit's container (no IPv6 support). `vite.config.ts` overrides this via the
  `vite: { server: { host: "0.0.0.0", port: 5000, strictPort: true, allowedHosts: true } }` escape
  hatch the config exposes — needed for the Replit preview proxy (iframe, different origin).
- This project is connected to Lovable — avoid rewriting published git history (force-push,
  rebase/amend of pushed commits) since it resyncs to the Lovable editor (see `AGENTS.md`).

## Checkout flow
Real hosted checkout — redirect-based, payment verified server-side before issuing anything.

1. User fills in name + email on `/checkout/$slug?plan=...`
2. "Pay" button calls `createCheckout` (server fn in `src/actions/checkout.ts`).
   The country selector sends `NG` for Nigeria and another ISO country code otherwise.
   - Nigeria initializes Paystack `transaction/initialize` in NGN/kobo.
   - Other countries look up the Whop plan ID and create a Whop checkout configuration.
   - Both paths create a `pending_checkouts` record with a unique opaque token.
3. Client redirects to the selected provider's hosted checkout page.
4. The provider redirects to `https://certifypath.online/checkout/return?token=<token>`.
5. `finalizeCheckout` verifies the payment server-side, checking Paystack success,
   amount, and currency for Nigeria, or Whop payments/memberships for other countries.
   It then creates the order and (for cert/bundle) mints the certificate.
6. `/checkout/return` shows success + certificate code, saves the certificate URL in
   browser storage, and offers the styled browser print dialog where the buyer can
   choose “Save as PDF”.

Idempotent: if user refreshes the return page, `finalizeCheckout` detects `status=confirmed` and
returns the cached result without double-charging or creating duplicate records.

Certificate URLs always use the canonical `https://certifypath.online` origin.

## User preferences
None recorded yet.
