import { expect, test } from '@playwright/test';

// The local preview reads the public upstream; browser checks must not write to it.
test.beforeEach(async ({ page }) => {
  await page.route('**/*', async route => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())) await route.continue();
    else await route.fulfill({ status: 200, contentType: 'application/json', body: '{"code":0,"data":{}}' });
  });
});

test('valid resource pages remain available and the page after the last returns 404', async ({ page }, info) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto('/en/news?page=2');
  expect(response?.status()).toBe(200);
  await expect(page.locator('[data-news-id]')).toHaveCount(10);
  const pagination = page.getByRole('navigation', { name: 'Resource pages' });
  await expect(pagination.locator('[aria-current="page"]')).toHaveText('2');

  // Follow visible page links, so the test keeps working as articles are added.
  let lastPage = 2;
  for (let step = 0; step < 20; step++) {
    if (await pagination.getByRole('link', { name: 'Next', exact: true }).count() === 0) break;
    const lastLink = pagination.getByRole('link', { name: /^Page \d+$/ }).last();
    lastPage = Number(await lastLink.textContent());
    await lastLink.click();
    await expect(pagination.locator('[aria-current="page"]')).toHaveText(String(lastPage));
    await expect(page.locator('[data-news-id]').first()).toBeVisible();
  }
  await expect(pagination.getByRole('link', { name: 'Next', exact: true })).toHaveCount(0);
  expect((await page.reload())?.status()).toBe(200);
  await expect(page.locator('[data-news-id]').first()).toBeVisible();
  await pagination.scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath('last-valid-page.png') });
  await info.attach('last-page', { body: JSON.stringify({ lastPage }), contentType: 'application/json' });
  expect((await page.goto(`/en/news?page=${lastPage + 1}`))?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Resource page not found' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('Chinese pagination, malformed numbers and existing filtered results keep the correct status', async ({ request }) => {
  test.setTimeout(120_000);
  const valid = await request.get('/zh/news?page=2');
  expect(valid.status()).toBe(200);
  expect(await valid.text()).toContain('data-news-id');
  for (const path of ['/zh/news?page=100', '/en/news?page=0', '/en/news?page=abc', '/en/news?page=2&page=3']) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
    expect(response.headers()['x-robots-tag'], path).toBe('noindex');
  }
  const filtered = await request.get('/en/news?page=100&q=annealing');
  expect(filtered.status()).toBe(200);
  expect(await filtered.text()).toContain('data-news-id');
});

for (const width of [1440, 390]) {
  test(`missing resource page is usable and returns to the list at ${width}px`, async ({ page }, info) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    const response = await page.goto('/en/news?page=100');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Resource page not found' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: info.outputPath('missing-page.png') });
    await page.getByRole('link', { name: 'Return to Resources', exact: true }).click();
    await expect(page).toHaveURL(/\/en\/news$/);
    await expect(page.locator('[data-news-id]').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: info.outputPath('returned-to-list.png') });
    if (width === 390) {
      expect((await page.goto('/zh/news?page=100'))?.status()).toBe(404);
      await expect(page.getByRole('heading', { name: '资料分页不存在' })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: info.outputPath('missing-page-zh.png') });
      await page.getByRole('link', { name: '返回资料中心', exact: true }).click();
      await expect(page).toHaveURL(/\/zh\/news$/);
      await expect(page.locator('[data-news-id]').first()).toBeVisible();
    }
  });
}
