import { expect, test } from '@playwright/test';

const slug = 'visual-test-article-directory';

for (const width of [1440, 1280, 390]) {
  for (const locale of ['zh', 'en']) {
    test(`article directory and contact remain usable in ${locale} at ${width}px`, async ({
      page,
    }, info) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      expect(
        (await page.goto(`/${locale}/news/${slug}`, { waitUntil: 'domcontentloaded' }))?.status(),
      ).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('#news-detail-title')).toBeVisible();
      const label = locale === 'en' ? 'On this page' : '文章目录';
      if (width === 390) await page.locator('summary').filter({ hasText: label }).click();
      const directory = page.getByRole('navigation', { name: label, exact: true });
      await expect(directory).toBeVisible();
      const link = directory.getByRole('link').nth(1);
      const target = await link.getAttribute('href');
      expect(target).toMatch(/^#news-body-/);
      await page.screenshot({ path: info.outputPath(`article-${locale}-${width}.png`) });
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${target}$`));
      await expect(page.locator(target!)).toBeFocused();
      await expect
        .poll(() =>
          page
            .locator(target!)
            .evaluate((element) => Math.round(element.getBoundingClientRect().top)),
        )
        .toBeGreaterThanOrEqual(90);
      if (width === 390)
        await expect(
          page.locator('details').filter({ has: page.locator('summary', { hasText: label }) }),
        ).not.toHaveAttribute('open');

      const resources = page.getByRole('complementary', {
        name: locale === 'en' ? 'Article resources' : '文章辅助资料',
      });
      const related = resources.getByRole('region', {
        name: locale === 'en' ? 'Related articles' : '相关文章',
      });
      await expect(related).toBeVisible();
      const articleLinks = related.locator(`a[href^="/${locale}/news/"]`);
      expect(await articleLinks.count()).toBeGreaterThan(0);
      expect(
        await articleLinks.evaluateAll((links) =>
          links.every(
            (link) => !link.getAttribute('href')?.endsWith(location.pathname.split('/').pop()!),
          ),
        ),
      ).toBe(true);
      const trigger = resources.getByRole('button', {
        name: locale === 'en' ? 'Contact via WeChat' : '微信联系',
        exact: true,
      });
      await trigger.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      const close = dialog.getByRole('button', {
        name: locale === 'en' ? 'Close contact dialog' : '关闭企微联系弹窗',
      });
      await expect(close).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(
        dialog.getByRole('link', { name: locale === 'en' ? 'Email documents' : '邮箱发资料' }),
      ).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(close).toBeFocused();
      const qr = dialog.getByRole('img');
      await expect
        .poll(() =>
          qr.evaluate(
            (image) =>
              (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0,
          ),
        )
        .toBe(true);
      expect(
        await dialog.evaluate((element) => element.getBoundingClientRect().right <= innerWidth),
      ).toBe(true);
      await page.screenshot({ path: info.outputPath(`contact-${locale}-${width}.png`) });
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(errors).toEqual([]);
    });
  }
}

test('short articles omit the empty directory and keep contact available', async ({ page }) => {
  await page.goto('/en/news/visual-test-annealing-selection', { waitUntil: 'networkidle' });
  await expect(page.locator('#news-detail-title')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'On this page' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Contact via WeChat', exact: true })).toBeVisible();
});
