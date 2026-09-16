import { expect, test } from '@playwright/test';

for (const locale of ['zh', 'en'] as const) {
  test(`${locale} mobile line controls remain usable without dismissing the contact dock`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route('**/api/v1/lead-events', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ code: 0, data: {}, message: 'ok' }),
    }));
    await page.goto(`/${locale}`, { waitUntil: 'networkidle' });
    const dock = page.locator('[data-sticky-engineer-dock]');
    const pages = page.getByRole('navigation', {
      name: locale === 'en' ? 'Production line pages' : '生产线卡片翻页',
    });
    await expect(dock).toHaveAttribute('data-visible', 'false');

    // Put the controls exactly in the area formerly covered by the fixed dock.
    await pages.evaluate((element) => {
      window.scrollTo(0, window.scrollY + element.getBoundingClientRect().bottom - 820);
    });
    await expect(pages).toBeInViewport();
    await expect(dock).toHaveAttribute('data-visible', 'false');
    const next = pages.getByRole('button', {
      name: locale === 'en' ? 'Next production line' : '查看下一条生产线',
    });
    const previous = pages.getByRole('button', {
      name: locale === 'en' ? 'Previous production line' : '查看上一条生产线',
    });
    const status = pages.getByRole('status');
    await next.click();
    await expect(status).toHaveAttribute('aria-label', locale === 'en' ? '2 of 3' : '第 2 条，共 3 条');
    await next.click();
    await expect(status).toHaveAttribute('aria-label', locale === 'en' ? '3 of 3' : '第 3 条，共 3 条');
    await expect(next).toBeDisabled();
    await previous.click();
    await expect(status).toHaveAttribute('aria-label', locale === 'en' ? '2 of 3' : '第 2 条，共 3 条');
    await page.screenshot({ path: testInfo.outputPath(`${locale}-line-controls.png`) });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);

    // Suppression is temporary: the contact entry returns in the following section.
    await pages.evaluate((element) => {
      window.scrollTo(0, window.scrollY + element.getBoundingClientRect().bottom + 40);
    });
    await expect(dock).toHaveAttribute('data-visible', 'true');
  });
}
