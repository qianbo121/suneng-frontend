import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { checkAcquisitionContinuity, inspectProcurementHtml, PROCUREMENT_PAGES } from './check-acquisition-continuity.mjs';

const cli = fileURLToPath(new URL('./check-acquisition-continuity.mjs', import.meta.url));
const canonicalOrigin = 'https://www.jssngyl.cn';
// Independent public fixtures: these titles and routes come from the approved
// procurement pages, rather than generating passing markup from the checker.
const pages = [
  ['/zh/articles/gongye-lu-baojia-canshu', '单台工业炉报价，先准备哪些资料？'],
  ['/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin', '老旧热处理炉，大修还是买新？'],
  ['/zh/solutions/continuous-heat-treatment-line', '连续热处理生产线解决方案'],
  ['/zh/solutions/jiangsu-gongye-lu-changjia', '江苏工业炉厂家定制、节能改造与大修'],
  ['/zh/solutions/rechuli-lu-changjia', '热处理炉厂家按工况定制设备与产线'],
  ['/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi', '改造风险与停产安排先查清边界，再定计划'],
  ['/zh/solutions/rechuli-lu-kongzhi-xitong-shengji', '控制系统升级先理清任务，再选系统'],
  ['/zh/solutions/rechuli-lu-dian-gai-ran-yure-huishou', '能源切换与余热利用先核工况，再算改造'],
  ['/zh/solutions/rechuli-lu-luchen-fanxin', '炉衬损坏与翻新先查损坏，再定修复'],
  ['/zh/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan', '停产与搬迁复产先查状态，再安排复产'],
  ['/zh/solutions/rechuli-lu-wendu-bujun-zhenggai', '温度不均整改先找原因，再定方案'],
];
const target = pages[0][0];
const contact = '<nav data-contact-toolbar="true" class="fixed [body.mobile-nav-open_&amp;]:hidden"><a href="tel:+8613052986814"><span>电话联系</span></a><button type="button" aria-haspopup="dialog" aria-expanded="false"><span>微信联系</span></button></nav>';
const paragraph = '采购咨询应先核对工件材质、尺寸、装炉方式、实际产量、温度曲线、生产节拍、现场能源和施工边界。报价与交付条件要由技术资料、供货范围及验收要求共同确认；不能把设计温度当成实际处理温度，也不能把案例参数当成所有工况的承诺。';
function markup(route, title) {
  return `<!doctype html><html><head><meta name="robots" content="index, follow"><link rel="canonical" href="${canonicalOrigin}${route}"></head><body><header>苏能导航</header><main><h1>${title}</h1><h2>咨询资料与验收边界</h2><p>${paragraph.repeat(4)}</p></main><footer>联系苏能</footer>${contact}</body></html>`;
}
function sitemap(selected = pages) {
  return `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${selected.map(([route]) => `<url><loc>${canonicalOrigin}${route}</loc></url>`).join('')}</urlset>`;
}

async function withSite(mutate, callback) {
  const requests = [];
  const server = http.createServer((request, response) => {
    requests.push({ method: request.method, path: request.url });
    const route = pages.find(([pathname]) => pathname === request.url);
    const fixture = request.url === '/sitemap.xml'
      ? { status: 200, type: 'application/xml', body: sitemap() }
      : route ? { status: 200, type: 'text/html; charset=utf-8', body: markup(...route) }
        : { status: 404, type: 'text/html', body: '<main><h1>未找到页面</h1></main>' };
    const changed = mutate?.(request.url, fixture) ?? fixture;
    response.writeHead(changed.status, { 'content-type': changed.type, ...changed.headers });
    if (changed.unfinished) { response.write(changed.body); return; }
    response.end(changed.body);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    return await callback(`http://127.0.0.1:${server.address().port}`, requests);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}

function runCli(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => { child.kill(); reject(new Error('CLI 超过 10 秒')); }, 10000);
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, stdout, stderr }); });
  });
}

