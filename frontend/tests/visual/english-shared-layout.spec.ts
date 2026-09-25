import { expect, test } from '@playwright/test';

for (const width of [1440, 1280, 390]) {
  for (const route of ['/en', '/en/products', '/en/service/furnace-renovation-overhaul']) {
    test(`${route} keeps English text inside its containers at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const footer = page.locator('.site-footer');
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toBeVisible();
      const address = footer.locator('.site-footer__contact > div > span').last();
      await expect(address).toContainText('China');
      const box = await address.evaluate((element) => {
        const r = element.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(element);
        return { client: element.clientWidth, scroll: element.scrollWidth, right: r.right,
          textRight: Math.max(...Array.from(range.getClientRects()).map(rect => rect.right)), viewport: innerWidth };
      });
      expect(box.scroll).toBeLessThanOrEqual(box.client + 1);
      expect(box.textRight).toBeLessThanOrEqual(box.right + 1);
      expect(box.right).toBeLessThanOrEqual(box.viewport);
      await footer.screenshot({ path: testInfo.outputPath('footer.png') });
      const form = page.locator('[data-contact-form]').first();
      await form.scrollIntoViewIfNeeded();
      const outcome = form.locator('[class*=formOutcomeResults]');
      if (await outcome.count()) {
        const labelsFit = await outcome.evaluate(element => {
          const r = element.getBoundingClientRect();
          return element.scrollWidth <= element.clientWidth + 1 && Array.from(element.querySelectorAll('strong')).every(e => e.getBoundingClientRect().right <= r.right + 1);
        });
        expect(labelsFit).toBe(true);
      }
      const inputs = form.locator('input[name=identity],input[name=contact]');
      const sizes = await inputs.evaluateAll(elements => elements.map(element => {
        const e = element as HTMLInputElement, s = getComputedStyle(e), ctx = document.createElement('canvas').getContext('2d')!;
        ctx.font = s.font;
        return { y: e.getBoundingClientRect().top, text: ctx.measureText(e.placeholder).width,
          available: e.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight) };
      }));
      for (const size of sizes) expect(size.text).toBeLessThanOrEqual(size.available + 1);
      if (width > 767) expect(Math.abs(sizes[0].y - sizes[1].y)).toBeLessThanOrEqual(1);
      await expect(form.locator('#contact-hint')).toBeVisible();
      await form.screenshot({ path: testInfo.outputPath('inquiry.png') });
      const title = page.locator('#hero-title');
      if (await title.count()) expect(await title.evaluate(e => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
      // Closing this context while the shared dev server is still generating
      // a lazy poster can leave subsequent screenshot tests waiting on it.
      await page.waitForLoadState('networkidle');
    });
  }
}

test('English inquiry keeps its selection, keyboard focus and validation usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/products', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  const form = page.locator('[data-contact-form]');
  const trigger = form.locator('button[aria-haspopup=listbox]');
  await trigger.click();
  await expect(form.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(form.getByRole('listbox')).toHaveCount(0);
  await form.getByRole('button', { name: 'Send project details' }).click();
  await expect(form.locator('[aria-invalid=true]').first()).toBeFocused();
  await expect(form.locator('[role=status], [aria-live=polite]').filter({ hasText: /Please/ }).first()).toBeVisible();
});

test('all eight shared furnace pages keep long English configuration labels visible on mobile', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const slug of ['box-furnace', 'trolley-furnace', 'pit-furnace', 'bell-furnace', 'mesh-belt-furnace', 'pusher-furnace', 'roller-hearth-furnace', 'rotary-hearth-furnace']) {
    await page.goto(`/en/products/detail/${slug}`, { waitUntil: 'domcontentloaded' });
    const panel = page.locator('[class*=dimensionPanel]');
    await panel.scrollIntoViewIfNeeded();
    const clipped = await panel.evaluate(element => {
      const bounds = element.getBoundingClientRect();
      return Array.from(element.querySelectorAll('h3,span')).filter(e => {
        const r = e.getBoundingClientRect();
        return r.left < bounds.left || r.right > bounds.right + 1 || e.scrollWidth > e.clientWidth + 1;
      }).map(e => e.textContent);
    });
    expect(clipped, slug).toEqual([]);
    await panel.screenshot({ path: testInfo.outputPath(`${slug}-configuration.png`) });
  }
});
