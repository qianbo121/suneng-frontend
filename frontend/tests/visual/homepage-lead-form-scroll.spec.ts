import { expect, test } from '@playwright/test';

type MenuEvent = { type: string; atUtc: string; scrollY: number; listbox: boolean };
type AuditWindow = Window & { __leadMenuAudit?: MenuEvent[] };

for (const route of ['/en/products', '/en/contact', '/zh/contact']) {
  test(`inquiry menu survives browser positioning and closes on user scroll at ${route}`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    // Local previews can share an upstream. Keep every mutation inside this test.
    await page.route('**/*', async (request) => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.request().method())) {
        await request.fulfill({ status: 200, contentType: 'application/json', body: '{"code":0,"data":{}}' });
      } else await request.continue();
    });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(route, { waitUntil: 'networkidle' });
    if (route.endsWith('/contact')) {
      await page.locator('[aria-controls="contact-message-panel"]').click();
      await page.locator('#contact-inquiry-form button[type="submit"]').click();
    }
    const form = page.locator('[data-contact-form]');
    const trigger = form.locator('button[aria-haspopup="listbox"]');
    await trigger.click();
    const menu = form.getByRole('listbox');
    await expect(menu).toBeVisible();
    await page.evaluate(() => {
      const current = window as AuditWindow;
      current.__leadMenuAudit = [];
      const record = (type: string) => current.__leadMenuAudit!.push({
        type, atUtc: new Date().toISOString(), scrollY,
        listbox: Boolean(document.querySelector('[role="listbox"]')),
      });
      for (const name of ['scroll', 'wheel', 'touchmove']) {
        window.addEventListener(name, () => record(name), { capture: true, passive: true });
      }
      new MutationObserver(() => record('menu-dom-change')).observe(
        document.querySelector('[data-contact-form]')!, { subtree: true, childList: true },
      );
      record('observer-installed');
    });
    const beforeScroll = await page.evaluate(() => scrollY);
    await page.evaluate(() => window.scrollBy({ top: scrollY > 16 ? -8 : 8, behavior: 'smooth' }));
    await expect.poll(() => page.evaluate(() => scrollY)).not.toBe(beforeScroll);
    await expect(menu).toBeVisible();
    await page.screenshot({ path: info.outputPath('menu-after-programmatic-scroll.png') });
    const english = route.startsWith('/en');
    const chosenOption = menu.getByRole('option', { name: english ? 'After-sales or other support' : '售后或其他', exact: true });
    await chosenOption.click();
    await expect(trigger).toContainText(english ? 'After-sales or other support' : '售后或其他');
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(menu).toBeVisible();
    // Focus enters the selected option on the component's next animation frame.
    // Send keyboard input only after that actual focus transition has completed.
    await expect(chosenOption).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await expect(menu).toBeVisible();
    await expect(chosenOption).toBeFocused();
    // A real mouse wheel outside the menu must retain the mobile scroll-to-close behavior.
    await page.mouse.move(8, 160);
    await page.mouse.wheel(0, 100);
    await expect(menu).toHaveCount(0);
    await info.attach('actual-menu-events', {
      body: JSON.stringify(await page.evaluate(() => (window as AuditWindow).__leadMenuAudit), null, 2),
      contentType: 'application/json',
    });
    expect(errors).toEqual([]);
  });
}
