import { expect, test, type Page } from '@playwright/test';

// Browser form checks deliberately intercept every mutation: the preview uses production upstream.
async function preventExternalWrites(page: Page) {
  await page.route('**/*', async (route) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"code":0,"data":{}}' });
    } else await route.continue();
  });
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
}

for (const width of [1440, 390]) {
  test(`partner page keeps the Chinese structure and English interactions at ${width}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await preventExternalWrites(page);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto('/en/partner');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/en\/partner$/);
    await expect(page.getByRole('heading', { name: 'Customers & Partners', exact: true })).toBeVisible();
    await expect(page.locator('link[rel=alternate][hreflang="en-US"]')).toHaveAttribute('href', /\/en\/partner$/);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', /\/en\/partner$/);
    const regions = page.locator('[data-about-subpage=partners]');
    const marker = page.locator('summary[data-province-code="320000"]');
    if (width < 600) await page.getByRole('combobox', { name: 'Region', exact: true }).selectOption('320000');
    else await marker.click();
    const popup = page.locator('details[open] .suneng-map-popup');
    await expect(popup.getByRole('heading', { name: 'Jiangsu', exact: true })).toBeVisible();
    await expect(popup.locator('tbody tr').first()).toBeVisible();
    await noOverflow(page);
    const insetFits = await page.locator('.suneng-map-inset-label').evaluate((element) => {
      const label = element.getBoundingClientRect();
      const stage = element.closest('.suneng-map-stage')!.getBoundingClientRect();
      return label.right <= stage.right && label.bottom <= stage.bottom && label.left >= stage.left;
    });
    expect(insetFits).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`partner-map-${width}.png`), fullPage: true });
    await popup.getByRole('button', { name: 'Close Jiangsu Companies' }).click();
    const directory = page.locator('[data-partner-directory]');
    await directory.getByRole('button', { name: 'Energy Equipment', exact: true }).click();
    await expect(directory.getByRole('status')).toContainText('Energy Equipment');
    await expect(directory.locator('tbody tr:visible').first()).toBeVisible();
    await directory.getByRole('searchbox').fill('NO_MATCH_20260925');
    await expect(directory.getByText('No matching companies found.')).toBeVisible();
    await directory.getByRole('button', { name: 'Clear Filters', exact: true }).click();
    await directory.getByRole('searchbox').fill('Engineering Design');
    await expect(directory.locator('tbody tr:visible').first()).toBeVisible();
    await directory.getByRole('searchbox').fill('');
    const expand = directory.getByRole('button', { name: /Show All \d+ Companies/ });
    await expand.click();
    expect(await directory.locator('tbody tr:visible').count()).toBeGreaterThan(8);
    await directory.getByRole('button', { name: 'Show Less', exact: true }).click();
    await page.locator('[data-partner-industries] summary').click();
    await expect(page.locator('[data-partner-industries] article')).toHaveCount(6);
    for (const href of await page.locator('[data-partner-industries] a').evaluateAll((links) => links.map((link) => link.getAttribute('href')))) {
      expect(href).toMatch(/^\/en\/products\/detail\//);
    }
    await noOverflow(page);
    await page.screenshot({ path: testInfo.outputPath(`partner-directory-${width}.png`) });
    const englishStructure = await regions.locator('h1,h2,[data-partner-industries] article').evaluateAll((elements) => elements.map((element) => element.tagName));
    if (width < 600) await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('link', { name: '中文', exact: true }).click();
    await expect(page).toHaveURL(/\/zh\/partner$/);
    await expect(page.getByRole('heading', { name: '合作客户', exact: true })).toBeVisible();
    const chineseStructure = await regions.locator('h1,h2,[data-partner-industries] article').evaluateAll((elements) => elements.map((element) => element.tagName));
    expect(chineseStructure).toEqual(englishStructure);
    await noOverflow(page);
    expect(errors).toEqual([]);
  });

  test(`resource recommendations and overseas delivery at ${width}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await preventExternalWrites(page);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const locale of ['en', 'zh']) {
      await page.goto(`/${locale}/news`);
      const recommendations = page.locator('[data-priority-news]');
      await expect(recommendations.getByRole('link')).toHaveCount(7);
      const hrefs = await recommendations.getByRole('link').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
      expect(hrefs.every((href) => href?.startsWith(`/${locale}/news/`))).toBe(true);
      await recommendations.scrollIntoViewIfNeeded();
      await noOverflow(page);
      await page.screenshot({ path: testInfo.outputPath(`resources-${locale}-${width}.png`) });
      await recommendations.getByRole('link').first().click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/news/.+`));
      await expect(page.locator('h1')).toBeVisible();
      await page.goto(`/${locale}/contact`);
      await page.getByRole('link', { name: locale === 'en' ? 'Planning an overseas project? View the delivery checklist.' : '规划海外项目？查看交付核对清单。' }).click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/service/installation-after-sales#overseas-delivery$`));
      const delivery = page.locator('#overseas-delivery');
      await expect(delivery.getByRole('heading')).toBeVisible();
      await expect(delivery.locator('tbody tr')).toHaveCount(7);
      await noOverflow(page);
      await page.screenshot({ path: testInfo.outputPath(`delivery-${locale}-${width}.png`) });
      await delivery.getByRole('link').click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/contact$`));
    }
    expect(errors).toEqual([]);
  });

  for (const locale of ['en', 'zh']) {
    test(`controlled ${locale} inquiry failure, retry and receipt at ${width}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 });
      await preventExternalWrites(page);
      const payloads: Record<string, unknown>[] = [];
      await page.route('**/api/v2/custom-requirements', async (route) => {
        payloads.push(route.request().postDataJSON());
        const attempt = payloads.length;
        await route.fulfill({ status: attempt === 1 ? 503 : 200, contentType: 'application/json',
          body: JSON.stringify(attempt === 1 ? { message: 'Controlled failure' } : { code: 0, data: attempt === 2 ? {} : { submissionId: `CONTROLLED-${locale}-${width}` }, message: '' }) });
      });
      await page.goto(`/${locale}/contact`);
      await page.locator('[aria-controls="contact-message-panel"]').click();
      const form = page.locator('#contact-inquiry-form form');
      await expect(form).toBeVisible();
      await form.locator('button[type=submit]').click();
      expect(payloads).toHaveLength(0);
      await form.locator('#homepage-direction-trigger').click();
      await page.getByRole('option', { name: locale === 'en' ? 'After-sales or other support' : '售后或其他', exact: true }).click();
      await form.locator('textarea[name=problem]').fill(`CONTROLLED TEST ${locale} ${width} — no external submission`);
      await form.locator('input[name=identity]').fill('Site Acceptance Test');
      await form.locator('input[name=contact]').fill('site-acceptance@example.invalid');
      for (let attempt = 1; attempt <= 2; attempt++) {
        await form.locator('button[type=submit]').click();
        await expect(form.getByRole('alert')).toContainText(locale === 'en' ? 'Unable to submit' : '暂时没有提交成功');
        await expect(form.locator('input[name=contact]')).toHaveValue('site-acceptance@example.invalid');
        await expect.poll(() => payloads.length).toBe(attempt);
      }
      await form.locator('button[type=submit]').click();
      const result = page.locator('#contact-inquiry-form [role=status]');
      await expect(result).toContainText(`CONTROLLED-${locale}-${width}`);
      await expect(result).toContainText(locale === 'en' ? 'We have received your project details' : '项目情况已经收到');
      expect(payloads).toHaveLength(3);
      expect(new Set(payloads.map((item) => item.idempotencyKey)).size).toBe(1);
      expect(payloads.every((item) => item.locale === locale && item.formVariant === 'homepage_minimal')).toBe(true);
      await noOverflow(page);
      await page.screenshot({ path: testInfo.outputPath(`inquiry-${locale}-${width}.png`) });
      await result.getByRole('button').click();
      await expect(form.locator('input[name=contact]')).toHaveValue('');
    });
  }
}
