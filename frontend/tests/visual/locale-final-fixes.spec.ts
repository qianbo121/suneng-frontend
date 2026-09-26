import { expect, test } from '@playwright/test';

// The local preview reads the public upstream; browser checks must not write to it.
test.beforeEach(async ({ page }) => {
  await page.route('**/*', async route => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())) await route.continue();
    else await route.fulfill({ status: 200, contentType: 'application/json', body: '{"code":0,"data":{}}' });
  });
});

const reviewed = [
  'atmosphere-furnace-pressure-fluctuation-process-or-equipment',
  'heat-treatment-furnace-loading-rack-fixture-selection',
  'multi-product-heat-treatment-furnace-changeover-boundaries',
];
const untranslated = [
  'gas-cylinder-curing-oven-slow-heating',
  'heat-treatment-basket-turnover-quantity',
  'multi-station-curing-oven-independent-operation',
];

test('untranslated articles use Resources while published counterparts retain same-article switching', async ({ page }, info) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const slug of untranslated) {
    expect((await page.goto(`/zh/news/${slug}`, { waitUntil: 'networkidle' }))?.status()).toBe(200);
    await expect(page.locator('#news-detail-title')).toBeVisible();
    const link = page.getByRole('link', { name: 'EN', exact: true });
    await expect(link).toHaveAttribute('href', '/en/news');
    await expect(link).toHaveAttribute('title', /English resources/);
    expect(await page.locator('link[rel="alternate"][hreflang="en-US"]').count()).toBe(0);
  }
  await page.getByRole('link', { name: 'EN', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/news$/);
  await expect(page.locator('[data-news-id]').first()).toBeVisible();

  await page.goto(`/zh/news/${reviewed[0]}`, { waitUntil: 'networkidle' });
  const desktopEnglish = page.getByRole('link', { name: 'EN', exact: true });
  await expect(desktopEnglish).toHaveAttribute('href', `/en/news/${reviewed[0]}`);
  await desktopEnglish.click();
  await expect(page).toHaveURL(new RegExp(`/en/news/${reviewed[0]}$`));
  await expect(page.locator('#news-detail-title')).toBeVisible();
  await page.getByRole('link', { name: '中文', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/zh/news/${reviewed[0]}$`));
  await expect(page.locator('#news-detail-title')).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/zh/news/${reviewed[0]}`, { waitUntil: 'networkidle' });
  await expect(page.locator('#news-detail-title')).toBeVisible();
  await page.getByRole('button', { name: '打开导航', exact: true }).click();
  const english = page.getByRole('dialog').getByRole('link', { name: 'EN', exact: true });
  await expect(english).toHaveAttribute('href', `/en/news/${reviewed[0]}`);
  await page.screenshot({ path: info.outputPath('mobile-article-switch.png') });
  await english.click();
  await expect(page).toHaveURL(new RegExp(`/en/news/${reviewed[0]}$`));
  await expect(page.locator('#news-detail-title')).toBeVisible();

  await page.goto(`/zh/news/${untranslated[0]}`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '打开导航', exact: true }).click();
  const fallback = page.getByRole('dialog').getByRole('link', { name: 'EN', exact: true });
  await expect(fallback).toHaveAttribute('href', '/en/news');
  await page.screenshot({ path: info.outputPath('mobile-resource-fallback.png') });
  await fallback.click();
  await expect(page).toHaveURL(/\/en\/news$/);
  await expect(page.locator('[data-news-id]').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('missing-page language and title are correct even before JavaScript runs', async ({ browser }, info) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    for (const locale of ['en', 'zh']) {
      const response = await page.goto(`${info.project.use.baseURL}/${locale}/seo-missing-review`);
      expect(response?.status()).toBe(404);
      await expect(page).toHaveTitle(locale === 'en' ? 'Page Not Found | Suneng' : '页面未找到｜苏能工业炉');
      await expect(page.locator('html')).toHaveAttribute('lang', locale === 'en' ? 'en' : 'zh-CN');
      const back = page.getByRole('link', { name: locale === 'en' ? 'Back to Home' : '返回首页', exact: true });
      await expect(back).toHaveAttribute('href', `/${locale}`);
      await expect(back).toBeVisible();
    }
  } finally {
    await context.close();
  }
});


for (const width of [1440, 390]) {
  test(`generic missing pages preserve language and usable return navigation at ${width}px`, async ({ page }, info) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const locale of ['en', 'zh']) {
      const response = await page.goto(`/${locale}/seo-missing-review`, { waitUntil: 'networkidle' });
      expect(response?.status()).toBe(404);
      await expect(page.getByRole('heading', { name: locale === 'en' ? 'Page Not Found' : '页面未找到', exact: true })).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang', locale === 'en' ? 'en' : 'zh-CN');
      await expect(page).toHaveTitle(locale === 'en' ? 'Page Not Found | Suneng' : '页面未找到｜苏能工业炉');
      expect(await page.locator('meta[name="robots"]').evaluateAll(nodes => nodes.some(node => node.getAttribute('content')?.includes('noindex')))).toBe(true);
      const back = page.getByRole('link', { name: locale === 'en' ? 'Back to Home' : '返回首页', exact: true });
      await expect(back).toHaveAttribute('href', `/${locale}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: info.outputPath(`missing-${locale}.png`) });
      // Unmatched URLs require a full document response, including when switching languages.
      if (width === 390) {
        await page.getByRole('button', { name: locale === 'en' ? 'Open navigation' : '打开导航', exact: true }).click();
      }
      const otherLocale = locale === 'en' ? 'zh' : 'en';
      await page.getByRole('link', { name: locale === 'en' ? '中文' : 'EN', exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/${otherLocale}/seo-missing-review$`));
      await expect(page).toHaveTitle(otherLocale === 'en' ? 'Page Not Found | Suneng' : '页面未找到｜苏能工业炉');
      await page.goto(`/${locale}/seo-missing-review`, { waitUntil: 'networkidle' });
      await back.click();
      await expect(page).toHaveURL(new RegExp(`/${locale}$`));
      await expect(page.locator('main h1')).toBeVisible();
      await page.waitForLoadState('networkidle');
      await expect(page).not.toHaveTitle(/Page Not Found|页面未找到/);
    }
    expect(errors).toEqual([]);
  });
}
