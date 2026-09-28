import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const frontend = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(new URL('../package.json', import.meta.url));
const port = Number(process.env.PRODUCTION_NEWS_TEST_PORT || 3196);
const apiPort = port + 1;
const children = [];
let logs = '';
function start(args, env) {
  const child = spawn(process.execPath, args, { cwd: frontend, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  for (const stream of [child.stdout, child.stderr]) stream.on('data', data => { logs = (logs + data).slice(-30_000); });
  children.push(child);
  return child;
}
async function ready(url, child) {
  for (let attempt = 0; attempt < 60; attempt++) {
    assert.equal(child.exitCode, null, 'The isolated server exited before becoming ready');
    try {
      if ((await fetch(url, { signal: AbortSignal.timeout(1500) })).ok) return;
    } catch { /* The task-owned server is still starting. */ }
    await delay(500);
  }
  throw new Error('Timed out waiting for the isolated production server');
}
async function get(path, expected) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, { redirect: 'manual', signal: AbortSignal.timeout(15_000) });
  const body = await response.text();
  assert.equal(response.status, expected, `${path} returned ${response.status}`);
  return { response, body };
}

try {
  const fixture = start(['tests/visual/fixtures/news-server.mjs'], { VISUAL_NEWS_PORT: String(apiPort) });
  await ready(`http://127.0.0.1:${apiPort}/health`, fixture);
  const fixtureResponse = await fetch(`http://127.0.0.1:${apiPort}/api/v1/news?pageSize=100`);
  const fixtureItems = (await fixtureResponse.json()).data.items;
  const server = start([require.resolve('next/dist/bin/next'), 'start', '-H', '127.0.0.1', '-p', String(port)], {
    NODE_ENV: 'production', API_BASE_URL_INTERNAL: `http://127.0.0.1:${apiPort}/api`,
  });
  await ready(`http://127.0.0.1:${port}/zh`, server);
  for (const locale of ['zh', 'en']) {
    const expected = fixtureItems
      .filter(item => locale === 'zh' || (item.titleEn?.trim() && item.contentEn?.replace(/<[^>]+>/g, '').trim()))
      .sort((a, b) => Date.parse(b.publishDate) - Date.parse(a.publishDate) || a.id - b.id);
    const pageCount = Math.ceil(expected.length / 10);
    for (const pass of ['cold', 'warm']) {
      const ids = [];
      for (let page = 1; page <= pageCount; page++) {
        const path = `/${locale}/news${page === 1 ? '' : `?page=${page}`}`;
        const { response, body } = await get(path, 200);
        const cards = [...body.matchAll(/<article\b[^>]*data-news-id="(\d+)"[^>]*>([\s\S]*?)<\/article>/g)];
        const expectedPage = expected.slice((page - 1) * 10, page * 10);
        assert.deepEqual(cards.map(card => Number(card[1])), expectedPage.map(item => item.id), `${pass} ${path} must render every article in publication order`);
        assert.match(response.headers.get('cache-control') || '', /no-store/, `${path} must not retain an independent page snapshot`);
        for (const [index, card] of cards.entries()) {
          const publicationDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(expectedPage[index].publishDate));
          assert.match(card[2], new RegExp(`<time[^>]*dateTime="${publicationDate}"`), `${path} must display its publication date`);
          ids.push(Number(card[1]));
        }
      }
      assert.equal(new Set(ids).size, expected.length, `${pass} ${locale} pages must have no duplicates or omissions`);
    }
    await get(`/${locale}/news?page=${pageCount + 1}`, 404);
    const missingPage = await get(`/${locale}/news?page=100`, 404);
    assert.equal(missingPage.response.headers.get('x-robots-tag'), 'noindex');
    const missingRoute = await get(`/${locale}/production-route-missing`, 404);
    assert.match(missingRoute.body, new RegExp(`<html[^>]*lang="${locale === 'en' ? 'en' : 'zh-CN'}"`));
    assert.match(missingRoute.body, locale === 'en' ? /<title>Page Not Found \| Suneng<\/title>/ : /<title>页面未找到｜苏能工业炉<\/title>/);
    assert.match(missingRoute.body, new RegExp(`href="/${locale}"`));
  }
  console.log('Production news regression passed: cold and warm bilingual lists, publication dates, every article exactly once, missing pages and localized 404 HTML.');
} catch (error) {
  console.error(logs);
  console.error(error);
  process.exitCode = 1;
} finally {
  for (const child of children.reverse()) {
    if (child.exitCode !== null) continue;
    child.kill('SIGTERM');
    await Promise.race([new Promise(resolve => child.once('exit', resolve)), delay(5000)]);
    if (child.exitCode === null) child.kill('SIGKILL');
  }
}
