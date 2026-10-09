import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { sites } from './build/sites-vite-plugin.ts';
import siteWorker from './server/site-worker.js';
process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= 'false';
process.env.WRANGLER_SEND_METRICS ??= 'false';
process.env.WRANGLER_WRITE_LOGS ??= 'false';
process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
process.env.WRANGLER_REGISTRY_PATH ??= '.wrangler/dev-registry';
process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';
export default defineConfig(async ({ command, mode }) => {
  const values = loadEnv(mode, process.cwd(), ['VITE_SUPABASE_', 'SUPABASE_']);
  const publicConfig = {
    SUPABASE_URL: values.VITE_SUPABASE_URL || values.SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY: values.VITE_SUPABASE_PUBLISHABLE_KEY || values.SUPABASE_PUBLISHABLE_KEY,
  };
  const localConfig = {
    name: 'renter-local-config',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (!request.url?.startsWith('/api/')) return next();
        // Reuse the production key filter without starting a Worker emulator.
        void siteWorker.fetch(new Request(new URL(request.url, 'http://localhost')), publicConfig)
          .then(async result => {
            response.writeHead(result.status, Object.fromEntries(result.headers));
            response.end(await result.text());
          }).catch(next);
      });
    },
  };
  const workerPlugins = command === 'build'
    ? (await import('@cloudflare/vite-plugin')).cloudflare({ viteEnvironment: { name: 'server' }, inspectorPort: false })
    : localConfig;
  return {
    plugins: [react(), sites({ mockAuth: false }), workerPlugins],
    server: { host: '127.0.0.1', watch: { ignored: ['**/outputs/**'] } },
  };
});
