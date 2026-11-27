import { test as base, type BrowserContextOptions } from '@playwright/test';
import { createRequire } from 'node:module';
import path from 'node:path';

export { expect, type Page, type Locator } from '@playwright/test';

// The release runner sets a guard before loading tests. Ordinary local visual tests
// continue to use Playwright's normal fixtures.
export const test = base.extend({
  browser: [async ({ browser }, use) => {
    if (process.env.SUNENG_QA_VISUAL_GUARD_REQUIRED !== '1') {
      await use(browser);
      return;
    }
    const load = createRequire(path.resolve(process.cwd(), 'package.json'));
    const guard = load(process.env.SUNENG_QA_VISUAL_GUARD_MODULE!);
    const settings = guard.config();
    await guard.checkService(settings);
    const original = browser.newContext;
    const contextFactory = { newContext: original.bind(browser) };
    browser.newContext = (options?: BrowserContextOptions) => guard.newContext(contextFactory, options);
    try {
      await use(browser);
      await guard.checkService(settings);
    } finally {
      browser.newContext = original;
    }
  }, { scope: 'worker' }],
});
