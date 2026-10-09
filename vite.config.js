import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import { sites } from './build/sites-vite-plugin.ts';
process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= 'false';
process.env.WRANGLER_SEND_METRICS ??= 'false';
process.env.WRANGLER_WRITE_LOGS ??= 'false';
process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
process.env.WRANGLER_REGISTRY_PATH ??= '.wrangler/dev-registry';
process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';
export default defineConfig({
  plugins: [react(), sites({ mockAuth: true }), cloudflare({ viteEnvironment: { name: 'server' }, inspectorPort: false })],
  server: { host: '127.0.0.1', watch: { ignored: ['**/outputs/**'] } },
});
