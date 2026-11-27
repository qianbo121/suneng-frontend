import { expect, test, type Locator } from './fixtures/release-test';

async function expectClearOfToolbar(content: Locator, toolbar: Locator) {
  await expect(content).toBeVisible();
  const contentBox = await content.boundingBox();
  const toolbarBox = await toolbar.boundingBox();
  expect(contentBox).not.toBeNull();
  expect(toolbarBox).not.toBeNull();
  const rightEdge = contentBox!.x + contentBox!.width;
  expect(toolbarBox!.x - rightEdge).toBeGreaterThanOrEqual(15.5);
}

for (const width of [1280, 1440]) {
  test(`product copy and process map clear the contact toolbar at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/en/products/detail/fastener-quench-temper-line');
    const toolbar = page.locator('[data-contact-toolbar]');
    await expectClearOfToolbar(page.locator('#configuration > div').first(), toolbar);
    await expectClearOfToolbar(page.locator('#delivery-scope > div').first(), toolbar);

    await page.goto('/zh/products/detail/cylinder-curing-line');
    await expectClearOfToolbar(page.locator('[data-process-section] > div').first(), toolbar);
  });
}

test('phone product copy keeps its normal width and the contact bar stays at the bottom', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/products/detail/fastener-quench-temper-line');
  const copy = await page.locator('#delivery-scope > div').first().boundingBox();
  const toolbar = await page.locator('[data-contact-toolbar]').boundingBox();
  expect(copy?.x).toBe(16);
  expect(copy?.width).toBe(358);
  expect(toolbar?.width).toBe(390);
  expect(toolbar!.y + toolbar!.height).toBe(844);
});
