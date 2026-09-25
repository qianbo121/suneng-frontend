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
test('reviewed search snippets stay concise without replacing the article headline or full summary', async ({ page }, info) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const evidence = [];
  for (const slug of reviewed) {
    expect((await page.goto(`/en/news/${slug}`, { waitUntil: 'networkidle' }))?.status()).toBe(200);
    await expect(page.locator('#news-detail-title')).toBeVisible();
    await expect(page).toHaveTitle(/Suneng$/);
    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    const headline = await page.locator('#news-detail-title').innerText();
    const structured = await page.locator('script[type="application/ld+json"]').allTextContents();
    const article = structured.flatMap(text => JSON.parse(text)).find(data => data['@type'] === 'Article');
    expect(title.length).toBeLessThan(70);
    expect(description!.length).toBeLessThan(180);
    expect(headline).not.toBe(title);
    expect(article.headline).toBe(headline);
    expect(article.description.length).toBeGreaterThan(description!.length);
    evidence.push({ slug, title, description, headline, fullSummaryLength: article.description.length });
  }
  await info.attach('search-copy', { body: JSON.stringify(evidence, null, 2), contentType: 'application/json' });
  await page.screenshot({ path: info.outputPath('unchanged-article-headline.png') });
});
