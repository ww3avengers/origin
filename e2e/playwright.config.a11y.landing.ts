import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const absolutePath = path.resolve(process.cwd(), 'api/server/index.js');

export default defineConfig({
  retries: 0,
  // Keine Auth, kein globalSetup/globalTeardown
  webServer: {
    command: `node ${absolutePath}`,
    port: 3080,
    timeout: 120 * 1000,
    reuseExistingServer: false,
    env: {
      NODE_ENV: 'CI',
      SEARCH: 'false',
      TITLE_CONVO: 'false',
      LIMIT_CONCURRENT_MESSAGES: 'false',
    },
  },
  fullyParallel: false,
  testDir: path.resolve(__dirname, 'tests'),
  testMatch: /landing\.a11y\.spec\.ts/,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3080',
    trace: 'on-first-retry',
    locale: 'de-DE',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
