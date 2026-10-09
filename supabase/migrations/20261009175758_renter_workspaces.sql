create table public.renter_workspaces (
  owner_id uuid primary key references auth.users(id),
  public_id uuid not null unique default gen_random_uuid(),
  data jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 1500000),
  revision integer not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.renter_workspaces enable row level security;
revoke all on public.renter_workspaces from public, anon, authenticated;
grant select on public.renter_workspaces to authenticated;
grant select, insert, update, delete on public.renter_workspaces to service_role;

create policy "Owners can read their own rental workspace"
on public.renter_workspaces for select to authenticated
using ((select auth.uid()) = owner_id);

-- All writes go through the Edge Function's validation and revision checks.
-- There are deliberately no client INSERT/UPDATE/DELETE policies or grants.
