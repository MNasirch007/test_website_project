import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { createClient } from '@supabase/supabase-js';
import { workspaceRepository } from '../supabase/functions/_shared/repository.js';
import { emptyWorkspace } from '../shared/rental.js';
import siteWorker from '../server/site-worker.js';

test('website configuration never returns a privileged Supabase key',async()=>{
  for(const key of ['sb_secret_private',`header.${Buffer.from(JSON.stringify({role:'service_role'})).toString('base64url')}.signature`]){
    const response=await siteWorker.fetch(new Request('https://renter.test/api/config'),{SUPABASE_URL:'https://example.supabase.co',SUPABASE_PUBLISHABLE_KEY:key});
    assert.equal((await response.json()).publishableKey,'');
  }
});

test('Postgres migration enforces owner RLS, denies direct writes, and saves one revision atomically', async () => {
  const db = new PGlite();
  const one = '10000000-0000-4000-8000-000000000001', two = '10000000-0000-4000-8000-000000000002';
  try {
    // Supabase supplies these roles and auth helpers; emulate only this platform seam.
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
      grant usage on schema public, auth to anon, authenticated, service_role;
      grant execute on function auth.uid() to authenticated;
      insert into auth.users values ('${one}'),('${two}');`);
    await db.exec(readFileSync(new URL('../supabase/migrations/20261009175758_renter_workspaces.sql', import.meta.url), 'utf8'));
    await db.query('insert into renter_workspaces(owner_id,data) values ($1,$3),($2,$3)', [one, two, JSON.stringify(emptyWorkspace())]);
    await db.exec(`set role authenticated; set request.jwt.claim.sub = '${one}';`);
    assert.deepEqual((await db.query('select owner_id from renter_workspaces')).rows.map(row => row.owner_id), [one]);
    assert.equal((await db.query('select * from renter_workspaces where owner_id=$1', [two])).rows.length, 0);
    await assert.rejects(db.query('update renter_workspaces set revision=1'), /permission denied/);
    await assert.rejects(db.query('insert into renter_workspaces(owner_id,data) values ($1,$2)', [one, '{}']), /permission denied/);
    await assert.rejects(db.query('delete from renter_workspaces'), /permission denied/);
    await db.exec('set role anon');
    await assert.rejects(db.query('select * from renter_workspaces'), /permission denied/);
    await db.exec('set role service_role');
    const update = () => db.query('update renter_workspaces set revision=revision+1 where owner_id=$1 and revision=0 returning revision', [one]);
    const saves = await Promise.all([update(), update()]);
    assert.equal(saves.reduce((count, result) => count + result.rows.length, 0), 1);
    assert.equal((await db.query('select revision from renter_workspaces where owner_id=$1', [one])).rows[0].revision, 1);
  } finally { await db.close(); }
});

test('Supabase repository scopes reads and revision writes and propagates failures', async () => {
  const calls = [];
  const client = createClient('https://renter-test.supabase.co', 'sb_publishable_test', { auth: { persistSession: false }, global: {
    fetch: async (input, options) => {
      const url = new URL(input); calls.push({ url, options });
      return Response.json(options.method === 'POST' ? null : [{ owner_id: 'owner', revision: 2 }]);
    },
  } });
  const repository = workspaceRepository(client);
  await repository.owned('owner'); await repository.public('public-id'); await repository.create('owner', emptyWorkspace());
  await repository.save({ owner_id: 'owner', revision: 1 }, emptyWorkspace());
  assert.equal(calls[0].url.searchParams.get('owner_id'), 'eq.owner');
  assert.equal(calls[1].url.searchParams.get('public_id'), 'eq.public-id');
  assert.match(new Headers(calls[2].options.headers).get('prefer'), /resolution=ignore-duplicates/);
  const saved = calls.at(-1);
  assert.equal(saved.url.searchParams.get('owner_id'), 'eq.owner'); assert.equal(saved.url.searchParams.get('revision'), 'eq.1');
  assert.equal(JSON.parse(saved.options.body).revision, 2);
  const failing = createClient('https://renter-test.supabase.co', 'sb_publishable_test', { auth: { persistSession: false }, global: { fetch: async () => Response.json({ message: 'Unavailable', code: 'XX001' }, { status: 500 }) } });
  await assert.rejects(workspaceRepository(failing).owned('owner'), error => error.message === 'Unavailable');
});
