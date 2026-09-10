import { expect, test } from '@playwright/test';

test('partner consultation reaches published contact information', async ({ page }) => {
  await page.goto('/zh/partner', { waitUntil: 'domcontentloaded' });
  await page.getByRole('link', { name: '沟通设备需求', exact: true }).click();
  await expect(page.getByRole('heading', { name: '联系我们', level: 1 })).toBeVisible();
  await expect(
    page.getByRole('link', { name: '+86-130-5298-6814', exact: true }).first(),
  ).toHaveAttribute('href', /^tel:/);
});
