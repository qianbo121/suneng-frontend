import { expect, test, type Page } from '@playwright/test';

const viewports = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'tablet-1024', width: 1024, height: 768 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-375', width: 375, height: 812 },
] as const;

async function scrollIntoHomepageContent(page: Page) {
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.locator('[data-sticky-engineer-dock]').waitFor({ state: 'attached' });
  await page.waitForTimeout(50);
  await page.mouse.wheel(0, page.viewportSize()?.height ?? 900);
}

test.describe('homepage sticky engineer dock', () => {
  for (const viewport of viewports) {
    test(`${viewport.name} follows the reading zones and stays inside the viewport`, async ({
      page,
    }, testInfo) => {
      const consoleErrors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });

      await page.setViewportSize(viewport);
      await page.goto('/zh', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle').catch(() => undefined);

      const dock = page.locator('[data-sticky-engineer-dock]');
      await expect(dock).toHaveAttribute('data-visible', 'false');

      await scrollIntoHomepageContent(page);
      await expect(dock).toHaveAttribute('data-visible', 'true');
      await expect(dock).toBeVisible();

      await expect
        .poll(async () => {
          const box = await dock.boundingBox();
          return box ? box.y + box.height : Number.POSITIVE_INFINITY;
        })
        .toBeLessThanOrEqual(viewport.height);

      const dockBox = await dock.boundingBox();
      expect(dockBox).not.toBeNull();
      expect(dockBox!.x).toBeGreaterThanOrEqual(0);
      expect(dockBox!.x + dockBox!.width).toBeLessThanOrEqual(viewport.width);
      expect(dockBox!.y + dockBox!.height).toBeLessThanOrEqual(viewport.height);
      expect(
        await dock
          .locator('img')
          .first()
          .evaluate((image: HTMLImageElement) => image.naturalWidth),
      ).toBeGreaterThan(0);

      await page.screenshot({
        path: testInfo.outputPath(`${viewport.name}-engineer-dock.png`),
        animations: 'disabled',
      });

      const contactButton = dock.locator(`button[aria-controls="sticky-engineer-contact-panel"]`);
      await contactButton.click();
      await expect(contactButton).toHaveAttribute('aria-expanded', 'true');

      const contactPanel = page.getByLabel('联系技术工程师');
      await expect(contactPanel).toBeVisible();
      const panelBox = await contactPanel.boundingBox();
      expect(panelBox).not.toBeNull();
      expect(panelBox!.x).toBeGreaterThanOrEqual(0);
      expect(panelBox!.x + panelBox!.width).toBeLessThanOrEqual(viewport.width);
      expect(panelBox!.y).toBeGreaterThanOrEqual(0);
      expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(viewport.height);

      const wechatButton = contactPanel.getByRole('button', { name: /微信咨询/ });
      const wechatQr = page.getByAltText('江苏苏能工业炉微信二维码');
      await expect(wechatQr).toBeVisible();
      await wechatButton.click();
      await expect(wechatQr).toBeHidden();
      await wechatButton.click();
      await expect(wechatQr).toBeVisible();

      if (viewport.name === 'desktop-1440' || viewport.name === 'mobile-390') {
        await page.screenshot({
          path: testInfo.outputPath(`${viewport.name}-contact-panel.png`),
          animations: 'disabled',
        });
      }

      await page.keyboard.press('Escape');
      await expect(contactPanel).toBeHidden();
      await expect(contactButton).toHaveAttribute('aria-expanded', 'false');

      await dock.getByRole('link', { name: '提交工况' }).click();
      await expect(page).toHaveURL(/#homepage-lead-form$/);
      await expect(dock).toHaveAttribute('data-visible', 'false');

      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await expect(dock).toHaveAttribute('data-visible', 'false');

      await page.evaluate(() => {
        const leadForm = document.getElementById('homepage-lead-form');
        if (!leadForm) throw new Error('Homepage lead form was not found');
        window.scrollTo(0, leadForm.offsetTop - window.innerHeight - 200);
      });
      await expect(dock).toHaveAttribute('data-visible', 'true');

      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(dock).toHaveAttribute('data-visible', 'false');

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(hasHorizontalOverflow).toBe(false);
      expect(consoleErrors).toEqual([]);
    });
  }

  test('desktop contact actions reuse the verified contact settings', async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
      origin: 'http://127.0.0.1:3002',
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/zh', { waitUntil: 'domcontentloaded' });
    await scrollIntoHomepageContent(page);

    const dock = page.locator('[data-sticky-engineer-dock]');
    await expect(dock).toHaveAttribute('data-visible', 'true');
    await dock.getByRole('button', { name: '联系工程师' }).click();

    const contactPanel = page.getByLabel('联系技术工程师');
    const phoneRow = contactPanel.getByRole('button', { name: /电话咨询/ });
    await phoneRow.click();
    await expect(phoneRow.getByRole('status')).toHaveText('已复制');
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('130');

    const emailRow = contactPanel.getByRole('button', { name: /邮箱发资料/ });
    await emailRow.click();
    await expect(emailRow.getByRole('status')).toHaveText('已复制');
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('@');

    await page.keyboard.press('Escape');
    await expect(contactPanel).toBeHidden();
  });

  test('closing the dock keeps it hidden for the current browser session', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/zh', { waitUntil: 'domcontentloaded' });
    await scrollIntoHomepageContent(page);

    const dock = page.locator('[data-sticky-engineer-dock]');
    await expect(dock).toHaveAttribute('data-visible', 'true');
    await dock.getByRole('button', { name: '关闭工程师咨询横条' }).click();
    await expect(dock).toHaveAttribute('data-visible', 'false');
    await expect
      .poll(() => page.evaluate(() => sessionStorage.getItem('suneng_sticky_engineer_closed')))
      .toBe('1');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await scrollIntoHomepageContent(page);
    await expect(dock).toHaveAttribute('data-visible', 'false');
  });

  test('the Chinese homepage dock does not alter the English homepage', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => undefined);

    await expect(page.locator('[data-sticky-engineer-dock]')).toHaveCount(0);
    await expect(page.getByText('还不确定该选哪种炉型？')).toHaveCount(0);
  });

  test('a successful homepage inquiry permanently hides the dock', async ({ page }) => {
    await page.addInitScript(() => {
      const originalFetch = window.fetch.bind(window);
      window.fetch = (input, init) => {
        const url =
          typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        if (url.includes('/v2/custom-requirements')) {
          return Promise.resolve(
            new Response(JSON.stringify({ code: 0, data: { submissionId: 9001 }, message: 'ok' }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }),
          );
        }
        return originalFetch(input, init);
      };
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/zh', { waitUntil: 'domcontentloaded' });
    await scrollIntoHomepageContent(page);

    const dock = page.locator('[data-sticky-engineer-dock]');
    await expect(dock).toHaveAttribute('data-visible', 'true');
    await dock.getByRole('link', { name: '提交工况' }).click();

    await page.getByLabel('1. 项目方向').selectOption('单体工业炉新建');
    await page.getByLabel('2. 当前情况或主要问题').fill('需要处理轴类工件，确认炉型方向。');
    await page.getByLabel('3. 公司或联系人').fill('测试企业 张工');
    await page.getByLabel('4. 联系方式（填一种即可）').fill('13052986814');
    await page.getByRole('button', { name: '提交项目情况' }).click();

    await expect(page.getByText('项目情况已经收到')).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('suneng_sticky_engineer_converted')))
      .toBe('1');

    await page.evaluate(() => window.scrollTo(0, 900));
    await expect(dock).toHaveAttribute('data-visible', 'false');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await scrollIntoHomepageContent(page);
    await expect(dock).toHaveAttribute('data-visible', 'false');
  });
});
