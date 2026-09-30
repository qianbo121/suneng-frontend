import { expect, test } from '@playwright/test';

test('desktop contacts share a dialog and copy the selected contact', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/zh', { waitUntil: 'networkidle' });
  const toolbar = page.getByRole('navigation', { name: '快捷联系苏能' });
  for (const entry of [
    { label: '微信联系', role: 'button' as const, copy: '复制微信号', value: 'suneng2005' },
    { label: '电话联系', role: 'link' as const, copy: '复制电话号码', value: '13052986814' },
    { label: '邮箱联系', role: 'link' as const, copy: '复制邮箱地址', value: '997518512@qq.com' },
  ]) {
    const trigger = toolbar.getByRole(entry.role, { name: entry.label, exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: entry.label, exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: entry.label }).locator('svg')).toHaveCount(0);
    await dialog.getByRole('button', { name: entry.copy, exact: true }).click();
    await expect(dialog.getByRole('button', { name: '已复制', exact: true })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(entry.value);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
});

test.describe('phone browser', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
  });

  test('phone opens the dialer path; WeChat and email use matching sheets', async ({ page }) => {
    await page.goto('/zh', { waitUntil: 'networkidle' });
    const toolbar = page.getByRole('navigation', { name: '快捷联系苏能' });
    // Observe the app handler, then stop the external call in this test only.
    await page.evaluate(() => {
      document.addEventListener('click', (event) => {
        if ((event.target as Element).closest('a[href^="tel:"]')) {
          document.body.dataset.phonePrevented = String(event.defaultPrevented);
          event.preventDefault();
        }
      });
    });
    const phone = toolbar.getByRole('link', { name: '电话联系', exact: true });
    await expect(phone).toHaveAttribute('href', 'tel:+8613052986814');
    await phone.click();
    await expect(page.locator('body')).toHaveAttribute('data-phone-prevented', 'false');
    await expect(page.getByRole('dialog')).toHaveCount(0);

    for (const entry of [
      { label: '微信联系', role: 'button' as const },
      { label: '邮箱联系', role: 'link' as const },
    ]) {
      // Click the upper part, clear of Next's development-only corner indicator.
      await toolbar.getByRole(entry.role, { name: entry.label, exact: true }).click({ position: { x: 72, y: 14 } });
      const dialog = page.getByRole('dialog', { name: entry.label, exact: true });
      await expect(dialog).toBeVisible();
      const box = await dialog.boundingBox();
      expect(box?.width).toBe(390);
      expect(Math.round((box?.y ?? 0) + (box?.height ?? 0))).toBe(844);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(dialog.getByRole('link', { name: '电话联系', exact: true })).toHaveCount(0);
      await dialog.getByRole('button', { name: '关闭联系弹窗', exact: true }).click();
      await expect(dialog).toHaveCount(0);
    }
  });
});
