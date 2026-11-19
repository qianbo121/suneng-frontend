import { expect, test } from '@playwright/test';

for (const width of [1280, 1440]) {
  test(`English footer and bilingual checklist stay clear of the toolbar at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      '/en/products/detail/fastener-quench-temper-line',
      '/en/news',
      '/zh/products/detail/copper-wire-annealing-line/inquiry-checklist',
      '/en/products/detail/copper-wire-annealing-line/inquiry-checklist',
    ]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const toolbar = page.locator('[data-contact-toolbar]');
      await expect(toolbar).toBeVisible();
      const bar = (await toolbar.boundingBox())!;
      if (route.includes('inquiry-checklist')) {
        const article = page.locator('article[aria-labelledby="checklist-title"]');
        await expect(article).toBeVisible();
        const box = (await article.locator(':scope > div').boundingBox())!;
        expect(bar.x - box.x - box.width).toBeGreaterThanOrEqual(15.5);
        const first = article.getByRole('checkbox').first();
        await first.check();
        await expect(article.getByRole('status')).toContainText('1 / 9');
        await testInfo.attach(`${route}-${width}-checklist`, { body: await page.screenshot(), contentType: 'image/png' });
        await first.uncheck();
        await expect(article.getByRole('status')).toContainText('0 / 9');
      }
      if (route.startsWith('/en/')) {
        await page.locator('footer').scrollIntoViewIfNeeded();
        const address = page.locator('footer').getByText('Caiguan Industrial Park, Zhangdian Town', { exact: false });
        await expect(address).toBeVisible();
        const box = (await address.boundingBox())!;
        expect(bar.x - box.x - box.width).toBeGreaterThanOrEqual(15.5);
        await testInfo.attach(`${route}-${width}-footer`, { body: await page.screenshot(), contentType: 'image/png' });
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    }
  });
}

test('phone checklists keep usable controls and the final footer text above the bottom bar', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const locale of ['zh', 'en']) {
    await page.goto(`/${locale}/products/detail/copper-wire-annealing-line/inquiry-checklist`);
    const article = page.locator('article[aria-labelledby="checklist-title"]');
    const first = article.getByRole('checkbox').first();
    await first.check();
    await expect(article.getByRole('status')).toContainText('1 / 9');
    await first.uncheck();
    await expect(article.getByRole('status')).toContainText('0 / 9');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const bar = (await page.locator('[data-contact-toolbar]').boundingBox())!;
    expect(bar.width).toBe(390);
    expect(bar.y + bar.height).toBe(844);
    const lastTextBottom = await page.locator('.site-footer__legal').evaluate(legal => {
      const walker = document.createTreeWalker(legal, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      let bottom = 0;
      while ((node = walker.nextNode())) {
        if (!node.textContent?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) bottom = Math.max(bottom, rect.bottom);
      }
      return bottom;
    });
    expect(lastTextBottom).toBeGreaterThan(0);
    expect(lastTextBottom).toBeLessThanOrEqual(bar.y);
    await testInfo.attach(`${locale}-390-footer`, { body: await page.screenshot(), contentType: 'image/png' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  }
});
