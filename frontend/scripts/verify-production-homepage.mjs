import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const frontend = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(new URL('../package.json', import.meta.url));
const port = Number(process.env.PRODUCTION_HOME_TEST_PORT || 43218);
const report = process.env.PRODUCTION_HOME_TEST_REPORT;
const children = [], rows = [], requests = [];
let logs = '', mode = 'failure', revision = 1, proxy;
function start(args, env) {
  const child = spawn(process.execPath, args, { cwd: frontend, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  for (const stream of [child.stdout, child.stderr]) stream.on('data', data => { logs = (logs + data).slice(-100_000); });
  children.push(child);
  return child;
}
async function ready(child, url) {
  for (let i = 0; i < 60; i++) {
    assert.equal(child.exitCode, null, 'Isolated server stopped');
    try { if ((await fetch(url, { signal: AbortSignal.timeout(1000) })).ok) return; } catch { /* starting */ }
    await delay(100);
  }
  throw new Error('Isolated server did not become ready');
}
async function read(name, locale, expectedArticles, force = false) {
  const started = performance.now();
  const manifest = JSON.parse(await fs.readFile(frontend + '/.next/prerender-manifest.json', 'utf8'));
  const response = await fetch(`http://127.0.0.1:${port}/${locale}`, {
    headers: force ? { 'x-prerender-revalidate': manifest.preview.previewModeId } : {},
    signal: AbortSignal.timeout(10_000),
  });
  const body = await response.text();
  const row = { name, locale, status: response.status, ms: Math.round(performance.now() - started),
    cacheControl: response.headers.get('cache-control'), cache: response.headers.get('x-nextjs-cache'),
    hasArticles: body.includes('visual-test-annealing-selection'),
    hasFallback: locale === 'zh' ? body.includes('资料暂时无法加载') : /temporarily unavailable|Unable to load|could not be loaded/i.test(body),
    recoveredRevision: body.includes(locale === 'zh' ? '缓存恢复验收资料' : 'Cache recovery acceptance article') };
  rows.push(row); console.log(JSON.stringify(row));
  if (report) await fs.writeFile(report + '.' + name + '-' + locale + '.html', body, {flag: 'wx'});
  assert.equal(row.status, 200, name + ' must not return an error page');
  assert.equal(row.hasArticles, expectedArticles, name + ' article state');
  assert.match(row.cacheControl || '', /no-store/, name + ' must not cache fallback HTML');
  assert.equal(row.cache, null, name + ' must consistently avoid a static page snapshot');
  assert.ok(row.ms < 2000, name + ' exceeds the one-second wait plus rendering allowance');
  if (!expectedArticles && locale === 'zh') assert.equal(row.hasFallback, true);
  return row;
}
let passed = false;
assert.ok(report, 'PRODUCTION_HOME_TEST_REPORT must name a new evidence file');
await fs.writeFile(report, JSON.stringify({status: 'running'}), {flag: 'wx'});
try {
  assert.ok(Number.isInteger(port) && port > 1024 && port < 65000);
  const fixture = start(['tests/visual/fixtures/news-server.mjs'], { VISUAL_NEWS_PORT: String(port + 1) });
  await ready(fixture, `http://127.0.0.1:${port + 1}/health`);
  proxy = createServer(async (req, res) => {
    if (req.method !== 'GET') { res.writeHead(405).end(); return; }
    requests.push({ at: new Date().toISOString(), mode, revision, path: req.url });
    const activeMode = mode, activeRevision = revision;
    if (activeMode === 'failure') { res.writeHead(503).end(); return; }
    if (activeMode === 'slow') await delay(2200);
    try {
      const upstream = await fetch(`http://127.0.0.1:${port + 1}${req.url}`);
      const text = await upstream.text();
      if (activeRevision === 2 && req.url.startsWith('/api/v1/news?')) {
        const data = JSON.parse(text);
        for (const item of data.data.items) if (item.slug === 'visual-test-annealing-selection') {
          item.titleZh = '缓存恢复验收资料'; item.titleEn = 'Cache recovery acceptance article';
          item.publishDate = '2026-10-15T00:00:00Z';
        }
        res.writeHead(upstream.status, { 'Content-Type': 'application/json' }).end(JSON.stringify(data));
      } else res.writeHead(upstream.status, { 'Content-Type': 'application/json' }).end(text);
    } catch { res.writeHead(503).end(); }
  });
  await new Promise(resolve => proxy.listen(port + 2, '127.0.0.1', resolve));
  // A unique local API origin gives a cold data-cache key without touching any
  // existing cache or changing its real five-minute lifetime.
  const app = start([require.resolve('next/dist/bin/next'), 'start', '-H', '127.0.0.1', '-p', String(port)], {
    NODE_ENV: 'production', API_BASE_URL_INTERNAL: `http://127.0.0.1:${port + 2}/api`,
  });
  await ready(app, `http://127.0.0.1:${port}/robots.txt`);
  for (const locale of ['zh', 'en']) await read('cold-failure', locale, false, true);
  mode = 'slow';
  for (const locale of ['zh', 'en']) await read('cold-slow', locale, false);
  await delay(2500); mode = 'fast';
  for (const locale of ['zh', 'en']) await read('late-data-recovery', locale, true);
  const beforeWarm = requests.length;
  for (const locale of ['zh', 'en']) await read('warm-cache', locale, true);
  assert.equal(requests.length, beforeWarm, 'Successful data must still be reused');
  console.log('Waiting for the unchanged 300-second data cache to expire.');
  await delay(301_000); mode = 'failure';
  for (const locale of ['zh', 'en']) await read('stale-refresh-failure', locale, true);
  await delay(500);
  assert.ok(requests.slice(beforeWarm).some(item => item.mode === 'failure'), 'Must actually exercise failed refresh');
  mode = 'fast'; revision = 2;
  for (const locale of ['zh', 'en']) await read('refresh-restored', locale, true);
  await delay(500);
  for (const locale of ['zh', 'en']) assert.equal((await read('fresh-revision', locale, true)).recoveredRevision, true, 'Recovered data must replace the retained stale collection');
  assert.doesNotMatch(logs, /DYNAMIC_SERVER_USAGE|changed from static to dynamic|app-static-to-dynamic-error/);
  passed = true;
} catch (error) {
  console.error(error); process.exitCode = 1;
} finally {
  for (const child of children.reverse()) {
    if (child.exitCode !== null) continue;
    child.kill('SIGTERM');
    await Promise.race([new Promise(resolve => child.once('exit', resolve)), delay(5000)]);
    if (child.exitCode === null) child.kill('SIGKILL');
  }
  if (proxy) { proxy.closeAllConnections(); await new Promise(resolve => proxy.close(resolve)); }
  if (report) {
    await fs.writeFile(report, JSON.stringify({ passed, checkedAt: new Date().toISOString(), mode: 'production build; isolated GET-only fixture; real unchanged 300-second data cache', rows, requests }, null, 2));
    await fs.writeFile(report + '.log', logs);
  }
  console.log(JSON.stringify({ passed, report, observations: rows.length }));
}
