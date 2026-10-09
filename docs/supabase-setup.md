# Connect Renter to Supabase

## Current status

Renter is connected to Supabase project `jsuumxbreyopbfscxexy` in Singapore. The authenticated CLI applied both migrations and deployed the `renter` Edge Function. Local public configuration is in ignored `.env.local`; hosted public configuration is in Sites. The function preserves `RENTER_PUBLIC_BOOKING_ENABLED=false` and permits only the configured local/hosted origins.

Live checks passed using two temporary confirmed test accounts: password login, separate empty workspaces, saved business/fleet records after a browser reload, customer booking submission, dashboard confirmation, separated deposit/rental balances, stale-write rejection, cancellation and sign-out. Direct anonymous/private storefront access, another owner's access, unapproved origins and direct browser writes were rejected; RLS hid the other owner's row. All test accounts and their workspace records were removed. No old D1 records were imported.

Auth redirects cover local ports 5173/5174 and the private hosted URL. Email confirmation is enabled and passwords require at least 10 characters. Only explicitly declared Auth settings were pushed; existing unrelated settings were preserved. Advisor warnings about API execution of the Supabase RLS event trigger were resolved by revoking execution from API roles. The remaining advisor warning is leaked-password protection, which requires Supabase Pro or above ([documentation](https://supabase.com/docs/guides/auth/password-security)). No plan upgrade was made.

Custom SMTP is not configured, so signup/reset emails for ordinary users remain a launch dependency. The default email service supports project-team addresses only ([SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp)); the live tests used temporary admin-confirmed accounts and did not test actual email delivery. Online charging, messaging and file uploads remain outside the implemented manual rental workflow.

## Select the project

Connect/authenticate the installed Supabase plugin and select the intended project. Reload the chat if its tools remain unavailable. Alternatively, authenticate the installed CLI with `npx supabase login` locally; keep its token out of chat. Do not select another application's database without inspecting its tables and settings first.

The project URL and publishable key are safe frontend configuration. The service-role/secret key is privileged and belongs only inside Supabase Edge Functions. The deployed function uses Supabase's built-in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; it is never sent to the website.

## Database and function deployment

Once authenticated, link using the **actual** project reference:

```powershell
npx.cmd supabase link --project-ref YOUR_PROJECT_REF
npx.cmd supabase db push --dry-run
npm.cmd run db:migrate
npx.cmd supabase db advisors --linked --type all
npx.cmd supabase migration list
```

Inspect the dry run before applying it. The migration creates only `public.renter_workspaces`; it does not alter or drop existing application tables. The table uses a verified Supabase user UUID as owner, a unique public UUID, a versioned JSON document and timestamps. RLS allows authenticated owners to read their own row. Anonymous access and all browser writes are denied by explicit grants. Service-role writes occur only through the Edge Function after token verification and command validation.

Set the function's origins and preserve review access:

```powershell
npx.cmd supabase secrets set --env-file supabase/functions/.env.example
npm.cmd run backend:deploy
```

`RENTER_ALLOWED_ORIGINS` must include the actual local and hosted frontend origins. Append any additional local dev port you use. `RENTER_PUBLIC_BOOKING_ENABLED=false` is intentional: direct storefront API reads and writes also require the owner's verified session until public launch. CORS is not authentication; ownership checks still apply without an Origin header.

The function config has `verify_jwt=false` so a future public customer route can be reached without an owner token. The function itself verifies every owner token with `auth.getUser(token)` and rejects anonymous Auth users. During private review it applies that same check to storefront routes and checks the business owner. **Do not remove this application authentication check.** Gateway JWT checks are not a substitute for the function's ownership validation.

## Auth configuration

Inspect existing project Auth settings first. Enable email/password sign-in and email confirmation. Use a minimum password length of at least 10 characters. Append these allowed redirects while preserving other applications' URLs:

- `http://127.0.0.1:5173/**`
- `http://localhost:5173/**`
- `http://127.0.0.1:5174/**`
- `http://localhost:5174/**`
- `https://renter-pk.smokyolive4.chatgpt.site/**`

Set the production Site URL to `https://renter-pk.smokyolive4.chatgpt.site`. Password resets return to `/?reset=password`; confirmation returns to `/`.

Configure custom SMTP for ordinary owner accounts. Supabase's default mail service sends only to project-team addresses and has restrictive limits; do not disable email confirmation to work around delivery. See [Supabase SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp).

Avoid pushing the whole generated local `config.toml` onto an existing shared project. It contains local defaults; update only the relevant remote Auth settings after inspecting their current values.

## Frontend configuration and private publication

For local Vite, copy `.env.example` to `.env.local` and fill `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`. Restart the dev server. No secret key is required on the frontend.

For the hosted Site, set these Sites runtime environment variables before publishing:

- `SUPABASE_URL`: the selected project's URL.
- `SUPABASE_PUBLISHABLE_KEY`: its publishable key (legacy anon accepted for compatibility).

`/api/config` returns only public configuration and refuses privileged keys. The Cloudflare Worker serves assets/configuration; all rental operations run in Supabase. Keep the Site owner-private. Build, push the exact source state, package it, and deploy privately only after the live acceptance checks below pass.

## Live acceptance checks

1. Query `renter_workspaces` to verify its migration, RLS and grants; run Supabase advisors and resolve findings.
2. Create a real test owner, confirm email, sign in and verify an empty workspace is persisted in Postgres.
3. Add business settings, a car or bike, and a customer. Reload and verify persistence.
4. Open the booking page as this owner, submit a future request, confirm it from the dashboard and cancel it. Verify the stored revision increases.
5. Create a second owner and prove neither account can read the other's workspace or private storefront. Anonymous direct storefront calls must return 401 during review. Browser direct table writes must fail.
6. Attempt two confirmations for overlapping dates and two edits with the same revision. Only one conflicting write should succeed; no reservation should be lost.
7. Record a cash/bank-transfer payment and a security deposit. Reload and verify separate balances. This is a ledger, not an online charge.
8. Request a password reset, follow its email link, change the password, sign out and sign in again.
9. Publish the private frontend after successful checks, then repeat an owner read/write from its hosted origin.

## Prior data

The previous D1 implementation and migrations remain tracked and its local database remains in ignored `.wrangler/`. No old records were deleted. Existing Sites/ChatGPT owner IDs are not Supabase UUIDs; do not import them as-is or assign real customer records to a guessed account. Export any actual business data, verify the target owner UUID and map it explicitly in a one-time server-side import. Fictional sample data should stay out of the live business.

## References verified during implementation

- [Supabase changelog](https://supabase.com/changelog)
- [Supabase Auth getUser](https://supabase.com/docs/reference/javascript/auth-getuser)
- [Password-based authentication](https://supabase.com/docs/guides/auth/passwords)
- [Row-level security and grants](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Edge Function authentication](https://supabase.com/docs/guides/functions/auth)
- [Edge Function deployment](https://supabase.com/docs/guides/functions/deploy)
- [Edge Function environment variables](https://supabase.com/docs/guides/functions/secrets)
- [Routing](https://supabase.com/docs/guides/functions/routing)
- [MCP connection](https://supabase.com/docs/guides/ai-tools/mcp)

The September PostgreSQL minor-version notice concerns specific extensions/operators; this migration uses none of the affected operators or extension functions. It uses the built-in `gen_random_uuid()`.
