// Run from frontend: node scripts/verify-cases.mjs. All pagination fixtures live in memory.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = process.env.CASE_ARTIFACT_DIR ?? path.join(frontend, '../docs/cases/validation/2026-09-08');
const origin = process.env.CASE_PREVIEW_URL ?? 'http://localhost:3000';
const detail = '/zh/case/rt4-75-6-trolley-furnace-proposal';
const { JSDOM } = createRequire(require.resolve('isomorphic-dompurify'))('jsdom');
fs.mkdirSync(output, { recursive: true });
const report = { checkedAt: new Date().toISOString(), origin, checks: [], screenshots: [], errors: [] };
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
let fixtureServer;
const record = (name, details = {}) => { report.checks.push({ name, passed: true, ...details }); console.log(`PASS ${name}`); };
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'zh-CN', timezoneId: 'Asia/Shanghai' });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', (error) => report.errors.push(error.message));
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const [name, url] of [['list', '/zh/case'], ['article', detail]]) {
      await page.goto(origin + url, { waitUntil: 'networkidle' });
      await expect(page.locator('.case-page h1')).toHaveCount(1);
      for (const image of await page.locator('.case-page img').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
      }
      await page.evaluate(async () => {
        await document.fonts.ready;
        window.scrollTo({ top: 0, behavior: 'instant' });
        await new Promise(requestAnimationFrame);
      });
      const measurements = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        brokenImages: [...document.querySelectorAll('.case-page img')].filter((img) => !img.complete || !img.naturalWidth).length,
        mobileBars: [...document.querySelectorAll('.case-mobile-contact')].filter((el) => getComputedStyle(el).display !== 'none').length,
        titleWidth: document.querySelector('.case-page h1').getBoundingClientRect().width,
      }));
      expect(measurements.overflow).toBeLessThanOrEqual(1);
      expect(measurements.brokenImages).toBe(0);
      expect(measurements.mobileBars).toBe(width === 390 ? 1 : 0);
      const file = `${name}-${width}.png`;
      await page.screenshot({ path: path.join(output, file), fullPage: true });
      report.screenshots.push(file); record(`${name} ${width}px`, measurements);
      if (name === 'list') {
        const rows = await page.locator('.case-record').evaluateAll((elements) => elements.map((el) => {
          const box = (selector) => el.querySelector(selector).getBoundingClientRect();
          const style = getComputedStyle(el);
          const image = box('.case-record-image');
          const title = box('h3');
          const action = box('.case-record-link');
          return {
            background: style.backgroundColor,
            shadow: style.boxShadow,
            radius: style.borderRadius,
            borders: [style.borderTopWidth, style.borderRightWidth, style.borderLeftWidth],
            ratio: image.width / image.height,
            fit: getComputedStyle(el.querySelector('img')).objectFit,
            captionSize: getComputedStyle(el.querySelector('figcaption')).fontSize,
            actionHeight: action.height,
            actionX: action.x,
            actionOffset: action.y + action.height / 2 - title.y - parseFloat(getComputedStyle(el.querySelector('h3')).lineHeight) / 2,
            actionBackground: getComputedStyle(el.querySelector('.case-record-link')).backgroundColor,
            arrows: el.querySelectorAll('.case-record-link svg').length,
            hrefs: [...el.querySelectorAll('a')].map((a) => a.getAttribute('href')),
            bounded: [...el.querySelectorAll('h3, p, dt, dd')].every((node) => node.scrollWidth <= node.clientWidth + 1),
            inlineFacts: [...el.querySelectorAll('.case-record-facts > div')].every((group) => {
              const label = group.querySelector('dt').getBoundingClientRect();
              const value = group.querySelector('dd').getBoundingClientRect();
              return Math.abs(label.y - value.y) < 1 && value.x >= label.right;
            }),
          };
        }));
        for (const row of rows) {
          expect(row.background).toBe('rgb(255, 255, 255)');
          expect(row.shadow).toBe('none'); expect(row.radius).toBe('0px');
          expect(row.borders).toEqual(['0px', '0px', '0px']);
          expect(row.ratio).toBeCloseTo(16 / 9, 2); expect(row.fit).toBe('contain');
          expect(row.captionSize).toBe('12px'); expect(row.actionHeight).toBeGreaterThanOrEqual(44);
          expect(row.actionBackground).toBe('rgba(0, 0, 0, 0)'); expect(row.arrows).toBe(0);
          expect(row.hrefs).toHaveLength(3); expect(new Set(row.hrefs).size).toBe(1);
          expect(row.bounded).toBe(true); expect(row.inlineFacts).toBe(true);
          if (width >= 768) { expect(Math.abs(row.actionOffset)).toBeLessThan(1); expect(row.actionX).toBe(rows[0].actionX); }
        }
        const actual = await (await page.request.get(origin + '/api/cases')).json();
        await expect(page.locator('.case-result-count')).toHaveText(`找到 ${actual.total} 个项目`);
        await page.locator('.case-results-top').evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 110, behavior: 'instant' }));
        await page.evaluate(() => new Promise(requestAnimationFrame));
        const viewportFile = `list-${width}-viewport.png`;
        await page.screenshot({ path: path.join(output, viewportFile) });
        report.screenshots.push(viewportFile);
        record(`极简列表排版 ${width}px`, { rows });
      }
      if (name === 'article' && width === 390) {
        await page.locator('.case-toc-mobile summary').click();
        await expect(page.locator('.case-toc-mobile nav')).toBeVisible();
        const table = page.locator('.case-table-scroll').first();
        await table.evaluate((el) => { el.scrollLeft = 180; });
        expect(await table.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
        record('手机目录展开与表格独立滚动');
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin + '/zh/case', { waitUntil: 'networkidle' });
  const firstTitle = page.locator('.case-record h3 a').first();
  const titleBefore = await firstTitle.boundingBox();
  await firstTitle.hover();
  expect(await firstTitle.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(51, 112, 255)');
  expect(await firstTitle.boundingBox()).toEqual(titleBefore);
  const firstView = page.locator('.case-record-link').first();
  await firstView.hover();
  expect(await firstView.evaluate((el) => getComputedStyle(el).textDecorationLine)).toContain('underline');
  await page.locator('.case-record-image').first().focus();
  await page.keyboard.press('Tab');
  await expect(firstTitle).toBeFocused();
  expect(await firstTitle.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page.locator('.case-article h1')).toBeVisible();
  await page.locator('.case-back').click();
  await page.waitForLoadState('networkidle');
  const popupPromise = context.waitForEvent('page');
  await page.locator('.case-record-image').first().click({ modifiers: ['ControlOrMeta'] });
  const popup = await popupPromise;
  await expect(popup.locator('.case-article h1')).toBeVisible();
  await popup.close();
  record('标题悬停无位移、查看链接下划线、键盘焦点与进入、新标签页图片跳转');
  await page.locator('select[name=workpiece]').selectOption('支重轮');
  await page.waitForURL((url) => url.searchParams.get('workpiece') === '支重轮');
  await page.waitForLoadState('networkidle');
  await page.locator('select[name=process]').selectOption('淬火');
  await page.waitForURL((url) => url.searchParams.get('process') === '淬火');
  await page.waitForLoadState('networkidle');
  await page.locator('select[name=equipment]').selectOption('连续热处理生产线');
  await page.waitForURL((url) => url.searchParams.has('equipment'));
  await page.waitForLoadState('networkidle');
  await page.locator('select[name=need]').selectOption('新建产线');
  await page.waitForURL((url) => url.searchParams.has('need'));
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[data-case-id]')).toHaveCount(1);
  await expect(page.locator('.case-result-count')).toHaveText('找到 1 个项目');
  await expect(page.getByRole('searchbox')).toHaveCount(0);
  const legacyQueryURL = new URL(page.url());
  legacyQueryURL.searchParams.set('q', '旋转定位');
  await page.goto(legacyQueryURL.toString(), { waitUntil: 'networkidle' });
  await page.waitForURL((url) => url.searchParams.get('q') === '旋转定位');
  await expect(page.locator('[data-case-id]')).toHaveCount(1);
  await page.locator('select[name=sort]').selectOption('year');
  await page.waitForURL((url) => url.searchParams.get('sort') === 'year');
  await page.waitForLoadState('networkidle');
  const normalizedList = new URL(page.url());
  for (const [key, value] of [...normalizedList.searchParams]) if (!value) normalizedList.searchParams.delete(key);
  const listURL = normalizedList.toString();
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('select[name=workpiece]')).toHaveValue('支重轮');
  await expect(page.locator('input[type=hidden][name=q]')).toHaveValue('旋转定位');
  record('搜索框移除、旧关键词链接兼容、四项组合筛选、排序、刷新状态');
  await page.locator('.case-record-link').click();
  await expect(page.locator('.case-article h1')).toContainText('支重轮');
  await page.locator('.case-back').click();
  await expect(page).toHaveURL(listURL);
  await expect(page.locator('select[name=process]')).toHaveValue('淬火');
  await page.locator('.case-record-link').click();
  await page.goBack();
  await expect(page).toHaveURL(listURL);
  record('详情返回与浏览器返回恢复列表条件');
  await page.getByRole('link', { name: '重置', exact: true }).click();
  await expect(page.locator('select[name=workpiece]')).toHaveValue('');
  await page.goto(origin + '/zh/case?q=' + encodeURIComponent('不存在的项目-CASE-NOMATCH'));
  await expect(page.locator('.case-empty')).toBeVisible();
  await expect(page.locator('.case-result-count')).toHaveText('找到 0 个项目');
  await expect(page.locator('.case-load-more')).toHaveCount(0);
  record('清除条件与无结果状态');
  await page.goto(origin + detail);
  const tocLink = page.locator('.case-toc-desktop a').nth(2);
  const hash = await tocLink.getAttribute('href');
  await tocLink.click();
  await expect(tocLink).toHaveAttribute('aria-current', 'location');
  expect(await page.locator(`[id="${hash.slice(1)}"]`).evaluate((el) => el.getBoundingClientRect().top)).toBeGreaterThan(80);
  await page.locator('.case-toc-contact button').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').locator('img')).toBeVisible();
  await page.screenshot({ path: path.join(output, 'wechat-dialog.png') });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  record('桌面目录定位、高亮、企微弹窗与关闭');
  await expect(page.locator('.case-contact-band a')).toHaveAttribute('href', '/zh/products');
  for (const slug of ['jining-support-roller-heat-treatment-line', 'henan-annealing-solution-line', 'anonymous-tsingshan-1250-renovation', 'rt4-75-6-trolley-furnace-proposal']) {
    const response = await page.request.get(origin + '/zh/case/' + slug);
    expect(response.status()).toBe(200);
    const document = new JSDOM(await response.text()).window.document;
    expect(document.querySelectorAll('.case-article h1').length).toBe(1);
    expect(document.querySelectorAll('.case-article-body h2').length).toBeGreaterThan(5);
    expect(document.querySelectorAll('.case-article-body p').length).toBeGreaterThan(10);
    expect(document.querySelectorAll('.case-article-body table').length).toBeGreaterThan(0);
    expect(document.body.textContent).toContain('资料来源：');
    const ld = JSON.parse(document.querySelector('#case-article-jsonld').textContent);
    expect(ld[0]['@type']).toBe('Article'); expect(ld[0].publisher['@id']).toBeTruthy();
    expect(ld[0].url).not.toContain('returnTo');
    if (slug === 'rt4-75-6-trolley-furnace-proposal') { expect(ld[0].datePublished).toBeUndefined(); expect(document.body.textContent).toContain('600kg能直接理解为工件净重吗？'); }
  }
  const filtered = new JSDOM(await (await page.request.get(origin + '/zh/case?q=75kW')).text()).window.document;
  expect(filtered.querySelector('meta[name=robots]').content).toContain('noindex');
  const paged = new JSDOM(await (await page.request.get(origin + '/zh/case?page=2')).text()).window.document;
  expect(paged.querySelector('link[rel=canonical]').href.endsWith('/zh/case?page=2')).toBe(true);
  expect((await page.request.get(origin + '/zh/case/nonexistent-draft-case')).status()).toBe(404);
  record('旧地址、初始HTML全文/表格/问答、结构化数据、规范地址与404');

  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const plain = await noJS.newPage();
  await plain.goto(origin + '/zh/case');
  await plain.locator('select[name=workpiece]').selectOption('轴类及小型零件');
  await plain.getByRole('button', { name: '应用筛选', exact: true }).click();
  await expect(plain.locator('[data-case-id]')).toHaveCount(1);
  await plain.locator('.case-record-link').click();
  await expect(plain.locator('.case-article-body')).toContainText('600kg能直接理解为工件净重吗？');
  await plain.locator('.case-toc-mobile summary').click();
  await expect(plain.locator('.case-toc-mobile nav')).toBeVisible();
  record('关闭JavaScript后的筛选提交、详情正文、FAQ和目录');
  await noJS.close();

  const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const touchPage = await touchContext.newPage();
  await touchPage.goto(origin + '/zh/case', { waitUntil: 'networkidle' });
  await touchPage.locator('.case-record-link').first().tap();
  await expect(touchPage.locator('.case-article h1')).toBeVisible();
  await touchPage.locator('.case-back').tap();
  await expect(touchPage.locator('.case-results-top h2')).toHaveText('项目列表');
  record('390px 手机触控查看项目与返回');
  await touchContext.close();

  // An isolated HTTP harness renders the real CaseList component with 25 in-memory records.
  // It never writes fixtures into content/cases or changes the real page size.
  const React = require('react');
  const ReactDOMServer = require('react-dom/server');
  const modules = {};
  const sources = {};
  const stubs = { react: React, 'react/jsx-runtime': require('react/jsx-runtime'), 'next/image': { default: (props) => React.createElement('img', props) }, 'next/link': { default: (props) => React.createElement('a', props) }, './ListPagination.module.css': { default: {} }, '@/lib/api/lead-events': { trackLeadEvent() {} } };
  for (const [id, filename] of [['@/constants/pagination', 'src/constants/pagination.ts'], ['@/lib/cases/types', 'src/lib/cases/types.ts'], ['@/lib/cases/query', 'src/lib/cases/query.ts'], ['@/components/ui/ListPagination', 'src/components/ui/ListPagination.tsx'], ['CaseList', 'src/components/case-studies/CaseList.tsx']]) {
    const code = ts.transpileModule(fs.readFileSync(path.join(frontend, filename), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    sources[id] = code;
    const runtimeModule = { exports: {} };
    const load = (key) => modules[key === './types' ? '@/lib/cases/types' : key] ?? stubs[key];
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, { URLSearchParams, URL })(load, runtimeModule, runtimeModule.exports);
    modules[id] = runtimeModule.exports;
  }
  const fixtureItems = Array.from({ length: 25 }, (_, i) => ({ id: `isolated-${i}`, slug: `isolated-${i}`, title: `隔离测试项目 ${i}`, summary: '只存在测试内存中的正文摘要', contentType: 'experience', sourceSummary: '测试资料', facts: [{ label: '设计参数', value: '700', unit: '℃' }, { label: '项目类型', value: '测试' }] }));
  const { parseCaseQuery, paginateCases } = modules['@/lib/cases/query'];
  const runtime = `const modules={};const stubs={react:React,'react/jsx-runtime':{jsx:(t,p)=>React.createElement(t,p),jsxs:(t,p)=>React.createElement(t,p),Fragment:React.Fragment},'next/image':{default:p=>React.createElement('img',p)},'next/link':{default:p=>React.createElement('a',p)},'./ListPagination.module.css':{default:{}},'@/lib/api/lead-events':{trackLeadEvent(){}}};function require(k){return modules[k==='./types'?'@/lib/cases/types':k]||stubs[k]};` + Object.entries(sources).map(([id, code]) => `{const module={exports:{}};(function(require,module,exports){${code}\n})(require,module,module.exports);modules[${JSON.stringify(id)}]=module.exports;}`).join('\n');
  fixtureServer = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://fixture.local');
    if (url.pathname === '/react.js' || url.pathname === '/react-dom.js') {
      const packageName = url.pathname === '/react.js' ? 'react' : 'react-dom';
      response.setHeader('Content-Type', 'text/javascript'); response.end(fs.readFileSync(path.join(path.dirname(require.resolve(`${packageName}/package.json`)), `umd/${packageName}.development.js`))); return;
    }
    const query = parseCaseQuery(url.searchParams);
    const result = paginateCases(fixtureItems, query);
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(`<!doctype html><html><body><div id="root">${ReactDOMServer.renderToString(React.createElement(modules.CaseList.CaseList, { initial: result, query }))}</div><script src="/react.js"></script><script src="/react-dom.js"></script><script>${runtime}\nReactDOM.hydrateRoot(document.getElementById('root'),React.createElement(modules.CaseList.CaseList,{initial:${JSON.stringify(result)},query:${JSON.stringify(query)}}));</script></body></html>`);
  });
  await new Promise((resolve) => fixtureServer.listen(0, '127.0.0.1', resolve));
  const fixtureOrigin = `http://127.0.0.1:${fixtureServer.address().port}`;
  const fixturePage = await context.newPage();
  await fixturePage.goto(fixtureOrigin + '/zh/case', { waitUntil: 'networkidle' });
  await expect(fixturePage.locator('.case-result-count')).toHaveText('找到 25 个项目');
  await expect(fixturePage.locator('[data-case-id]')).toHaveCount(10);
  await expect(fixturePage.locator('.case-load-more')).toHaveCount(0);
  const firstIds = await fixturePage.locator('[data-case-id]').evaluateAll((items) => items.map((item) => item.dataset.caseId));
  await fixturePage.getByRole('link', { name: '下一页', exact: true }).click();
  await expect(fixturePage).toHaveURL(/page=2$/);
  await expect(fixturePage.locator('[data-case-id]')).toHaveCount(10);
  const secondIds = await fixturePage.locator('[data-case-id]').evaluateAll((items) => items.map((item) => item.dataset.caseId));
  expect(new Set([...firstIds, ...secondIds]).size).toBe(20);
  await fixturePage.reload();
  await expect(fixturePage.locator('[data-case-id]')).toHaveCount(10);
  await fixturePage.getByRole('link', { name: '下一页', exact: true }).click();
  await expect(fixturePage.locator('[data-case-id]')).toHaveCount(5);
  await expect(fixturePage.getByText('下一页', { exact: true })).toHaveAttribute('aria-disabled', 'true');
  await fixturePage.goBack();
  await expect(fixturePage.locator('[data-case-id]')).toHaveCount(10);
  await fixturePage.goto(fixtureOrigin + '/zh/case?page=2&from=1');
  await expect(fixturePage.locator('[data-case-id]')).toHaveCount(10);
  record('隔离数据：每页10条、翻页无重复、末页、刷新返回和旧累积链接兼容');
  expect(report.errors).toEqual([]);
} catch (error) {
  report.failure = error.stack;
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (fixtureServer) await new Promise((resolve) => fixtureServer.close(resolve));
  await browser.close();
  fs.writeFileSync(path.join(output, 'browser-checks.json'), JSON.stringify(report, null, 2));
}
