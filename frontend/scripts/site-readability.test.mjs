import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { inspectHtml, localPath, scanSite, USER_AGENT } from './check-site-readability.mjs';

const paragraph = '采购者确认工件材料、温度要求、产量与供货范围。'.repeat(30);
const good = (extra = '') => `<html><body><nav>导航</nav><main><h1>工业炉采购</h1><p>${paragraph}</p>${extra}</main></body></html>`;
const hidden = `<html><body><main><!--$?--><template id="B:0"></template>加载中<!--/$--></main><div hidden id="S:0"><h1>工业炉采购</h1><p>${paragraph}</p></div><script>$RC("B:0","S:0")</script></body></html>`;
const manifest = { keyPages: ['/zh/good'], extraPages: [], minBodyCharacters: 300, expectedUrls: [], readabilityExceptions: [] };
const productionManifest = JSON.parse(await fs.readFile(new URL('./site-readability-manifest.json', import.meta.url), 'utf8'));
const contactContract = productionManifest.contentContracts['/zh/contact'];
const caseContract = productionManifest.contentContracts['/zh/case'];
const shortContactBody = '<h1>联系我们</h1><p>设备咨询、项目沟通与来厂联系。</p><h2>江苏苏能工业炉有限公司</h2><a href="tel:+8613052986814">130-5298-6814</a><h2>微信咨询</h2><h2>业务邮箱</h2><a href="mailto:997518512@qq.com">997518512@qq.com</a><h2>到厂地址</h2>';
const shortCaseBody = '<h1>项目案例</h1><p>按工件、炉型和工艺，查找相似项目。</p><article><h2>850毫米不锈钢退洗线：退火固溶段的供货范围</h2><a href="/zh/case/henan-annealing-solution-line?returnTo=%2Fzh%2Fcase">查看项目</a></article>';

test('reads literal visible main; navigation and serialized script do not count', () => {
  assert.equal(inspectHtml(good()).classification, 'readable');
  const result = inspectHtml(`<body><header><h1>标题</h1>${paragraph}</header><main>加载</main><script>"<h1>假标题</h1>${paragraph}"</script></body>`);
  assert.equal(result.classification, 'unreadable');
  assert.deepEqual(result.h1, []);
  assert.equal(result.bodyCharacters, 2);
});

test('completed React streaming instructions never make hidden body readable', () => {
  const result = inspectHtml(hidden);
  assert.equal(result.classification, 'unreadable');
  assert.deepEqual(result.h1, []);
  assert.deepEqual(result.hiddenH1, ['工业炉采购']);
  assert.equal(result.bodyCharacters, 3);
});

test('article header inside main contributes the real h1 and introduction', () => {
  const result = inspectHtml(`<body><header><h1>站点名称</h1>导航</header><main><article><header><h1>正文主标题</h1><p>文章导语</p></header><p>${paragraph}</p><footer>文章署名</footer><nav>正文导航不计入</nav><aside>推荐内容不计入</aside></article></main><footer>全站页脚</footer></body>`);
  assert.equal(result.classification, 'readable');
  assert.deepEqual(result.h1, ['正文主标题']);
  assert.equal(result.bodyPreview.startsWith('正文主标题文章导语'), true);
  assert.equal(result.bodyCharacters, '正文主标题文章导语'.length + paragraph.length + '文章署名'.length);
});

test('screen-reader h1 is semantic content, not a visible title or hidden streaming segment', () => {
  const result = inspectHtml(`<main><h1 class="sr-only">江苏苏能工业炉有限公司</h1><p>${paragraph}</p></main>`);
  assert.equal(result.classification, 'readable');
  assert.deepEqual(result.h1, []);
  assert.deepEqual(result.screenReaderH1, ['江苏苏能工业炉有限公司']);
  assert.deepEqual(result.hiddenH1, []);
  assert.equal(result.bodyCharacters, paragraph.length);
  assert.equal(result.contentProfile, 'standard');
});

test('real hidden ancestors and navigation cannot supply a screen-reader title', () => {
  for (const attr of ['hidden', 'style="display:none"', 'aria-hidden="true"', 'class="hidden"']) {
    const result = inspectHtml(`<main><div ${attr}><h1 class="sr-only">主标题</h1></div><p>${paragraph}</p></main>`);
    assert.equal(result.classification, 'partial');
    assert.deepEqual(result.screenReaderH1, []);
    assert.deepEqual(result.hiddenH1, ['主标题']);
  }
  assert.deepEqual(inspectHtml(`<main><nav><h1 class="sr-only">导航标题</h1></nav>${paragraph}</main>`).screenReaderH1, []);
});

