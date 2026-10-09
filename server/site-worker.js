export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/api/config') {
      let key = env.SUPABASE_PUBLISHABLE_KEY || '';
      if (!key.startsWith('sb_publishable_')) {
        try {
          const claims = JSON.parse(atob(key.split('.')[1].replaceAll('-', '+').replaceAll('_', '/')));
          if (claims.role !== 'anon') key = '';
        } catch { key = ''; }
      }
      return Response.json({ supabaseUrl: env.SUPABASE_URL || '', publishableKey: key }, {
        headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
      });
    }
    if (path.startsWith('/api/')) return Response.json({ error: 'Rental operations are served by Supabase Edge Functions.' }, { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
