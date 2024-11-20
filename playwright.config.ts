import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    port: 5000,
    reuseExistingServer: !process.env.CI,
  },
};

export default config;
