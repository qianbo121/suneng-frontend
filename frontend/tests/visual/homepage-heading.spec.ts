import { expect, test } from '@playwright/test';

for (const locale of ['zh', 'en'] as const) {
  for (const width of [1920, 390]) {
    test(`${locale} homepage shows one complete banner at ${width}px`, async ({ page }, info) => {
      const height = width === 1920 ? 930 : 844;
      await page.setViewportSize({ width, height });
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
      expect(imageSource).toContain(width === 1920 ? 'suneng-manufacturing-panorama-factory-' : 'suneng-panorama-line-mobile-');
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
      const accentBox = await partners.locator('span[aria-hidden="true"]').first().boundingBox();
      const taskTitleBox = await page.locator('#task-paths h2').boundingBox();
      if (!accentBox || !taskTitleBox) throw new Error('Expected partner accent and task heading');
      expect(accentBox.x).toBeCloseTo(taskTitleBox.x, 1);
      const partnerBox = await partners.boundingBox();
      if (!box || !partnerBox) throw new Error('Expected both the banner and partners strip to be visible');
      expect(box.y + box.height).toBeCloseTo(partnerBox.y, 0);
      const toolbar = page.locator('[data-contact-toolbar]');
      const toolbarBox = width === 390 ? await toolbar.boundingBox() : null;
      expect(partnerBox.y + partnerBox.height).toBeLessThanOrEqual(toolbarBox?.y ?? height);
      await page.screenshot({
        path: info.outputPath(`${locale}-home-${width}.png`),
        style: 'nextjs-portal { display: none !important; }',
      });

      await expect(hero.getByRole('link', { name: /国家高新技术企业|National High-tech Enterprise/ })).toHaveCount(0);
      expect(errors).toEqual([]);
    });
  }
}

test('all four facts count once without shifting their units or partners', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 720 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const start = new Date('2026-01-01T12:00:00Z');
  await page.clock.install({ time: start });
  await page.clock.pauseAt(new Date(start.getTime() + 1000));
  await page.goto('/zh');

  const facts = page.locator('section[aria-labelledby="hero-title"] dd');
  const digits = facts.locator('[data-final] > span');
  const partners = page.locator('.hero-banner > :last-child');
  const unitPositions = () => facts.locator(':scope > span:last-child').evaluateAll(
    units => units.map(unit => unit.getBoundingClientRect().x),
  );
  await expect(digits).toHaveText(['0', '0', '0', '0']);
  const initialPositions = await unitPositions();
  const initialPartners = await partners.boundingBox();
  await page.clock.runFor(450);
  const targets = [2006, 5080, 1000, 14700];
  const intermediate = (await digits.allTextContents()).map(Number);
  expect(intermediate.every((value, i) => value > 0 && value < targets[i])).toBe(true);
  expect(await unitPositions()).toEqual(initialPositions);
  await page.clock.runFor(650);
  await expect(digits).toHaveText(targets.map(String));
  expect(await unitPositions()).toEqual(initialPositions);
  expect(await partners.boundingBox()).toEqual(initialPartners);
  await page.evaluate(() => { window.scrollBy(0, innerHeight); window.scrollTo(0, 0); });
  await page.clock.runFor(250);
  await expect(digits).toHaveText(targets.map(String));
});
