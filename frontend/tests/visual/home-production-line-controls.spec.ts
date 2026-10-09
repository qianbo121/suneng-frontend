import { expect, test } from '@playwright/test';

for (const locale of ['zh', 'en'] as const) {
  test(`${locale} mobile line controls remain usable above the persistent contact toolbar`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route('**/api/v1/lead-events', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ code: 0, data: {}, message: 'ok' }),
    }));
    await page.goto(`/${locale}`, { waitUntil: 'networkidle' });
    const contacts = page.locator('[data-contact-toolbar]');
    const pages = page.getByRole('navigation', {
      name: locale === 'en' ? 'Production line pages' : '生产线卡片翻页',
    });
    await expect(page.locator('[data-sticky-engineer-dock]')).toHaveCount(0);
    await expect(contacts).toBeVisible();

    // Keep carousel controls inside the usable viewport above the contact bar.
    await pages.evaluate((element) => {
      const contactTop = document.querySelector('[data-contact-toolbar]')!.getBoundingClientRect().top;
      window.scrollTo({
        top: window.scrollY + element.getBoundingClientRect().bottom - contactTop + 16,
        behavior: 'instant',
      });
    });
    await expect(pages).toBeInViewport();
    await expect(contacts).toBeVisible();
    const next = pages.getByRole('button', {
      name: locale === 'en' ? 'Next production line' : '查看下一条生产线',
    });
    const previous = pages.getByRole('button', {
      name: locale === 'en' ? 'Previous production line' : '查看上一条生产线',
    });
    const status = pages.getByRole('status');
    const rail = page.getByRole('region', {
      name: locale === 'en' ? 'Browse heat-treatment lines' : '热处理生产线横向浏览',
    });
    const expectLineSettled = async (index: number) => {
      // The page number changes during smooth scrolling, before the card settles.
      await expect.poll(() => rail.evaluate((element, targetIndex) => {
        const cards = element.querySelectorAll<HTMLElement>('[data-production-line-card]');
        const target = Math.min(
          cards[targetIndex].offsetLeft - cards[0].offsetLeft,
          element.scrollWidth - element.clientWidth,
        );
        return Math.abs(element.scrollLeft - target);
      }, index), { message: 'Production line reaches its snap position' }).toBeLessThanOrEqual(1);
    };
    await next.click();
    await expectLineSettled(1);
    await expect(status).toHaveAttribute('aria-label', locale === 'en' ? '2 of 3' : '第 2 条，共 3 条');
    await next.click();
    await expectLineSettled(2);
    await expect(status).toHaveAttribute('aria-label', locale === 'en' ? '3 of 3' : '第 3 条，共 3 条');
    await expect(next).toBeDisabled();
    await previous.click();
    await expectLineSettled(1);
    await expect(status).toHaveAttribute('aria-label', locale === 'en' ? '2 of 3' : '第 2 条，共 3 条');
    await page.screenshot({ path: testInfo.outputPath(`${locale}-line-controls.png`) });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);

    // The contact entry stays available in the following section as well.
    await pages.evaluate((element) => {
      window.scrollTo(0, window.scrollY + element.getBoundingClientRect().bottom + 40);
    });
    await expect(contacts).toBeVisible();
  });
}
