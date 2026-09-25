import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`products keep positioned images and working animations at ${width}px`, async ({ page }, info) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    const warnings: string[] = [];
    const errors: string[] = [];
    const analytics: string[] = [];
    page.on('console', msg => { if (['warning', 'error'].includes(msg.type())) warnings.push(msg.text()); });
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/**', route => {
      if (route.request().method() !== 'GET') {
        analytics.push(route.request().url());
        return route.fulfill({ json: { code: 0, data: {} } });
      }
      return route.continue();
    });
    await page.goto('/en/products', { waitUntil: 'domcontentloaded' });
    const cards = page.locator('[data-production-line-card]');
    await expect(cards.first()).toBeVisible();
    for (const card of await cards.all()) {
      const poster = card.locator('a > img').first();
      await poster.scrollIntoViewIfNeeded();
      await expect.poll(() => poster.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      expect(await poster.evaluate(image => {
        const parent = image.parentElement!;
        const box = parent.getBoundingClientRect();
        const imageBox = image.getBoundingClientRect();
        return ['relative', 'absolute', 'fixed'].includes(getComputedStyle(parent).position) &&
          box.width > 0 && box.height > 0 && Math.abs(box.width - imageBox.width) <= 1 &&
          Math.abs(box.height - imageBox.height) <= 1;
      })).toBe(true);
    }
    const first = cards.first();
    await first.scrollIntoViewIfNeeded();
    await first.getByRole('button', { name: /^Play / }).click();
    await expect(first).toHaveAttribute('data-line-preview', 'playing');
    await expect(first.locator('[data-ready="true"]')).toBeVisible();
    await expect.poll(() => first.getAttribute('data-preview-stage'), { timeout: 20_000 }).not.toBe('0');
    await first.screenshot({ path: info.outputPath('line-playing.png') });
    await page.keyboard.press('Escape');
    await expect(first).toHaveAttribute('data-line-preview', 'idle');

    const furnace = page.locator('[data-furnace-item="box-furnace"]');
    await furnace.getByRole('button', { name: 'Play Box Furnace demo', exact: true }).click();
    const animation = furnace.locator('[data-furnace-animation]');
    await expect(animation).toHaveAttribute('data-playing', 'true');
    await expect(animation).toHaveAttribute('data-visible', 'true');
    await expect(animation.locator('canvas')).toBeVisible();
    await furnace.screenshot({ path: info.outputPath('furnace-playing.png') });
    await page.keyboard.press('Escape');
    await expect(animation).not.toHaveAttribute('data-playing', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(analytics).toEqual([]);
    expect(errors).toEqual([]);
    await info.attach('browser-warnings', { body: JSON.stringify(warnings, null, 2), contentType: 'application/json' });
    // Headless screenshots read the WebGL canvas back to the CPU. Keep those
    // driver notices in the evidence, separate from application warnings.
    const screenshotDriverNotice = /^\[\.WebGL-[^\]]+\]GL Driver Message .*GPU stall due to ReadPixels/;
    expect(warnings.filter(text => !text.includes('[Fast Refresh]') && !screenshotDriverNotice.test(text))).toEqual([]);
  });

  test(`resources navigate without blank results or local tracking at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    const analytics: string[] = [];
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/**', route => {
      if (route.request().method() !== 'GET') {
        analytics.push(route.request().url());
        return route.fulfill({ json: { code: 0, data: {} } });
      }
      return route.continue();
    });
    await page.goto('/en/news', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-news-id]').first()).toBeVisible();
    await page.getByRole('link', { name: 'Equipment Selection', exact: true }).click();
    await expect(page).toHaveURL(/topic=selection/);
    await expect(page.locator('[data-news-id]').first()).toBeVisible();
    await page.getByRole('searchbox').fill('annealing');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page).toHaveURL(/q=annealing/);
    await expect(page.locator('[data-news-id]').first()).toBeVisible();
    await page.screenshot({ path: info.outputPath('resources.png'), fullPage: true });
    await page.locator('[data-news-id]').first().locator('a').first().click();
    await expect(page.locator('main h1')).toBeVisible();
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(analytics).toEqual([]);
    expect(errors).toEqual([]);
  });
}