test('CLI checks all 11 approved pages with GET and saves a passing JSON receipt', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'acquisition-check-'));
  try {
    await withSite(null, async (baseUrl, requests) => {
      const destination = path.join(temp, 'result.json');
      const result = await runCli(['--base-url', baseUrl, '--json', '--report', destination]);
      assert.equal(result.code, 0, result.stderr);
      const report = JSON.parse(result.stdout);
      assert.equal(report.passed, true);
      assert.equal(report.pagesChecked, 11);
      assert.deepEqual(report.pages.map((page) => page.path).sort(), pages.map(([route]) => route).sort());
      assert.deepEqual(JSON.parse(await fs.readFile(destination, 'utf8')), report);
      assert.equal(requests.length, 12);
      assert.ok(requests.every((request) => request.method === 'GET'));
      assert.ok(requests.every((request) => request.path === '/sitemap.xml' || pages.some(([route]) => route === request.path)));
    });
  } finally { await fs.rm(temp, { recursive: true, force: true }); }
});

const failures = [
  ['real withdrawn procurement route returns 404', 'http', (fixture) => ({ ...fixture, status: 404, body: '<main><h1>页面不存在</h1></main>' })],
  ['streamed 200 ends in not-found, serialized fake heading is not body', 'content', (fixture) => ({ ...fixture, body: fixture.body.replace(/<main>[\s\S]*?<\/main>/, '<main><h1>未找到页面</h1></main>') + `<script>self.payload=${JSON.stringify('<main><h1>单台工业炉报价，先准备哪些资料？</h1><p>' + paragraph.repeat(4) + '</p></main>')}</script>` })],
  ['200 serves homepage/catalog with valid generic body', 'content', (fixture) => ({ ...fixture, body: fixture.body.replace(pages[0][1], '工业炉设备与生产线') })],
  ['200 has header/footer only', 'content', (fixture) => ({ ...fixture, body: fixture.body.replace(/<main>[\s\S]*?<\/main>/, '') })],
  ['fixed contact toolbar removed', 'contactToolbar', (fixture) => ({ ...fixture, body: fixture.body.replace(contact, '') })],
  ['phone and WeChat split across separate toolbars cannot satisfy one complete dock', 'contactToolbar', (fixture) => ({ ...fixture, body: fixture.body.replace('</a><button', '</a></nav><nav data-contact-toolbar><button') })],
  ['WeChat missing while phone remains', 'contactToolbar', (fixture) => ({ ...fixture, body: fixture.body.replace(/<button[\s\S]*?<\/button>/, '') })],
  ['phone uses a wrong number', 'contactToolbar', (fixture) => ({ ...fixture, body: fixture.body.replace('tel:+8613052986814', 'tel:10086') })],
  ['fixed toolbar hidden directly', 'contactToolbar', (fixture) => ({ ...fixture, body: fixture.body.replace('data-contact-toolbar="true"', 'data-contact-toolbar="true" hidden') })],
  ['meta noindex forbids indexing', 'indexable', (fixture) => ({ ...fixture, body: fixture.body.replace('index, follow', 'noindex, follow') })],
  ['HTTP X-Robots-Tag forbids indexing', 'indexable', (fixture) => ({ ...fixture, headers: { 'x-robots-tag': 'Baiduspider: noindex' } })],
  ['canonical points at another purchase page', 'canonical', (fixture) => ({ ...fixture, body: fixture.body.replace(`href="${canonicalOrigin}${target}"`, `href="${canonicalOrigin}/zh/products"`) })],
  ['redirect is rejected instead of silently following onto homepage', 'http', (fixture) => ({ ...fixture, status: 302, headers: { location: '/zh' } })],
];

for (const [name, failedCheck, mutation] of failures) {
  test(`${name}: CLI must fail even when the other ten pages pass`, async () => {
    await withSite((route, fixture) => route === target ? mutation(fixture) : fixture, async (baseUrl) => {
      const result = await runCli(['--base-url', baseUrl, '--json']);
      assert.equal(result.code, 1, result.stderr + result.stdout);
      const report = JSON.parse(result.stdout);
      assert.equal(report.passed, false);
      assert.equal(report.failedPages, 1);
      assert.equal(report.pages.find((page) => page.path === target).checks[failedCheck].passed, false);
    });
  });
}

