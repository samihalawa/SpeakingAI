import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on',
    headless: true,
    viewport: { width: 1280, height: 720 },
    launchOptions: {
      args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
    }
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    }
  ],
  webServer: {
    command: 'npm run dev',
    port: 5000,
    reuseExistingServer: true,
  },
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/test-results.json' }]
  ],
  workers: 1,
  preserveOutput: 'failures-only',
  outputDir: 'test-results'
};

export default config;
