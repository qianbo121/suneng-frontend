import { expect, test } from '@playwright/test';

for (const locale of ['zh', 'en'] as const) {
  for (const width of [1920, 390]) {
    test(`${locale} homepage shows one complete banner at ${width}px`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: width === 1920 ? 1080 : 844 });
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`/${locale}`, { waitUntil: 'load' });

      const heading = page.getByRole('heading', { level: 1 });
      const title = locale === 'zh' ? '江苏苏能工业炉有限公司' : 'Jiangsu Suneng Industrial Furnace Co., Ltd.';
      await expect(heading).toHaveCount(1);
      await expect(heading).toHaveText(title);
      const hero = page.getByRole('region', { name: title, exact: true });
      await expect(hero.getByRole('button')).toHaveCount(0);
      const images = hero.getByRole('img');
      await expect(images).toHaveCount(1);
      await images.evaluateAll(nodes => Promise.all(nodes.map(node => (node as HTMLImageElement).decode())));
      const imageSource = await images.evaluate((image: HTMLImageElement) => decodeURIComponent(image.currentSrc));
      expect(imageSource).toContain(width === 1920 ? 'suneng-manufacturing-panorama-' : 'suneng-panorama-line-mobile-');
      const box = await hero.boundingBox();
      expect(box?.width).toBe(width);
      if (locale === 'zh') {
        await expect(hero.getByText(/国家高新技术企业/)).toHaveCount(1);
        await expect(hero.getByRole('definition')).toHaveText(['2006 年', '5080 万元', '1000+ 项', '14700 m²']);
      } else {
        await expect(heading).toBeVisible();
        await expect(hero.getByText('National High-tech Enterprise', { exact: true })).toBeVisible();
        if (width === 390) await expect(hero.getByText('Suneng manufacturing site')).toBeVisible();
        await expect(hero.getByRole('definition')).toHaveText(['2006', '50.8 million', '1,000+', '14,700 m²']);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      const partners = page.locator('.hero-banner > :last-child');
      await expect(partners.getByTestId('homepage-partner-track')).toBeVisible();
      const partnerBox = await partners.boundingBox();
      if (!box || !partnerBox) throw new Error('Expected both the banner and partners strip to be visible');
      expect(box.y + box.height).toBeCloseTo(partnerBox.y, 0);
      if (width === 1920) {
        expect(box.height).toBeCloseTo(width / 2.4, 0);
      } else {
        expect(box.height).toBeGreaterThan(width);
      }
      await page.screenshot({
        path: info.outputPath(`${locale}-home-${width}.png`),
        style: 'nextjs-portal { display: none !important; }',
      });

      await expect(hero.getByRole('link', { name: /国家高新技术企业|National High-tech Enterprise/ })).toHaveCount(0);
      expect(errors).toEqual([]);
    });
  }
}
