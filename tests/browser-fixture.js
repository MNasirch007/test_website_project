import { sampleWorkspace, emptyWorkspace } from '../shared/rental.js';
import { handleApi } from '../supabase/functions/_shared/api.js';

// Browser contract fixture only; the app never enables a mock authentication mode.
export async function connectTestBackend(context, { empty = false } = {}) {
  const id = '10000000-0000-4000-8000-000000000001';
  const user = { id, email: 'owner@example.com', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
  const claims = { sub: id, aud: 'authenticated', role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600, iat: Math.floor(Date.now() / 1000), session_id: crypto.randomUUID() };
  const token = `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.test-signature`;
  let row = { owner_id: id, public_id: crypto.randomUUID(), revision: 0, data: empty ? emptyWorkspace() : sampleWorkspace() };
  const repository = {
    async owned(owner) { return owner === id ? structuredClone(row) : null; },
    async public(publicId) { return publicId === row.public_id ? structuredClone(row) : null; },
    async create() { throw Error('Unexpected create'); },
    async save(original, data) {
      if (original.revision !== row.revision) return null;
      row = { ...row, data: structuredClone(data), revision: row.revision + 1 }; return { revision: row.revision };
    },
  };
  await context.route('**/api/config', route => route.fulfill({ json: { supabaseUrl: 'https://renter-test.supabase.co', publishableKey: 'sb_publishable_browser_test' } }));
  await context.route('https://renter-test.supabase.co/**', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.pathname.startsWith('/auth/v1/')) {
      if (url.pathname.endsWith('/user')) return route.fulfill({ json: user });
      if (url.pathname.endsWith('/logout') || url.pathname.endsWith('/recover')) return route.fulfill({ json: {} });
      if (url.pathname.endsWith('/signup')) return route.fulfill({ json: { user, session: null } });
      return route.fulfill({ json: { access_token: token, token_type: 'bearer', expires_in: 3600, refresh_token: 'test-refresh-token', user } });
    }
    const headers = request.headers();
    const response = await handleApi(new Request(request.url(), { method: request.method(), headers, body: request.postData() || undefined }), {
      repository, authenticate: async access => access === token ? user : null,
      allowedOrigins: ['http://127.0.0.1:5173', 'http://localhost:5173', 'http://127.0.0.1:5175', process.env.RENTER_TEST_URL].filter(Boolean), publicBookingEnabled: true,
    });
    await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: await response.text() });
  });
  return { getWorkspace: () => ({ ...structuredClone(row.data), publicId: row.public_id, revision: row.revision }) };
}
