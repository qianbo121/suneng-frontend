import { expect, test } from '@playwright/test';

// Run against a production preview via VISUAL_BASE_URL. Each attempt starts a
// fresh browser context, since a warm reload can miss first-load hydration errors.
for (const route of ['/zh', '/en', '/zh/products', '/zh/inquiry']) {
  for (const query of ['', '?acquisition_qa=FIRST_LOAD_STABILITY_QA']) {
    test(`fresh page keeps its form stable: ${route}${query}`, async ({ browser, baseURL }) => {
      if (!baseURL) throw new Error('A production preview base URL is required');
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 } });
        try {
          const page = await context.newPage();
          const errors: string[] = [];
          page.on('pageerror', (error) => errors.push(error.message));
          await page.goto(`${route}${query}`, { waitUntil: 'load' });
          await expect(page.locator('main h1').first()).toBeVisible();
          const form = page.locator('[data-contact-form]');
          await expect(form).toHaveCount(1);
          const trigger = form.locator('button[aria-haspopup="listbox"]');
          await trigger.click();
          const menu = form.getByRole('listbox');
          await expect(menu).toBeVisible();
          await expect(menu.getByRole('option')).toHaveCount(6);
          await expect(menu.getByRole('option').first()).toBeFocused();
          await page.keyboard.press('Escape');
          await expect(menu).toHaveCount(0);
          await expect(trigger).toBeFocused();
          expect(errors).toEqual([]);
        } finally {
          await context.close();
        }
      }
    });
  }
}

for (const slug of [
  'custom-heat-treatment-furnace-chamber-process',
  'annealing-furnace-metal-semiconductor-selection',
  'steel-annealing-500-tonnes-two-bogie-hearth-furnaces-capacity',
]) {
  test(`article body stays visible: ${slug}`, async ({ browser, baseURL }) => {
    // The default visual server only has local fixture articles. Real published
    // bodies are checked separately against the explicitly selected preview.
    test.skip(!process.env.VISUAL_BASE_URL, 'Published articles require an explicit production preview');
    if (!baseURL) throw new Error('A production preview base URL is required');
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      const context = await browser.newContext({ baseURL, viewport });
      try {
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.goto(`/zh/news/${slug}?acquisition_qa=FIRST_LOAD_STABILITY_QA`, { waitUntil: 'load' });
        const body = page.locator('[data-news-slug]');
        await expect(body).toBeVisible();
        await expect.poll(async () => (await body.innerText()).trim().length).toBeGreaterThan(1000);
        expect(await body.locator('p').count()).toBeGreaterThan(5);
        expect(await body.locator('h2,h3').count()).toBeGreaterThan(0);
        expect(errors).toEqual([]);
      } finally {
        await context.close();
      }
    }
  });
}
