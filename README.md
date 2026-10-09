# Renter

Renter is a React application for Pakistani car and motorcycle rental owners, with a customer booking page, a Cloudflare Worker API, and persistent D1 database storage. The first hosted release is private for review.

## Run locally

Requires Node.js 24+ and npm.

```powershell
npm.cmd install
npm.cmd run db:migrate
npm.cmd run dev
```

Open the local URL printed by Vite and choose **Sign in to your workspace**. The development server supplies a clearly scoped local test identity on loopback only. This is not a production authentication system. Hosted owner sign-in is provided by Sites / ChatGPT, and the backend scopes each workspace to its authenticated owner ID.

The first visit creates a fictional sample workspace. Use **Set up your business** to discard the sample records and start an empty business before entering real customer information. Saving settings does not silently remove the sample label. Local preview records and hosted records live in separate databases.

## Implemented workflows

- Owner dashboard with live receipts, booking requests, current fleet state, today’s pickups/returns, overdue tasks, and recent activity.
- Add/edit cars and bikes, daily rental rates, refundable security, mileage policies, city, specifications, and customer-facing descriptions. Pause listings without deleting booking history.
- Customer booking page at `/book/<business-id>` with type/city filters, date-based availability, sorting, Pakistan local times, rental quote, owner policies, and request submission.
- Requested → Confirmed → Active → Completed, plus cancellation. Customer requests require owner confirmation and do not reserve inventory themselves.
- Atomic reservation updates with conflict checks, preparation buffers, dated maintenance blocks, extension checks, and stale-tab protection.
- Handover checklist for identity/licence inspection, agreement acceptance, fuel, odometer and condition; return rejects a decreasing odometer. Chauffeur service uses an identity check without implying a customer driving licence is necessary.
- Separate manual rental payments, security deposits, rental refunds, and deposit refunds. Security never contributes to rental receipts or pays off a rental balance.
- Customer directory, booking/payment CSV exports, and a printable rental summary. CSV cells are escaped and protected against spreadsheet formula injection.
- Responsive navigation, keyboard dialog focus, Escape dismissal, reduced motion, accessible labels, and business settings.

## Commands and verification

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
npm.cmd run test:e2e
npm.cmd audit
```

The browser suite needs the local dev server running and Microsoft Edge installed; change the Playwright browser channel if using another installed Chromium browser. Tests create fictional browser-test requests in the sample local workspace and cancel them after the flow.

Twenty backend tests cover the domain rules and actual SQLite-backed API handler: availability, cancellation, maintenance, extensions, pricing snapshots, deposit separation, refunds, idempotency, owner isolation, public data protection, request submission, concurrency and stale updates. Three browser tests cover navigation/search, the request-confirm-cancel flow, dialog keyboard behavior and mobile overflow. Browser screenshots are written to ignored `outputs/`.

`npm.cmd run preview` runs the built Worker locally. It does not emulate hosted Sites sign-in routes; use the development server for interactive local review. The hosted release receives identity from Sites, while local production preview must be tested with explicit test identity headers on loopback only.

## Architecture

- `src/`: React screens, dialogs, responsive styles, and original representative vehicle illustrations.
- `shared/rental.js`: quote, date, availability and ledger helpers. Dates use `Asia/Karachi`; instants are stored as ISO timestamps. Prices are integer whole PKR; fractional-rupee pricing is not supported.
- `server/commands.js`: authoritative validation and rental transitions. Customer writes can create requests only.
- `server/worker.js`: owner-scoped API, public storefront API, request size/origin checks, and D1 persistence.
- `db/schema.ts`, `drizzle/`: database schema and generated migration. Never edit an applied migration; append a new migration after schema changes.
- `.openai/hosting.json`: Site ID and the `DB` binding. Build retains the Sites integration and outputs `dist/server`, `dist/client`, and migration metadata.

A small-business workspace is stored as one versioned document. Conditional updates check its revision atomically, so two writes cannot silently overwrite each other or both confirm conflicting reservations. This design is deliberately bounded to 3,000 bookings / roughly 1.5 MB per workspace; larger fleets and granular staff roles require normalized tables. The app rejects writes when that limit is reached.

No CNIC/licence copies, card details, or credentials are stored in browser storage. Customer reads omit other customers, private bookings, ledger records, and staff activity. A publicly accessible business identifier reveals only the intended storefront data. Hosted authentication depends on the Sites gateway; do not expose this Worker directly on an untrusted standalone host while trusting caller-supplied identity headers.

## Private release and remaining integrations

The Site stays owner-private as requested, including the customer-page review. Public customer access requires an explicit public launch. An owner can review and submit requests from their private customer page now; external customers cannot access it while the Site is private.

Payments are an operational cash/bank-transfer ledger. No JazzCash/Easypaisa charge, automatic refund, email, SMS, WhatsApp message, or licence-verification API is simulated. Live checkout requires merchant onboarding, server secrets, verified callbacks, and idempotent transaction settlement. Uploaded vehicle photos, protected identity uploads, multi-staff roles, automated messaging, tax configuration, and backup restore testing are not part of this release.

Replace the sample business phone, address, illustrative rates, coverage description, and rental terms with the owner’s actual details before trading. Billing is explicitly based on started 24-hour periods; workshop-day/hourly/monthly rental plans need their own billing rules. Extra fuel/mileage/damage/late-return charges are recorded only as agreed extras, not automatic penalties. The rental summary is not a signed contract or proof of a gateway payment.

## Research and design

The source-cited research is in [docs/rental-business-research.md](docs/rental-business-research.md). It documents local operator practices, car/bike/chauffeur differences, availability and pricing rules, payments, identity handling, product scope, and acceptance scenarios. [DESIGN.md](DESIGN.md) records the visual decisions.
