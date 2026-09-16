import { defineConfig } from '@playwright/test';

const frontendBaseURL = process.env.E2E_FRONTEND_URL ?? 'http://127.0.0.1:3100';

export default defineConfig({
  testDir: './tests/integration',
  timeout: 180_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: './test-results/integration-results.json' }]],
  outputDir: './test-results/integration-artifacts',
  use: {
    baseURL: frontendBaseURL,
    browserName: 'chromium',
    channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || 'chrome',
    colorScheme: 'light',
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [{ name: 'chrome' }],
});
