# Renter

React website for Pakistani car and bike rental owners. The active backend uses **Supabase Auth, Postgres, and Edge Functions**. Owners manage their fleet, availability, bookings, customers, handovers, returns, and cash/bank-transfer records. Customers use a separate booking page.

## Migration status

**Connected to the live Renter Supabase project `jsuumxbreyopbfscxexy`.** The Postgres migrations and `renter` Edge Function are deployed. The public frontend configuration is saved in ignored `.env.local` and in Sites runtime settings. Real owner login, persistence, customer requests, confirmation, payments, cancellation and sign-out passed live browser/API checks using temporary accounts, which were removed afterward. Email confirmation remains enabled; ordinary account email delivery still requires custom SMTP.

The former D1 source, migrations, and local database are retained for recovery. They are not used by the active Wrangler configuration. Existing records have not been transferred: mapping the previous owner identity to a verified Supabase user must happen before any import. New Supabase accounts start with an empty business, never fictional customers or payments.

## Connect and run locally

Requires Node.js 24+ and npm. Connect the Supabase plugin and select the intended project, or authenticate the CLI locally with `npx supabase login`. Never paste an access token, database password, or service-role key into chat.

After the project is provisioned as described in [docs/supabase-setup.md](docs/supabase-setup.md):

```powershell
npm.cmd install
Copy-Item .env.example .env.local
```

Set these **public** values in `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

```powershell
npm.cmd run dev
```

Open the URL printed by Vite. Create an account, confirm its email, sign in, fill in **Settings**, then add vehicles and customers. The dev server does not manufacture a user identity. Restart it after dependency/configuration changes. Do not open `index.html` directly or use a static file server: React modules need Vite.

Local development uses plain Vite; the Cloudflare Worker integration runs only for production builds. This avoids the Miniflare `fetch failed` error from stale local Worker processes. Vite serves `/api/config` using the same public-key filter as the production Worker.

The built local preview uses `npm.cmd run build` and `npm.cmd run preview`. For this preview, put the public `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in the ignored `.dev.vars`, or supply the Vite public values before building. Hosted configuration comes from Sites runtime environment variables; the website serves only those public values at `/api/config`.

## Private review

`RENTER_PUBLIC_BOOKING_ENABLED=false` is the backend default. A booking page at `/book/<business-id>` requires its owner's Supabase session during private review, including direct Edge Function calls. The hosted site's audience also remains private. A public launch requires enabling customer booking in Supabase and changing the site's audience explicitly.

## Verification

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
npm.cmd run test:e2e
npm.cmd audit
```

The browser suite starts its own Vite server at `http://127.0.0.1:5175` with real Supabase configuration cleared, so contract tests cannot touch your live project. Microsoft Edge is required. `RENTER_TEST_URL` can target an existing test server only if its Supabase environment values are unset; do not point this fixture suite at the real configured app.

Backend tests cover the real command handler, concurrent revision writes, idempotency, price snapshots, deposit separation, customer privacy, owner isolation, token rejection, private review and CORS. PGlite executes the actual Postgres migration and proves row-security and table grants. Browser contract tests use a **test-only** Supabase HTTP fixture plus the real rental handler to exercise signup, reset, sign-out, empty accounts, navigation, booking requests, confirmation/cancellation, keyboard dialogs and mobile layout. Separate live acceptance checks were completed against the connected project; see the setup guide for results and remaining integrations.

## Architecture

- `src/backend.js`: Supabase client, session refresh, Edge Function calls and timeouts.
- `src/Auth.jsx`: account creation, email/password sign-in, password reset and session gates.
- `supabase/functions/renter/index.ts`: deployed Deno entrypoint; verifies owner tokens with Supabase Auth.
- `supabase/functions/_shared/`: authoritative rental rules, request handler and Postgres repository. Root `shared/rental.js` and `server/commands.js` re-export the shared domain code for existing callers.
- `supabase/migrations/`: owner-keyed Postgres table, row security and explicit grants. Browser users can read only their own workspace; all writes go through the validating Edge Function.
- `server/site-worker.js`: website assets and public runtime configuration only. No rental data or authenticated operations live in this Worker.
- `server/worker.js`, `db/`, `drizzle/`: retained prior D1 implementation, inactive.

Each small business is one versioned JSON document in Postgres. A conditional owner/revision update commits changes atomically; stale owner tabs and competing confirmations cannot overwrite each other. This remains bounded to 3,000 bookings / about 1.5 MB; larger fleets and staff roles require normalized tables.

Prices are whole PKR and rentals use started 24-hour periods in Asia/Karachi. Rental payments and refundable security have separate balances. Quotes preserve the rates agreed at booking. Customer requests require owner confirmation and reserve no vehicle by themselves.

## Operating limits

Payments record actual cash/bank-transfer activity entered by an owner. Online charging, automatic refunds, JazzCash/Easypaisa integration, SMS/WhatsApp, protected document uploads and vehicle photo uploads are not implemented. Auth email delivery for ordinary users needs a configured SMTP service. Supabase sessions persist through its client SDK; private rental records, CNIC scans, and card details are not stored in browser storage.

The customer endpoint has body limits, a honeypot and pending-request/phone limits. A public launch should also configure anti-abuse protection and monitor traffic. Test backups/restoration and replace the default rental policy with the business's actual terms before commercial operation.

Original business research: [docs/rental-business-research.md](docs/rental-business-research.md). Visual decisions: [DESIGN.md](DESIGN.md).
