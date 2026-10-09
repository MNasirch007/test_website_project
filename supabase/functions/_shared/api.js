import { emptyWorkspace } from './rental.js';
import { applyCommand, ValidationError } from './commands.js';

async function readBody(request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new ValidationError('Send a JSON request.', 415);
  const reader = request.body?.getReader();
  if (!reader) throw new ValidationError('Request body is required.');
  let size = 0;
  const chunks = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 32768) { await reader.cancel(); throw new ValidationError('Request is too large.', 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new ValidationError('Request JSON is invalid.'); }
}

export async function handleApi(request, { repository, authenticate, allowedOrigins = [], publicBookingEnabled = false }) {
  const origin = request.headers.get('origin');
  const headers = {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff', 'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
  if (origin && allowedOrigins.includes(origin)) headers['Access-Control-Allow-Origin'] = origin;
  const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
  try {
    if (origin && !allowedOrigins.includes(origin)) return json({ error: 'This website is not allowed to access the rental API.' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    const path = new URL(request.url).pathname.replace(/^\/(?:functions\/v1\/)?renter(?=\/|$)/, '');
    const publicMatch = path.match(/^\/public\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
    const isPublic = Boolean(publicMatch);
    if (!isPublic && !['/workspace', '/commands'].includes(path)) return json({ error: 'Route not found.' }, 404);
    if (!['GET', 'POST'].includes(request.method) || (path === '/commands' && request.method !== 'POST') || (path === '/workspace' && request.method !== 'GET')) return json({ error: 'Method not allowed.' }, 405);
    let user;
    if (!isPublic || !publicBookingEnabled) {
      const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
      if (!token) return json({ error: 'Sign in to your owner workspace.' }, 401);
      user = await authenticate(token);
      if (!user?.id || user.is_anonymous) return json({ error: 'Your session expired. Please sign in again.' }, 401);
    }
    const actor = user?.email || 'Customer';
    let row = isPublic ? await repository.public(publicMatch[1]) : await repository.owned(user.id);
    if (isPublic && !publicBookingEnabled && row?.owner_id !== user.id) return json({ error: 'This rental business was not found.' }, 404);
    if (!row && !isPublic) row = await repository.create(user.id, emptyWorkspace());
    if (!row) return json({ error: 'This rental business was not found.' }, 404);
    const payload = state => ({ ...state, revision: row.revision, publicId: row.public_id, accountName: actor });
    if (request.method === 'GET') {
      const state = row.data;
      if (!isPublic) return json(payload(state));
      return json({ businessId: row.public_id, demo: state.demo, settings: state.settings,
        vehicles: state.vehicles.filter(v => v.listed),
        blocked: state.bookings.filter(b => ['Confirmed', 'Active'].includes(b.status)).map(b => ({ vehicleId: b.vehicleId, start: b.start, end: b.status === 'Active' && Date.parse(b.end) < Date.now() ? new Date(Date.now() + 86400000).toISOString() : b.end })),
        maintenance: state.maintenance.map(m => ({ vehicleId: m.vehicleId, start: m.start, end: m.end })) });
    }
    const input = await readBody(request);
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ValidationError('Invalid request.');
    for (let attempt = 0; attempt < 4; attempt++) {
      if (!isPublic && input.revision !== row.revision && !row.data.executed.includes(input.commandId)) return json({ error: 'The workspace changed in another tab. Refresh and try again.' }, 409);
      const state = applyCommand(row.data, input, actor, isPublic);
      if (new TextEncoder().encode(JSON.stringify(state)).byteLength > 1500000) return json({ error: 'Workspace storage limit reached. Export your records before adding more.' }, 409);
      const saved = state === row.data ? { revision: row.revision } : await repository.save(row, state);
      if (saved) {
        if (isPublic) {
          const booking = state.bookings.find(b => b.submissionId === input.commandId);
          return json({ reference: booking?.reference, status: 'Requested' }, 201);
        }
        return json({ ...payload(state), revision: saved.revision });
      }
      row = isPublic ? await repository.public(publicMatch[1]) : await repository.owned(user.id);
      if (!row) return json({ error: 'This rental business was not found.' }, 404);
    }
    return json({ error: 'Another booking was saved at the same time. Please try again.' }, 409);
  } catch (error) {
    if (error instanceof ValidationError) return json({ error: error.message }, error.status);
    // Keep customer records and credentials out of function logs.
    console.error('Renter operation failed', error.code || error.name);
    return json({ error: 'Unable to load or save right now. Please try again.' }, 500);
  }
}
