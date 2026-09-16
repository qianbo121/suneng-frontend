import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectChangedUrls, sitemapEntries } from './changed-search-urls.mjs';
import { submitBaidu } from './submit-search-engines.mjs';

const site = 'https://www.jssngyl.cn';
test('selects additions and true content changes, not unchanged or removed pages', () => {
  const before = new Map([[`${site}/zh`, '2026-09-01'], [`${site}/zh/products`, ''], [`${site}/zh/gone`, '']]);
  const after = new Map([[`${site}/zh`, '2026-09-08'], [`${site}/zh/products`, ''], [`${site}/zh/new`, '']]);
  assert.deepEqual(selectChangedUrls(before, after), [`${site}/zh`, `${site}/zh/new`]);
});

test('Baidu refuses a different registered website before sending its credential', async () => {
  const original = globalThis.fetch;
  const saved = { BAIDU_TOKEN: process.env.BAIDU_TOKEN, BAIDU_SITE: process.env.BAIDU_SITE };
  try {
    process.env.BAIDU_TOKEN = 'test-only';
    process.env.BAIDU_SITE = 'https://wrong-site.example';
    let posts = 0;
    globalThis.fetch = async () => { posts++; return new Response('{}'); };
    await assert.rejects(submitBaidu(site, [`${site}/zh`], false), /must match/);
    assert.equal(posts, 0);
  } finally {
    globalThis.fetch = original;
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
test('maps body-only case edits and localized pages to actual sitemap entries', () => {
  const entries = new Map([[`${site}/zh/case/example`, ''], [`${site}/zh/products`, '']]);
  assert.deepEqual(selectChangedUrls(entries, entries, ['frontend/content/cases/example.md', 'frontend/src/app/[locale]/products/page.tsx'], [{ file: 'example.json', body: 'example.md', slug: 'example' }]), [...entries.keys()]);
});
test('decodes sitemap URLs and rejects a partial or empty response', () => {
  const result = sitemapEntries(`<urlset><url><loc>${site}/zh/news?a=1&amp;b=2</loc><lastmod>2026-09-08</lastmod></url></urlset>`);
  assert.equal(result.get(`${site}/zh/news?a=1&b=2`), '2026-09-08');
  assert.throws(() => sitemapEntries('<html>upstream unavailable</html>'));
  assert.throws(() => sitemapEntries(`<urlset><url><loc>${site}/zh</loc></url>`), /incomplete/);
});
test('Baidu uses the shared token, respects budget, and detects HTTP-200 quota errors', async () => {
  const original = globalThis.fetch;
  const old = { ...process.env };
  try {
    process.env.BAIDU_TOKEN = 'test-only';
    process.env.BAIDU_SITE = 'www.jssngyl.cn';
    process.env.BAIDU_PUSH_MAX_URLS = '1';
    globalThis.fetch = async (url, options) => {
      assert.equal(new URL(url).searchParams.get('token'), 'test-only');
      assert.equal(new URL(url).searchParams.get('site'), 'www.jssngyl.cn');
      assert.equal(options.body, `${site}/zh`);
      return new Response(JSON.stringify({ error: 400, message: 'over quota' }), { status: 200 });
    };
    assert.equal((await submitBaidu(site, [`${site}/zh`, `${site}/zh/products`], false)).ok, false);
  } finally {
    globalThis.fetch = original;
    for (const key of ['BAIDU_TOKEN', 'BAIDU_PUSH_MAX_URLS', 'BAIDU_SITE']) {
      if (old[key] === undefined) delete process.env[key]; else process.env[key] = old[key];
    }
  }
});
