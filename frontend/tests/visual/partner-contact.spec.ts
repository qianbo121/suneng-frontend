import { expect, test } from '@playwright/test';

test('partner consultation reaches published contact information', async ({ page }) => {
  await page.goto('/zh/partner', { waitUntil: 'domcontentloaded' });
  await page.getByRole('link', { name: '沟通设备需求', exact: true }).click();
  await expect(page.getByRole('heading', { name: '联系我们', level: 1 })).toBeVisible();
  await expect(
    page.getByRole('link', { name: '+86-130-5298-6814', exact: true }).first(),
  ).toHaveAttribute('href', /^tel:/);
});

test('mobile industry filter responds on the first click with map details open', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/zh/partner', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.suneng-map[data-enhanced="true"]')).toBeVisible();
  await page.getByRole('combobox', { name: '查看省份', exact: true }).selectOption('450000');
  await expect(page.getByRole('region', { name: '广西壮族自治区', exact: true })).toBeVisible();
  const automotive = page.getByRole('button', { name: '汽车零部件', exact: true });
  await automotive.click();
  await expect(automotive).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-partner-directory] tbody tr:visible')).toHaveCount(5);
});