test('all pages return 200, but one missing sitemap URL fails the CLI', async () => {
  await withSite((route, fixture) => route === '/sitemap.xml' ? { ...fixture, body: sitemap(pages.slice(1)) } : fixture, async (baseUrl) => {
    const result = await runCli(['--base-url', baseUrl, '--json']);
    assert.equal(result.code, 1);
    const report = JSON.parse(result.stdout);
    assert.equal(report.failedPages, 1);
    assert.equal(report.pages[0].checks.sitemap.passed, false);
    assert.ok(report.pages.every((page) => page.status === 200));
  });
});

test('unfinished streamed 200 times out, not a passing HTTP response', async () => {
  await withSite((route, fixture) => route === target ? { ...fixture, unfinished: true } : fixture, async (baseUrl) => {
    const report = await checkAcquisitionContinuity({ baseUrl, timeoutMs: 150 });
    assert.equal(report.passed, false);
    assert.equal(report.pages[0].checks.http.passed, false);
    assert.match(report.pages[0].checks.http.detail, /超时/);
    assert.equal(report.pagesChecked, 11);
  });
});

test('unreachable candidate is a failure, not a zero-traffic result', async () => {
  let closedBase;
  await withSite(null, async (baseUrl) => { closedBase = baseUrl; });
  const report = await checkAcquisitionContinuity({ baseUrl: closedBase, timeoutMs: 150 });
  assert.equal(report.passed, false);
  assert.equal(report.failedPages, 11);
  assert.ok(report.pages.every((page) => !page.checks.http.passed));
});

test('resolved Next/React Suspense content is checked; hidden unresolved or not-found content fails', () => {
  const good = markup(...pages[0]);
  const content = good.match(/<main>([\s\S]*?)<\/main>/)[1];
  const stream = good.replace(/<main>[\s\S]*?<\/main>/, '<main><!--$?--><template id="B:0"></template><p>正在加载页面…</p><!--/$--></main>');
  const resolved = `${stream}<div hidden id="S:0">${content}</div><script>$RC("B:0","S:0")</script>`;
  assert.equal(inspectProcurementHtml(resolved, PROCUREMENT_PAGES[0]).checks.content.passed, true);
  const unresolved = `${stream}<div hidden id="S:0">${content}</div>`;
  assert.equal(inspectProcurementHtml(unresolved, PROCUREMENT_PAGES[0]).checks.content.passed, false);
  const notFound = `${stream}<div hidden id="S:0"><h1>未找到页面</h1><p>${paragraph.repeat(4)}</p></div><script>$RC("B:0","S:0")</script>`;
  assert.equal(inspectProcurementHtml(notFound, PROCUREMENT_PAGES[0]).checks.content.passed, false);
});

test('sitemap index production host is read only through the explicitly selected candidate', async () => {
  await withSite((route, fixture) => {
    if (route === '/sitemap.xml') return { ...fixture, body: `<sitemapindex><sitemap><loc>${canonicalOrigin}/sitemap-child.xml</loc></sitemap></sitemapindex>` };
    if (route === '/sitemap-child.xml') return { status: 200, type: 'application/xml', body: sitemap() };
    return fixture;
  }, async (baseUrl, requests) => {
    const report = await checkAcquisitionContinuity({ baseUrl });
    assert.equal(report.passed, true);
    assert.equal(report.sitemap.filesChecked, 2);
    assert.ok(requests.some((request) => request.path === '/sitemap-child.xml'));
  });
});

test('invalid CLI input and existing receipt are rejected before any site requests', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'acquisition-check-'));
  try {
    const existing = path.join(temp, 'receipt.json');
    await fs.writeFile(existing, 'original receipt');
    await withSite(null, async (baseUrl, requests) => {
      for (const args of [['--base-url', baseUrl + '/zh'], ['--base-url', baseUrl, '--report', existing], ['--base-url', baseUrl, '--timeout-ms', '0']]) {
        const result = await runCli(args);
        assert.equal(result.code, 2);
      }
      assert.equal(requests.length, 0);
      assert.equal(await fs.readFile(existing, 'utf8'), 'original receipt');
    });
  } finally { await fs.rm(temp, { recursive: true, force: true }); }
});
