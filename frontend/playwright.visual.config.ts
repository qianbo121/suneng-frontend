import { defineConfig } from '@playwright/test';

const port = Number(process.env.VISUAL_PORT || 3102);
const baseURL = process.env.VISUAL_BASE_URL || `http://127.0.0.1:${port}`;
const useExternalServer = Boolean(process.env.VISUAL_BASE_URL);
const newsPort = port + 1;
const browserChannel = process.env.PLAYWRIGHT_BROWSER_CHANNEL;

export default defineConfig({
  testDir: './tests/visual',
  timeout: 60_000,
  fullyParallel: false,
  // All files share one Next dev server and its in-flight image cache. Keep
  // browser contexts from interrupting each other's first image requests.
  workers: 1,
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
    ...(browserChannel ? { channel: browserChannel } : {}),
    headless: true,
    colorScheme: 'light',
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: useExternalServer
    ? undefined
    : [{
        command: `VISUAL_NEWS_PORT=${newsPort} node tests/visual/fixtures/news-server.mjs`,
        url: `http://127.0.0.1:${newsPort}/health`,
        reuseExistingServer: false,
      }, {
        command: `API_BASE_URL_INTERNAL=http://127.0.0.1:${newsPort}/api NEXT_PUBLIC_API_URL=/api NEXT_PUBLIC_API_BASE_URL=/api NEXT_DIST_DIR=.next-visual pnpm exec next dev -H 127.0.0.1 -p ${port}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }],
  projects: [{ name: process.env.VISUAL_PROJECT || 'chrome' }],
});