test('verified contact page passes its visible content contract without lowering the global threshold', () => {
  const html = `<main>${shortContactBody}</main>`;
  assert.equal(inspectHtml(html).classification, 'partial');
  const result = inspectHtml(html, { path: '/zh/contact', contentContract: contactContract });
  assert.equal(result.classification, 'readable');
  assert.equal(result.minBodyCharacters, 300);
  assert.ok(result.bodyCharacters < 300);
  assert.equal(result.contentProfile, 'verified-short-page');
  assert.equal(result.contentContract.passed, true);
  assert.throws(() => inspectHtml(html, { path: '/zh/other', contentContract: contactContract }), /exact path/);
});

test('contact contract fails for missing phone or email even with filler, footer or hidden substitutes', () => {
  const phone = '<a href="tel:+8613052986814">130-5298-6814</a>';
  const email = '<a href="mailto:997518512@qq.com">997518512@qq.com</a>';
  for (const removed of [phone, email]) {
    for (const replacement of ['', `<div hidden>${removed}</div>`, `<nav>${removed}</nav>`]) {
      const html = `<main>${shortContactBody.replace(removed, replacement)}<p>${paragraph}</p></main><footer>${removed}</footer>`;
      const result = inspectHtml(html, { path: '/zh/contact', contentContract: contactContract });
      assert.equal(result.classification, 'partial');
      assert.equal(result.contentContract.passed, false);
      assert.equal(result.contentContract.checks.links.some((item) => !item.passed), true);
    }
  }
  assert.equal(inspectHtml('<main><h1>联系我们</h1></main>', { path: '/zh/contact', contentContract: contactContract }).classification, 'partial');
});

test('case index requires the actual visible approved card and same-site detail link', () => {
  const options = { path: '/zh/case', contentContract: caseContract };
  assert.equal(inspectHtml(`<main>${shortCaseBody}</main>`, options).classification, 'readable');
  const variants = [
    shortCaseBody.replace(/<article>[\s\S]*?<\/article>/, ''),
    shortCaseBody.replace('<article>', '<article hidden>'),
    shortCaseBody.replace('/zh/case/henan-annealing-solution-line?returnTo=%2Fzh%2Fcase', 'https://elsewhere.test/zh/case/henan-annealing-solution-line'),
    shortCaseBody.replace(/<a[^>]*>[\s\S]*?<\/a>/, ''),
  ];
  for (const variant of variants) assert.equal(inspectHtml(`<main>${variant}</main><footer>${shortCaseBody}</footer>`, options).classification, 'partial');
});

test('scanner and offline inspection use the same exact-path contract; English inquiry stays closed', async () => {
  const html = `<main>${shortContactBody}</main>`;
  const report = await scanSite({ manifest: { ...manifest, contentContracts: productionManifest.contentContracts }, paths: ['/zh/contact'], linkScope: 'listed',
    fetcher: async () => new Response(html, { headers: { 'Content-Type': 'text/html' } }) });
  assert.equal(report.passed, true);
  assert.equal(report.pages[0].contentContract.passed, true);
  assert.equal(report.pages[0].classification, inspectHtml(html, { path: '/zh/contact', contentContract: contactContract }).classification);
  assert.equal(productionManifest.readabilityExceptions.some((item) => item.path === '/en/inquiry'), false);
  assert.deepEqual(productionManifest.expectedUrls.find((item) => item.path === '/en/inquiry')?.statuses, [404]);
});

test('partial and structurally hidden content remain distinct', () => {
  assert.equal(inspectHtml('<main><h1>短标题</h1><p>简短</p></main>').classification, 'partial');
  for (const attr of ['hidden', 'style="display:none"', 'class="hidden"', 'aria-hidden="true"']) {
    assert.equal(inspectHtml(`<main><div ${attr}><h1>标题</h1>${paragraph}</div></main>`).classification, 'unreadable');
  }
  assert.equal(inspectHtml('<main><div class="hidden lg:block">文案</div></main>').cssDependentNodes, 1);
});

