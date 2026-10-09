import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests',testMatch:'browser.spec.js',workers:1,timeout:30000,
  use:{baseURL:process.env.RENTER_TEST_URL || 'http://127.0.0.1:5175',browserName:'chromium',channel:'msedge',headless:true,viewport:{width:1440,height:1000},screenshot:'only-on-failure',trace:'retain-on-failure'},
  // Contract tests must not use the developer's real project or credentials.
  webServer:process.env.RENTER_TEST_URL ? undefined : {
    command:'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5175 --strictPort',
    url:'http://127.0.0.1:5175',reuseExistingServer:false,
    env:{VITE_SUPABASE_URL:'',VITE_SUPABASE_PUBLISHABLE_KEY:'',SUPABASE_URL:'',SUPABASE_PUBLISHABLE_KEY:''},
  },
  outputDir:'outputs/browser-tests',reporter:'list',
});
