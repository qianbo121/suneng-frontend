import { expect, test } from '@playwright/test';

test('mobile inquiry direction options remain visible above the form', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/zh/inquiry');
  await page.evaluate(() => {
    const current = window as Window & { __inquiryVisibilitySubmitAttempts?: number };
    current.__inquiryVisibilitySubmitAttempts = 0;
    document.addEventListener('submit', (event) => {
      if ((event.target as Element).matches('[data-contact-form]')) {
        current.__inquiryVisibilitySubmitAttempts! += 1;
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  });
  const form = page.locator('[data-contact-form]');
  const trigger = form.locator('button[aria-haspopup="listbox"]');
  await trigger.click();
  const menu = form.getByRole('listbox');
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute('data-placement', 'above');
  await expect.poll(() => menu.evaluate((element) => {
    const options = Array.from(element.querySelectorAll('[role="option"]'));
    return options.length === 6 && options.every((option) => {
      const box = option.getBoundingClientRect();
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      return y >= 0 && y < innerHeight && element.contains(document.elementFromPoint(x, y));
    });
  })).toBe(true);
  await page.screenshot({ path: info.outputPath('complete-direction-menu.png') });
  await menu.getByRole('option', { name: '新建热处理生产线', exact: true }).click();
  await expect(trigger).toContainText('新建热处理生产线');
  await expect(trigger).toBeFocused();
  await expect(menu).toHaveCount(0);
  expect(await page.evaluate(() => (window as Window & {
    __inquiryVisibilitySubmitAttempts?: number;
  }).__inquiryVisibilitySubmitAttempts)).toBe(0);
  await page.screenshot({ path: info.outputPath('selected-direction.png') });
  expect(errors).toEqual([]);
});
