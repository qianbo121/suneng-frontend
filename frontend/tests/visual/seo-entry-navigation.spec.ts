import { expect, test } from '@playwright/test';
import { additionalFurnaces } from '../../src/lib/additional-furnaces';

test.beforeEach(async ({ page }) => {
  await page.route('**/*', async route => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"code":0,"data":{},"message":"local-test-only"}' });
    } else await route.continue();
  });
});

for (const width of [1440, 390]) {
  test.describe(`${width}px SEO entry navigation`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 1000 }, contextOptions: { reducedMotion: 'reduce' } });

    test('legacy company entries preserve source markers and repeated query values', async ({ page }) => {
      for (const locale of ['zh', 'en']) {
        for (const [path, section] of [['partner', 'projects'], ['strength/honors', 'qualifications']]) {
          await page.goto(`/${locale}/${path}?acquisition_qa=ACQUISITION_QA_REDIRECT_20261020&utm_source=legacy%20entry&tag=a&tag=b`);
          await expect(page).toHaveURL(new RegExp(`/${locale}/about\\?.*#${section}$`));
          const url = new URL(page.url());
          expect(url.searchParams.get('acquisition_qa')).toBe('ACQUISITION_QA_REDIRECT_20261020');
          expect(url.searchParams.get('utm_source')).toBe('legacy entry');
          expect(url.searchParams.getAll('tag')).toEqual(['a', 'b']);
          await expect(page.locator(`#${section}`)).toBeInViewport();
        }
      }
    });

    test('home line link lands below the fixed header', async ({ page }) => {
      await page.goto('/en');
      await page.getByRole('link', { name: /Plan a heat-treatment line/ }).click();
      await expect(page).toHaveURL(/\/en\/products#production-line-title$/);
      const heading = page.locator('#production-line-title');
      await expect(heading).toBeInViewport();
      await expect.poll(() => heading.evaluate(element => {
        const rect = element.getBoundingClientRect();
        const header = document.querySelector('header')?.getBoundingClientRect();
        return scrollY > 0 && rect.top >= (header?.bottom ?? 0) && rect.bottom <= innerHeight;
      })).toBe(true);
      await expect(page.locator('[data-production-line-card]').first()).toBeVisible();
    });

    test('an early inquiry click keeps the form link through startup and history navigation', async ({ page }) => {
      const path = '/zh/products/detail/shovel-furnace?source=selection';
      // Hold the locale layout chunk while the server-rendered link is usable.
      const layoutChunk = (url: URL) =>
        /\/app\/\[locale\]\/layout(?:-[a-z0-9]+)?\.js$/.test(decodeURIComponent(url.pathname));
      let releaseLayout!: () => void;
      const held = new Promise<void>(resolve => { releaseLayout = resolve; });
      const requested = page.waitForRequest(request => layoutChunk(new URL(request.url())));
      await page.route(layoutChunk, async route => {
        await held;
        await route.continue();
      });
      try {
        await page.goto(path, { waitUntil: 'commit' });
        await requested;
        await page.waitForFunction(() => Boolean(Reflect.get(window, 'next')?.router));
        await page.getByRole('link', { name: '提交工况，获取选型建议', exact: true }).filter({ visible: true }).click();
        await expect(page.locator('#inquiry')).toBeInViewport();
      } finally {
        releaseLayout();
      }
      // Wait for the router to write the startup history entry before asserting its URL.
      await page.waitForFunction(() => window.history.state?.__NA === true);
      await expect(page).toHaveURL(path + '#inquiry');
      await expect(page.locator('#inquiry')).toBeInViewport();
      await page.goBack();
      await expect(page).toHaveURL(path);
      await page.goForward();
      await expect(page).toHaveURL(path + '#inquiry');
      await page.reload();
      await expect(page.locator('#inquiry')).toBeInViewport();
      await expect(page).toHaveURL(path + '#inquiry');
    });

    for (const locale of ['zh', 'en'] as const) {
      test(`four furnace inquiry forms stay on the ${locale} product page`, async ({ page }) => {
        test.setTimeout(120_000);
        const en = locale === 'en';
        for (const furnace of additionalFurnaces) {
          const path = `/${locale}/products/detail/${furnace.id}`;
          const name = en ? furnace.nameEn : furnace.name;
          await page.goto(path, { waitUntil: 'domcontentloaded' });
          await expect(page.locator('#selection-inputs li')).toHaveText(
            en ? [...furnace.inputsEn] : [...furnace.inputs],
          );
          const section = page.locator('#inquiry');
          const entry = page.getByRole('link', {
            name: en ? 'Request selection advice' : '提交工况，获取选型建议',
            exact: true,
          }).filter({ visible: true });
          await entry.click();
          await expect(page).toHaveURL(`${path}#inquiry`);
          await expect.poll(() => section.evaluate(element => {
            const top = element.getBoundingClientRect().top;
            const navBottom = document.querySelector('nav[aria-label$="page sections"], nav[aria-label$="章节导航"]')?.getBoundingClientRect().bottom ?? 0;
            return top >= navBottom - 1 && top < innerHeight;
          })).toBe(true);
          const form = section.locator('form');
          await expect(form.locator('textarea')).toHaveValue(en ? `Equipment: ${name}.\n` : `咨询设备：${name}。\n`);
          await expect(form.locator('input[name="direction"]')).toHaveValue('单体工业炉新建');
          await expect(page.locator('nav a[href="#inquiry"]')).toHaveCount(1);

          if (furnace.id === 'gas-nitriding-furnace') {
            await test.info().attach('inquiry', { body: await section.screenshot(), contentType: 'image/png' });
            const submit = form.getByRole('button', { name: en ? 'Send inquiry' : '提交咨询' });
            await submit.click();
            await expect(form.locator('[name="identity"]')).toBeFocused();
            await form.locator('[name="identity"]').fill('Local QA');
            await form.locator('[name="contact"]').fill('qa@example.com');
            await form.locator('textarea').fill(`${name} selection test`);
            await page.route('**/v2/custom-requirements', route =>
              route.fulfill({ json: { code: 0, message: 'local-test-only', data: { submissionId: 'LOCAL-QA' } } }),
            );
            const request = page.waitForRequest(req => req.url().endsWith('/v2/custom-requirements') && req.method() === 'POST');
            await submit.click();
            expect((await request).postDataJSON()).toMatchObject({
              locale, productTag: name, requirement: `${name} selection test`,
            });
            await expect(section.getByRole('status')).toContainText('LOCAL-QA');
          }
        }
      });
    }
  });
}
