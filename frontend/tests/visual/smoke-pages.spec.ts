import path from 'node:path';
import { expect, test } from '@playwright/test';

const pages = [
  { name: 'home', path: '/zh' },
  { name: 'products', path: '/zh/products' },
  { name: 'trolley-furnace', path: '/zh/products/detail/trolley-furnace' },
  { name: 'about', path: '/zh/about' },
  { name: 'contact', path: '/zh/contact' },
];

const viewports = [
  { name: 'desktop-1440', width: 1440, height: 1100 },
  { name: 'laptop-1280', width: 1280, height: 960 },
  { name: 'mobile-390', width: 390, height: 844 },
];

async function warmLazyContent() {
  const step = Math.max(window.innerHeight, 600);
  const pageHeight = document.documentElement.scrollHeight;

  for (let y = 0; y < pageHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }

  window.scrollTo(0, 0);
  await document.fonts?.ready;
}

test.describe('core visual smoke pages', () => {
  for (const viewport of viewports) {
    test.describe(viewport.name, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      for (const visualPage of pages) {
        test(visualPage.name, async ({ page }) => {
          await page.emulateMedia({ reducedMotion: 'reduce' });
          await page.goto(visualPage.path, { waitUntil: 'domcontentloaded' });
          await page.addStyleTag({
            content: `
              *, *::before, *::after {
                animation-delay: 0s !important;
                animation-duration: 0s !important;
                caret-color: transparent !important;
                transition-delay: 0s !important;
                transition-duration: 0s !important;
              }
              html { scroll-behavior: auto !important; }
            `,
          });
          await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
          await page.evaluate(warmLazyContent);
          await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => undefined);
          if (visualPage.name === 'home') {
            // Scrolling back to the hero schedules the observer update separately
            // from network activity. Capture the settled state, not the outgoing dock.
            const dock = page.locator('[data-sticky-engineer-dock]');
            await expect(dock).toHaveAttribute('data-visible', 'false');
            await expect(dock).toBeHidden();
          }
          await expect(page).toHaveScreenshot(`${visualPage.name}-${viewport.name}.png`, {
            fullPage: true,
            mask: [page.locator('canvas'), page.locator('video')],
            // A full-page capture enlarges the viewport, which re-runs the dock's
            // visibility observers in no fixed order. Its settled state is checked above.
            ...(visualPage.name === 'home' ? { stylePath: path.join(__dirname, 'hide-home-dock.css') } : {}),
          });
        });
      }
    });
  }
});
