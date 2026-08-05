import { defineConfig } from '@playwright/test';

const port = Number(process.env.VISUAL_PORT || 3102);
const baseURL = process.env.VISUAL_BASE_URL || `http://127.0.0.1:${port}`;
const useExternalServer = Boolean(process.env.VISUAL_BASE_URL);

export default defineConfig({
  testDir: './tests/visual',
  timeout: 60_000,
  fullyParallel: false,
  reporter: [['list'], ['html', { outputFolder: './test-results/visual-report', open: 'never' }]],
  outputDir: './test-results/visual-artifacts',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{projectName}/{arg}{ext}',
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
    },
  },
  use: {
    baseURL,
    browserName: 'chromium',
    channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || 'chrome',
    colorScheme: 'light',
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: useExternalServer
    ? undefined
    : {
        command: `NEXT_DIST_DIR=.next-visual pnpm exec next dev -H 127.0.0.1 -p ${port}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects: [{ name: 'chrome' }],
});
