import { createClient } from '@supabase/supabase-js';

let clientPromise;
export function getSupabase() {
  clientPromise ??= (async () => {
    let url = import.meta.env.VITE_SUPABASE_URL;
    let key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      const response = await fetch('/api/config', { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw Error('Unable to load the website configuration. Please try again.');
      const config = await response.json(); url = config.supabaseUrl; key = config.publishableKey;
    }
    if (!url || !key) throw Error('Supabase is not connected yet. Configure the project URL and publishable key, then restart the development server.');
    if (key.startsWith('sb_secret_')) throw Error('Use a Supabase publishable key. Secret keys must stay on the server.');
    if (key.split('.').length === 3) {
      try {
        const claims = JSON.parse(atob(key.split('.')[1].replaceAll('-', '+').replaceAll('_', '/')));
        if (claims.role !== 'anon') throw Error('Use a Supabase publishable or legacy anon key.');
      } catch { throw Error('Use a Supabase publishable or legacy anon key.'); }
    }
    return { client: createClient(url, key), url: url.replace(/\/$/, ''), key };
  })();
  return clientPromise;
}

export async function apiFetch(path, options = {}) {
  const { client, url, key } = await getSupabase();
  const { data: { session } } = await client.auth.getSession();
  const headers = new Headers(options.headers); headers.set('apikey', key);
  if (session) headers.set('authorization', `Bearer ${session.access_token}`);
  const send = () => fetch(`${url}/functions/v1/renter${path}`, { ...options, headers, signal: AbortSignal.timeout(20000) });
  let response = await send();
  if (response.status === 401 && session) {
    const { data, error } = await client.auth.refreshSession();
    if (!error && data.session) { headers.set('authorization', `Bearer ${data.session.access_token}`); response = await send(); }
  }
  return response;
}

export async function signOut() {
  const { client } = await getSupabase();
  const { error } = await client.auth.signOut(); if (error) throw error;
}
