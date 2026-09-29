import { expect, test } from '@playwright/test';

for (const locale of ['zh', 'en'] as const) {
  for (const width of [1440, 390]) {
    test(`${locale} homepage keeps its primary heading when the carousel changes at ${width}px`, async ({ page }, info) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.route('**/*', route => ['GET', 'HEAD', 'OPTIONS'].includes(route.request().method()) ? route.continue() : route.abort());
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`/${locale}`, { waitUntil: 'domcontentloaded' });
      const title = locale === 'zh' ? '江苏苏能工业炉有限公司' : 'Jiangsu Suneng Industrial Furnace Co., Ltd.';
      const secondTitle = locale === 'zh' ? '自主制造基地' : 'Our Manufacturing Base';
      const firstButton = page.getByRole('button', { name: locale === 'zh' ? `查看第 1 张：${title}` : `Slide 1: ${title}`, exact: true });
      const secondButton = page.getByRole('button', { name: locale === 'zh' ? `查看第 2 张：${secondTitle}` : `Slide 2: ${secondTitle}`, exact: true });
      await expect(firstButton).toBeVisible();
      await firstButton.click();
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toHaveCount(1);
      await expect(heading).toHaveText(title);
      // Keyboard activation also has to retain a document heading outside
      // whichever visual copy layer the carousel hides from assistive tools.
      await secondButton.focus();
      await page.keyboard.press('Enter');
      await expect(secondButton).toHaveAttribute('aria-current', 'true');
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(heading).toHaveText(title);
      expect(await heading.evaluate(n => Boolean(n.closest('[aria-hidden="true"]')))).toBe(false);
      const carousel = page.locator('section[aria-roledescription]');
      await expect.poll(() => carousel.evaluate(section => {
        const layers = Array.from(section.children).filter(n => n.querySelector('p'));
        return layers.every(n => getComputedStyle(n).opacity === (n.getAttribute('aria-hidden') === 'true' ? '0' : '1'));
      })).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      await page.screenshot({ path: info.outputPath(`${locale}-home-${width}-slide2.png`) });
      await firstButton.click();
      await expect(firstButton).toHaveAttribute('aria-current', 'true');
      await expect(heading).toHaveText(title);
      expect(errors).toEqual([]);
    });
  }
}
