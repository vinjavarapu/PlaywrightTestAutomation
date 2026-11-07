import { defineConfig, devices } from '@playwright/test';
import { environment } from './src/config/environment';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  outputDir: 'test-results',
  timeout: environment.timeoutMs,
  expect: { timeout: 8_000 },
  globalTimeout: process.env.CI ? 15 * 60 * 1_000 : undefined,
  use: {
    baseURL: environment.baseURL,
    testIdAttribute: 'data-test',
    locale: 'en-US',
    timezoneId: 'UTC',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