test('canonical production links remap to the selected origin without external requests', () => {
  const origin = 'http://127.0.0.1:43210';
  assert.equal(localPath('https://www.jssngyl.cn/zh/a#contact', origin), '/zh/a');
  assert.equal(localPath('/zh/a?page=2', origin), '/zh/a?page=2');
  for (const value of ['https://evil.test/zh', 'https://www.jssngyl.cn.evil.test/zh', '//evil.test/zh', 'mailto:a@b.test', '/api/v1/lead-events', '/zh/a?_rsc=x']) assert.equal(localPath(value, origin), null);
});

async function withSite(routes, callback) {
  const requests = [];
  const server = createServer((req, res) => {
    requests.push({ method: req.method, path: req.url, ua: req.headers['user-agent'] });
    if (req.method !== 'GET') { res.writeHead(405).end(); return; }
    const route = routes[req.url];
    if (!route) { res.writeHead(404, { 'Content-Type': 'text/html' }).end('Not found'); return; }
    res.writeHead(route.status ?? 200, { 'Content-Type': route.type ?? 'text/html', ...(route.headers ?? {}) });
    res.end(route.body ?? '');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try { await callback(`http://127.0.0.1:${server.address().port}`, requests); }
  finally { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); }
}

const sitemap = (paths) => ({ type: 'application/xml', body: '<urlset>' + paths.map((path) => `<url><loc>https://www.jssngyl.cn${path}</loc></url>`).join('') + '</urlset>' });

test('real GET inventory identifies hidden body, dead link, correct withdrawn status and redirect', async () => {
  await withSite({
    '/sitemap.xml': sitemap(['/zh/good', '/zh/hidden']),
    '/zh/good': { body: good('<a href="/zh/missing">坏链</a><a href="https://evil.test/never">外站</a>') },
    '/zh/hidden': { body: hidden },
    '/legacy.php?id=1': { status: 301, headers: { Location: '/zh/good' } },
  }, async (baseUrl, requests) => {
    const report = await scanSite({ baseUrl, manifest: { ...manifest, expectedUrls: [
      { path: '/en/closed', statuses: [404], reason: 'not approved' },
      { path: '/legacy.php?id=1', statuses: [301], location: '/zh/good', reason: 'approved mapping' },
    ] } });
    assert.equal(report.passed, false);
    assert.equal(report.summary.readable, 1);
    assert.equal(report.summary.unreadable, 1);
    assert.equal(report.summary.brokenLinks, 1);
    assert.equal(report.expectedUrls.every((row) => row.passed), true);
    assert.equal(report.browserChecks.status, 'not-run');
    assert.equal(requests.every((request) => request.method === 'GET' && request.ua === USER_AGENT), true);
    assert.equal(requests.some((request) => request.path.includes('never')), false);
  });
});

test('a known dead link cannot pass just because it existed in the baseline', async () => {
  await withSite({ '/sitemap.xml': sitemap(['/zh/good']), '/zh/good': { body: good('<a href="/zh/missing">坏链</a>') } }, async (baseUrl) => {
    const baseline = await scanSite({ baseUrl, manifest });
    const result = await scanSite({ baseUrl, manifest, baseline });
    assert.equal(result.passed, false);
    assert.equal(result.issues.some((issue) => issue.kind === 'internal-link'), true);
  });
});

test('baseline tolerates unchanged unreadable scope but required prefixes must improve', async () => {
  await withSite({ '/zh/hidden': { body: hidden } }, async (baseUrl) => {
    const options = { baseUrl, manifest: { ...manifest, keyPages: [] }, paths: ['/zh/hidden'], linkScope: 'listed' };
    const baseline = await scanSite(options);
    assert.equal((await scanSite({ ...options, baseline })).passed, true);
    assert.equal((await scanSite({ ...options, baseline, requiredPrefixes: ['/zh/'] })).passed, false);
  });
});

test('an unsuccessful or unclassified baseline cannot excuse a new partial page', async () => {
  const options = { manifest: { ...manifest, keyPages: [] }, paths: ['/zh/partial'],
    fetcher: async () => new Response('<main><h1>只有标题</h1></main>', { headers: { 'Content-Type': 'text/html' } }) };
  for (const before of [
    { status: 200, classification: 'error', error: 'response body timeout' },
    { status: 200, classification: 'not-page' },
    { status: 200 },
    { status: 200, classification: 'unreadable', error: 'incomplete response' },
    { status: 404, classification: 'unreadable' },
  ]) {
    const baseline = { kind: 'site-readability-report', version: 1, pages: [{ path: '/zh/partial', ...before }] };
    const report = await scanSite({ ...options, baseline });
    assert.equal(report.passed, false);
    const issue = report.issues.find((item) => item.kind === 'readability');
    assert.equal(issue?.classification, 'partial');
    assert.equal(issue?.baselineComparable, false);
  }
});

test('explicit local scope does not fetch fixture-unrelated links or sitemap', async () => {
  await withSite({ '/zh/good': { body: good('<a href="/zh/news/not-in-fixture">文章</a>') } }, async (baseUrl, requests) => {
    const report = await scanSite({ baseUrl, manifest, paths: ['https://www.jssngyl.cn/zh/good'], linkScope: 'listed' });
    assert.equal(report.passed, true);
    assert.equal(report.scope.excludedLinkOccurrences, 1);
    assert.deepEqual(requests.map((request) => request.path), ['/zh/good']);
  });
});

test('transport failures and non-pages never inflate unreadable counts', async () => {
  const fetcher = async (url) => {
    if (url.endsWith('/zh/network-error')) throw new Error('fixture transport failure');
    return new Response('missing', { status: 404, headers: { 'Content-Type': 'text/html' } });
  };
  const report = await scanSite({ manifest: { ...manifest, keyPages: [] }, paths: ['/zh/network-error', '/zh/missing'], fetcher });
  assert.equal(report.summary.error, 1);
  assert.equal(report.summary['not-page'], 1);
  assert.equal(report.summary.unreadable, 0);
  assert.equal(report.passed, false);
});

test('optional raw response archive preserves original bytes and refuses reuse', async () => {
  const parent = await fs.mkdtemp(path.join(os.tmpdir(), 'suneng-readability-test-'));
  const rawHtmlDir = path.join(parent, 'raw');
  try {
    const html = good() + '\n';
    const report = await scanSite({ manifest: { ...manifest, keyPages: [] }, paths: ['/zh/good'], rawHtmlDir,
      fetcher: async () => new Response(html, { headers: { 'Content-Type': 'text/html' } }) });
    assert.equal(report.passed, true);
    assert.equal(await fs.readFile(report.pages[0].rawPath, 'utf8'), html);
    assert.equal(report.scope.rawHtmlDirectory, rawHtmlDir);
    await assert.rejects(scanSite({ paths: ['/zh/good'], rawHtmlDir }), /directory exists/);
  } finally { await fs.rm(parent, { recursive: true, force: true }); }
});

test('redirect loops and external redirects remain failures without following external hosts', async () => {
  await withSite({
    '/zh/good': { body: good('<a href="/loop">loop</a><a href="/external">external</a>') },
    '/loop': { status: 301, headers: { Location: '/loop' } },
    '/external': { status: 302, headers: { Location: 'https://evil.test/end' } },
  }, async (baseUrl, requests) => {
    const report = await scanSite({ baseUrl, manifest, paths: ['/zh/good'] });
    assert.equal(report.summary.brokenLinks, 2);
    assert.equal(requests.some((request) => request.path.includes('/end')), false);
  });
});

test('expected redirect must reach a successful terminal page and retains the chain', async () => {
  await withSite({
    '/zh/good': { body: good() },
    '/old-good.php': { status: 301, headers: { Location: '/middle' } },
    '/middle': { status: 302, headers: { Location: '/zh/good' } },
    '/old-broken.php': { status: 301, headers: { Location: '/zh/missing' } },
  }, async (baseUrl) => {
    const report = await scanSite({ baseUrl, manifest: { ...manifest, expectedUrls: [
      { path: '/old-good.php', statuses: [301], location: '/middle', reason: 'known redirect' },
      { path: '/old-broken.php', statuses: [301], location: '/zh/missing', reason: 'known redirect to verify' },
    ] }, paths: ['/zh/good'] });
    const goodRedirect = report.expectedUrls.find((row) => row.path === '/old-good.php');
    const brokenRedirect = report.expectedUrls.find((row) => row.path === '/old-broken.php');
    assert.equal(goodRedirect.passed, true);
    assert.deepEqual(goodRedirect.chain.map((row) => row.status), [301, 302, 200]);
    assert.equal(goodRedirect.finalPath, '/zh/good');
    assert.equal(brokenRedirect.passed, false);
    assert.equal(brokenRedirect.destinationPassed, false);
    assert.deepEqual(brokenRedirect.chain.map((row) => row.status), [301, 404]);
    assert.equal(brokenRedirect.finalStatus, 404);
    assert.equal(report.passed, false);
    assert.equal(report.issues.some((issue) => issue.kind === 'expected-url' && issue.path === '/old-broken.php'), true);
  });
});
