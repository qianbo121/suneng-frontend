import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/*', async route => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"code":0,"data":{},"message":"local-test-only"}' });
    } else await route.continue();
  });
});

for (const width of [1440, 390]) {
  test.describe(`${width}px SEO entry navigation`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 1000 }, contextOptions: { reducedMotion: 'reduce' } });

    test('legacy company entries preserve source markers and repeated query values', async ({ page }) => {
      for (const locale of ['zh', 'en']) {
        for (const [path, section] of [['partner', 'projects'], ['strength/honors', 'qualifications']]) {
          await page.goto(`/${locale}/${path}?acquisition_qa=ACQUISITION_QA_REDIRECT_20261020&utm_source=legacy%20entry&tag=a&tag=b`);
          await expect(page).toHaveURL(new RegExp(`/${locale}/about\\?.*#${section}$`));
          const url = new URL(page.url());
          expect(url.searchParams.get('acquisition_qa')).toBe('ACQUISITION_QA_REDIRECT_20261020');
          expect(url.searchParams.get('utm_source')).toBe('legacy entry');
          expect(url.searchParams.getAll('tag')).toEqual(['a', 'b']);
          await expect(page.locator(`#${section}`)).toBeInViewport();
        }
      }
    });

    test('home line link lands below the fixed header', async ({ page }) => {
      await page.goto('/en');
      await page.getByRole('link', { name: /Plan a heat-treatment line/ }).click();
      await expect(page).toHaveURL(/\/en\/products#production-line-title$/);
      const heading = page.locator('#production-line-title');
      await expect(heading).toBeInViewport();
      await expect.poll(() => heading.evaluate(element => {
        const rect = element.getBoundingClientRect();
        const header = document.querySelector('header')?.getBoundingClientRect();
        return scrollY > 0 && rect.top >= (header?.bottom ?? 0) && rect.bottom <= innerHeight;
      })).toBe(true);
      await expect(page.locator('[data-production-line-card]').first()).toBeVisible();
    });

    test('four furnace inquiry links open the visible prefilled contact form', async ({ page }) => {
      test.setTimeout(120_000);
      for (const slug of ['shovel-furnace', 'walking-beam-furnace', 'elevator-hearth-furnace', 'gas-nitriding-furnace']) {
        await page.goto(`/en/products/detail/${slug}`, { waitUntil: 'domcontentloaded' });
        await page.getByRole('link', { name: 'Request selection advice', exact: true }).filter({ visible: true }).first().click();
        await expect(page).toHaveURL(new RegExp(`/en/about\\?product=${slug}#contact-inquiry-form-fields$`));
        const form = page.locator('#contact-inquiry-form-fields');
        await expect(form).toBeVisible();
        await expect.poll(() => form.evaluate(element => {
          const rect = element.getBoundingClientRect();
          const header = document.querySelector('header')?.getBoundingClientRect();
          return scrollY > 0 && rect.top >= (header?.bottom ?? 0) && rect.top < innerHeight;
        })).toBe(true);
        await expect(form.locator('textarea')).not.toHaveValue('');
      }
    });
  });
}
