#!/usr/bin/env node
// Companion to check-site-readability.mjs. Local interaction checks only;
// remote mode requires an explicit flag and never clicks or submits anything.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from '@playwright/test';

const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('node frontend/scripts/check-readability-browser.mjs --base-url ORIGIN --paths-file PATHS.json --report NEW.json [--compare-url LOCAL_ORIGIN] [--viewport desktop|mobile] [--remote-readonly]\nRuns desktop/mobile checks. Local mode intercepts all writes and external traffic; remote mode only reads pages with qa_internal marker. Screenshots are saved beside the report. Existing reports are never overwritten.');
  process.exit(0);
}
const options = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--remote-readonly') { options.remote = true; continue; }
  if (!['--base-url', '--paths-file', '--report', '--compare-url', '--viewport'].includes(args[i]) || !args[i + 1]) throw new Error(`Invalid option ${args[i]}`);
  options[args[i].slice(2)] = args[++i];
}
const local = (origin) => ['127.0.0.1', 'localhost', '[::1]'].includes(new URL(origin).hostname);
function origin(value) {
  const u = new URL(value);
  if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password || u.pathname !== '/' || u.search || u.hash) throw new Error('Expected credential-free http(s) origin');
  return u.origin;
}
const base = origin(options['base-url']);
if (!local(base) && !options.remote) throw new Error('Remote browsing requires --remote-readonly; never enable local interactions on production');
const compare = options['compare-url'] ? origin(options['compare-url']) : null;
if (compare && (!local(compare) || !local(base) || options.remote)) throw new Error('Comparison is restricted to isolated local origins');
const paths = JSON.parse(await fs.readFile(options['paths-file'], 'utf8'));
if (!Array.isArray(paths) || !paths.length || paths.some(p => typeof p !== 'string' || !p.startsWith('/') || new URL(p, base).origin !== base || /^\/(api|admin|_next)(\/|$)/.test(p))) throw new Error('Expected nonempty local page path array');
const reportFile = path.resolve(options.report);
await fs.mkdir(path.dirname(reportFile), { recursive: true });
await fs.writeFile(reportFile, JSON.stringify({ status: 'running' }), { flag: 'wx' });
const shots = reportFile.replace(/\.json$/, '') + '-screenshots';
await fs.mkdir(shots, { recursive: true });
const browser = await chromium.launch({ headless: true });
const rows = [];
const writes = [], external = [];
if (options.viewport && !['desktop', 'mobile'].includes(options.viewport)) throw new Error('--viewport must be desktop or mobile');
const views = [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }].filter(v => !options.viewport || v.name === options.viewport);
try {
  for (const view of views) {
    const context = await browser.newContext({
      viewport: { width: view.width, height: view.height }, locale: 'zh-CN', timezoneId: 'Asia/Shanghai',
      reducedMotion: 'reduce', isMobile: view.name === 'mobile', hasTouch: view.name === 'mobile',
      ...(view.name === 'mobile' ? { userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 suneng-internal-linkcheck' } : { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 suneng-internal-linkcheck' }),
      serviceWorkers: 'block', permissions: ['clipboard-read', 'clipboard-write'],
    });
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      if (!['GET', 'HEAD'].includes(request.method())) {
        writes.push({ path: url.pathname, method: request.method(), body: request.postData() });
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{"code":0,"data":{},"message":"isolated test; no persistence"}' });
      }
      if (![base, compare].includes(url.origin)) {
        external.push({ origin: url.origin, path: url.pathname });
        return route.abort();
      }
      return route.continue();
    });
    // Prevent OS handlers without bypassing React's contact interaction logic.
    await context.addInitScript(() => document.addEventListener('click', e => {
      const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (a && /^(tel:|mailto:)/i.test(a.getAttribute('href'))) e.preventDefault();
    }, true));
    for (const pathname of paths) {
      const observations = [];
      for (const [label, target] of [['candidate', base], ...(compare ? [['control', compare]] : [])]) {
        const page = await context.newPage();
        page.setDefaultTimeout(15000);
        const row = { path: pathname, viewport: view.name, label, errors: [], consoleErrors: [] };
        page.on('pageerror', error => row.errors.push(error.message));
        page.on('console', message => { if (message.type() === 'error') row.consoleErrors.push(message.text()); });
        try {
          const url = new URL(pathname, target); url.searchParams.set('utm_source', 'qa_internal'); url.searchParams.set('acquisition_qa', 'readability_batch_one');
          const response = await page.goto(url.href, { waitUntil: 'networkidle', timeout: 90000 });
          row.status = response.status();
          await page.locator('main h1').first().waitFor({ state: 'visible', timeout: 15000 });
          await page.evaluate(() => document.fonts.ready);
          const mainText = await page.locator('main').first().innerText();
          row.title = await page.title();
          row.h1 = await page.locator('main h1').allTextContents();
          row.mainTextSha256 = createHash('sha256').update(mainText.replace(/\s+/g, ' ').trim()).digest('hex');
          const toolbar = page.locator('[data-contact-toolbar]');
          row.toolbarVisible = await toolbar.isVisible();
          row.phoneTarget = await toolbar.locator('a[href^="tel:"]').getAttribute('href');
          row.toolbarGeometry = await toolbar.evaluate(el => { const r = el.getBoundingClientRect(); return { position: getComputedStyle(el).position, x: r.x, y: r.y, width: r.width, height: r.height, insideViewport: r.x >= 0 && r.y >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 }; });
          row.overflowPixels = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
          await page.screenshot({ path: path.join(shots, `${label}-${view.name}-${pathname.replace(/[^a-z0-9-]/gi, '_')}.png`), animations: 'disabled' });
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          row.toolbarAfterScroll = await toolbar.isVisible();
          await page.evaluate(() => window.scrollTo(0, 0));
          if (!options.remote) {
            const wechatButton = toolbar.getByRole('button', { name: /微信联系|WeChat/i });
            const wechatBox = await wechatButton.boundingBox();
            // The local Next dev indicator occupies the bottom-left corner on
            // narrow screens. Use a real unobstructed point inside the button;
            // do not force clicks or hide error overlays.
            await wechatButton.click({ position: { x: wechatBox.width - 12, y: 12 } });
            const dialog = page.locator('[data-contact-dialog="wechat"]');
            await dialog.waitFor({ state: 'visible' });
            row.wechatOpened = true;
            await dialog.getByRole('button', { name: /复制微信号|Copy WeChat ID/i }).click();
            await page.waitForFunction(() => /已复制|Copied/i.test(document.querySelector('[data-contact-dialog="wechat"]')?.textContent ?? ''));
            row.wechatCopied = await page.evaluate(() => navigator.clipboard.readText()) === 'suneng2005';
            await page.keyboard.press('Escape');
            await toolbar.locator('a[href^="tel:"]').click();
            row.phoneAction = view.name === 'mobile' ? 'native target prevented' : await page.locator('[data-contact-dialog="phone"]').isVisible() ? 'dialog opened' : 'failed';
            if (view.name === 'desktop') await page.keyboard.press('Escape');
            if (/\/inquiry$/.test(new URL(pathname, target).pathname)) {
              const submit = page.locator('main button[type="submit"]').first();
              const before = writes.length;
              await submit.click();
              await page.locator('main [aria-invalid="true"], main :invalid').first().waitFor({ state: 'visible' });
              row.formValidation = true;
              row.inquiryWriteBlocked = writes.slice(before).some(r => /custom-requirements|inquir/i.test(r.path));
            }
          }
          const home = page.locator(`header a[href="/${pathname.startsWith('/en') ? 'en' : 'zh'}"]:visible`).first();
          if (!options.remote && await home.count() && !/^\/(zh|en)$/.test(pathname)) {
            await home.click();
            await page.waitForURL(target + '/' + (pathname.startsWith('/en') ? 'en' : 'zh'));
            await page.waitForLoadState('networkidle');
            await page.goBack({ waitUntil: 'networkidle' });
            await page.locator('main h1').first().waitFor({ state: 'visible' });
            row.warmNavigation = (await page.locator('main h1').allTextContents()).join('') === row.h1.join('');
          }
          row.hydrationErrors = row.consoleErrors.filter(s => /hydration|hydrating|did not match|server rendered|Minified React error/i.test(s));
          row.passed = row.status === 200 && row.toolbarVisible && row.toolbarGeometry.position === 'fixed' && row.toolbarGeometry.insideViewport && row.toolbarAfterScroll && /130.?5298.?6814/.test(row.phoneTarget) && row.overflowPixels <= 1 && row.errors.length === 0 && row.hydrationErrors.length === 0 && row.warmNavigation !== false && (options.remote || (row.wechatOpened && row.wechatCopied && row.phoneAction !== 'failed' && row.formValidation !== false && !row.inquiryWriteBlocked));
        } catch (error) { row.failure = error.message; row.passed = false; }
        observations.push(row); rows.push(row); await page.close();
      }
      if (compare) {
        const [candidate, control] = observations;
        candidate.sameRenderedContent = candidate.mainTextSha256 === control.mainTextSha256 && candidate.title === control.title && JSON.stringify(candidate.h1) === JSON.stringify(control.h1);
        candidate.passed &&= candidate.sameRenderedContent;
      }
      console.log(JSON.stringify({ path: pathname, viewport: view.name, passed: observations.every(r => r.passed), failures: observations.filter(r => !r.passed).map(r => ({ label: r.label, failure: r.failure, errors: r.errors, hydrationErrors: r.hydrationErrors, overflowPixels: r.overflowPixels, wechatCopied: r.wechatCopied, phoneAction: r.phoneAction, formValidation: r.formValidation, sameRenderedContent: r.sameRenderedContent })) }));
      await fs.writeFile(reportFile, JSON.stringify({ status: 'running', rows }, null, 2));
    }
    await context.close();
  }
} finally {
  await browser.close();
  await fs.writeFile(reportFile, JSON.stringify({ kind: 'readability-browser-report', checkedAt: new Date().toISOString(), baseUrl: base, compareUrl: compare, mode: options.remote ? 'remote-readonly' : 'isolated-interactions', passed: rows.length === paths.length * views.length * (compare ? 2 : 1) && rows.every(r => r.passed), rows, interceptedWrites: writes, blockedExternal: external, eventCoverage: 'not-verified; entry-by-entry event validation belongs to batch two', limitations: ['Writes are intercepted; this does not prove analytics persistence or real message delivery.', 'Local development rendering does not replace immutable release candidate or post-deploy acceptance.', 'Remote mode does not click contacts or submit forms; marked page reads can still appear in logs.'] }, null, 2));
}
if (rows.some(r => !r.passed)) process.exitCode = 1;
