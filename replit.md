# CertPath

## Overview
CertPath is a course/certification marketplace front end — short, focused courses with an
option to buy the certification exam alone. Imported from Lovable (a GitHub repo synced with
lovable.dev). It now has a real backend: orders, certificates, and exam attempts are persisted
in Postgres via Drizzle ORM, called through TanStack Start server functions.

## Tech stack
- **Framework**: TanStack Start (SSR) on Vite, React 19
- **Routing**: TanStack Router (file-based routes in `src/routes`, generated `src/routeTree.gen.ts`)
- **Styling/UI**: Tailwind CSS v4 + shadcn/radix-ui components (`src/components`)
- **Data/forms**: TanStack Query, react-hook-form, zod
- **Backend**: Replit-provisioned PostgreSQL, accessed via Drizzle ORM (`pg`/node-postgres).
  Schema lives in `src/server/schema.ts`; DB client in `src/server/db.ts` (both server-only —
  never imported by client code). Callable server functions (`createServerFn`) live in
  `src/actions/*.ts` — kept out of `src/server/` on purpose, see note below.
  Tables: `orders`, `certificates` (unique validation `code`, DB-issued), `exam_attempts`.
  Schema changes: edit `src/server/schema.ts` then run `bunx drizzle-kit push`.
- **Build config**: `@lovable.dev/vite-tanstack-config` wraps Vite/Tailwind/TanStack Start plugins —
  don't add those plugins manually, it breaks with duplicates (see comment in `vite.config.ts`).
  It also enables TanStack Start's `importProtection`, blocking any client-bundle import whose
  resolved path matches `**/server/**` (glob matches any path segment literally named `server`,
  regardless of nesting) — this is why server-callable files (`createServerFn` wrappers) live in
  `src/actions/`, not `src/server/functions/`. Keep raw DB/schema/credential code strictly inside
  `src/server/` and callable server functions in `src/actions/`.
- **Payments**: Whop — connected via Replit Integration (connector `whop`). Company ID stored as
  `WHOP_COMPANY_ID` env var. API calls go through `src/server/whopClient.ts` (proxy-based, no
  hardcoded API key). Whop plan IDs are mapped in `src/data/whop-plans.ts` by price point.
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
Real Whop hosted checkout — redirect-based, payment verified server-side before issuing anything.

1. User fills in name + email on `/checkout/$slug?plan=...`
2. "Pay" button calls `createWhopCheckout` (server fn in `src/actions/checkout.ts`)
   - Looks up the Whop plan ID via `getWhopPlanId(plan, price)` from `src/data/whop-plans.ts`
   - Creates a `pending_checkouts` DB record with a unique opaque token
   - POSTs to Whop API → `api/v1/checkout_configurations` → gets `purchase_url`
   - Returns `purchaseUrl` to the client
3. Client redirects to Whop's hosted checkout page (`purchase_url`)
4. User pays on Whop → Whop redirects to `/checkout/return?token=<token>`
5. `finalizeCheckout` (server fn) verifies the payment via Whop's payments API, then creates the
   order record and (for cert/bundle) mints the certificate. Marks `pending_checkouts` confirmed.
6. `/checkout/return` (`src/routes/checkout.return.tsx`) shows success + certificate code.

Idempotent: if user refreshes the return page, `finalizeCheckout` detects `status=confirmed` and
returns the cached result without double-charging or creating duplicate records.

## User preferences
None recorded yet.
