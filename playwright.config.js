import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests',testMatch:'browser.spec.js',workers:1,timeout:30000,
  use:{baseURL:'http://127.0.0.1:5173',browserName:'chromium',channel:'msedge',headless:true,viewport:{width:1440,height:1000},screenshot:'only-on-failure',trace:'retain-on-failure'},
  outputDir:'outputs/browser-tests',reporter:'list',
});
