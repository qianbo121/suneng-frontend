import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { selectChangedUrls, sitemapEntries } from './changed-search-urls.mjs';
import { describeSubmissionFailure, selectUnprotectedBaiduUrls, submitBaidu } from './submit-search-engines.mjs';

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
      assert.equal(new URL(url).protocol, 'https:');
      assert.equal(options.redirect, 'error');
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

test('transport diagnostics use only fixed descriptions, never raw errors or credential URLs', () => {
  const secretUrl = 'https://data.zz.baidu.com/urls?token=test-secret-do-not-log';
  const tls = Object.assign(new Error(secretUrl), { code: 'ERR_TLS_CERT_ALTNAME_INVALID' });
  const description = describeSubmissionFailure(new TypeError(secretUrl, { cause: tls }));
  assert.match(description, /certificate does not match/);
  assert.match(description, /no insecure fallback/);
  assert.doesNotMatch(description, /token=|test-secret|data\.zz/);
  for (const [code, expected] of [
    ['CERT_HAS_EXPIRED', /certificate validation failed/],
    ['ENOTFOUND', /DNS lookup failed/],
    ['UND_ERR_CONNECT_TIMEOUT', /timed out/],
    ['ECONNRESET', /connection failed/],
  ]) {
    assert.match(describeSubmissionFailure({ cause: { code, message: secretUrl } }), expected);
  }
  assert.match(describeSubmissionFailure({ name: 'TimeoutError', message: secretUrl }), /timed out/);
  const unknown = Object.assign(new Error(secretUrl), { code: secretUrl });
  unknown.cause = unknown;
  for (const error of [unknown, secretUrl, null]) {
    assert.equal(describeSubmissionFailure(error), 'request failed; acceptance is unconfirmed');
  }
});

test('Baidu TLS failure makes one HTTPS attempt without redirect or insecure fallback', async () => {
  const original = globalThis.fetch;
  const saved = { ...process.env };
  try {
    process.env.BAIDU_TOKEN = 'test-only';
    process.env.BAIDU_SITE = site;
    process.env.BAIDU_PUSH_MAX_URLS = '10';
    let attempts = 0;
    globalThis.fetch = async (endpoint, options) => {
      attempts++;
      assert.equal(new URL(endpoint).origin, 'https://data.zz.baidu.com');
      assert.equal(options.redirect, 'error');
      throw new TypeError('fetch failed', { cause: { code: 'ERR_TLS_CERT_ALTNAME_INVALID' } });
    };
    await assert.rejects(submitBaidu(site, [`${site}/zh`], false), { name: 'TypeError' });
    assert.equal(attempts, 1);
  } finally {
    globalThis.fetch = original;
    for (const key of ['BAIDU_TOKEN', 'BAIDU_SITE', 'BAIDU_PUSH_MAX_URLS']) {
      if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key];
    }
  }
});


async function withMockedBaidu(response, check) {
  const originalFetch = globalThis.fetch;
  const names = ['BAIDU_TOKEN', 'BAIDU_PUSH_TOKEN', 'BAIDU_SITE', 'BAIDU_PUSH_MAX_URLS'];
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  const calls = [];
  try {
    process.env.BAIDU_TOKEN = 'test-only';
    delete process.env.BAIDU_PUSH_TOKEN;
    process.env.BAIDU_SITE = site;
    process.env.BAIDU_PUSH_MAX_URLS = '10';
    globalThis.fetch = async (endpoint, options) => {
      assert.equal(new URL(endpoint).origin, 'https://data.zz.baidu.com');
      assert.equal(options.redirect, 'error');
      calls.push(options.body);
      return new Response(response.body, { status: response.status ?? 200 });
    };
    await check(calls);
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of names) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
  }
}

test('Baidu accepts only the exact selected batch and returns only those URLs', async () => {
  const urls = [`${site}/zh/news/test-one`, `${site}/zh/news/test-two`];
  await withMockedBaidu({ body: JSON.stringify({ success: 2, remain: 0, not_valid: [], not_same_site: [] }) }, async (calls) => {
    const result = await submitBaidu(site, urls, false);
    assert.equal(result.ok, true);
    assert.deepEqual(result.acceptedUrls, urls);
    assert.deepEqual(calls, [urls.join('\n')]);
  });
  await withMockedBaidu({ body: JSON.stringify({ success: 1 }) }, async (calls) => {
    const result = await submitBaidu(site, urls, false, 1);
    assert.equal(result.ok, true);
    assert.deepEqual(result.acceptedUrls, urls.slice(0, 1));
    assert.deepEqual(calls, [urls[0]]);
  });
});

test('Baidu rejects malformed, contradictory, partial and invalid acceptance replies', async (t) => {
  const urls = [`${site}/zh/news/test-one`, `${site}/zh/news/test-two`];
  const cases = [
    ['invalid JSON', '{'], ['empty body', ''],
    ['null', 'null'], ['array', '[]'], ['string', '"accepted"'], ['number', '2'],
    ['missing success', {}], ['zero accepted', { success: 0 }], ['partial accepted', { success: 1 }],
    ['excess accepted', { success: 3 }], ['string count', { success: '2' }],
    ['boolean count', { success: true }], ['fractional count', { success: 2.5 }],
    ['negative count', { success: -2 }], ['unsafe count', { success: Number.MAX_SAFE_INTEGER + 1 }],
    ['error field zero', { success: 2, error: 0 }], ['error field null', { success: 2, error: null }],
    ['error field message', { success: 2, error: 400 }],
    ['negative quota', { success: 2, remain: -1 }], ['fractional quota', { success: 2, remain: 1.5 }],
    ['string quota', { success: 2, remain: '10' }], ['null quota', { success: 2, remain: null }],
    ['unsafe quota', { success: 2, remain: Number.MAX_SAFE_INTEGER + 1 }],
    ['invalid URLs', { success: 2, not_valid: [urls[0]] }],
    ['off-site URLs', { success: 2, not_same_site: ['https://other.example/test'] }],
    ['invalid field type', { success: 2, not_valid: '' }],
    ['off-site field type', { success: 2, not_same_site: null }],
  ];
  for (const [name, body] of cases) {
    await t.test(name, async () => {
      await withMockedBaidu({ body: typeof body === 'string' ? body : JSON.stringify(body) }, async (calls) => {
        const result = await submitBaidu(site, urls, false);
        assert.equal(result.ok, false);
        assert.deepEqual(result.acceptedUrls, []);
        assert.deepEqual(calls, [urls.join('\n')]);
      });
    });
  }
});

test('Baidu HTTP failures remain unaccepted even with an exact positive count', async () => {
  const urls = [`${site}/zh/news/test-one`];
  await withMockedBaidu({ status: 503, body: JSON.stringify({ success: 1 }) }, async (calls) => {
    const result = await submitBaidu(site, urls, false);
    assert.equal(result.ok, false);
    assert.equal(result.status, 503);
    assert.deepEqual(result.acceptedUrls, []);
    assert.deepEqual(calls, [urls[0]]);
  });
});


const manualProtection = JSON.parse(readFileSync(new URL('./baidu-manual-submission-protection.json', import.meta.url), 'utf8'));
const protectedUrls = manualProtection.entries.map((entry) => entry.url);

test('manual protection distinguishes five user reports from three platform receipts without claiming a timestamp', () => {
  assert.equal(protectedUrls.length, 8);
  assert.equal(new Set(protectedUrls).size, 8);
  assert.equal(manualProtection.entries.filter((entry) => entry.evidenceStatus === 'user-reported-submitted').length, 5);
  assert.equal(manualProtection.entries.filter((entry) => entry.evidenceStatus === 'platform-received').length, 3);
  assert.equal(manualProtection.entries.every((entry) => entry.exactSubmissionTime === null), true);
  assert.match(manualProtection.releaseCondition, /substantial content update or explicit resubmission authorization/);
  assert.deepEqual(selectUnprotectedBaiduUrls([...protectedUrls, `${site}/zh/news/new-unhandled`]), {
    urls: [`${site}/zh/news/new-unhandled`], protectedUrls,
  });
});

test('mixed manual and unhandled URLs send and accept only the unhandled URL', async () => {
  const fresh = `${site}/zh/news/new-unhandled`;
  const held = [protectedUrls[0], protectedUrls[7]];
  await withMockedBaidu({ body: JSON.stringify({ success: 1 }) }, async (calls) => {
    const result = await submitBaidu(site, [held[0], fresh, held[1]], false, 1);
    assert.equal(result.ok, true);
    assert.deepEqual(result.acceptedUrls, [fresh]);
    assert.deepEqual(result.protectedUrls, held);
    assert.deepEqual(calls, [fresh]);
  });
});

test('all eight manually handled URLs skip the API and never claim acceptance', async () => {
  await withMockedBaidu({ body: JSON.stringify({ success: 8 }) }, async (calls) => {
    const result = await submitBaidu(site, protectedUrls, false);
    assert.equal(result.skipped, true);
    assert.equal(result.ok, undefined);
    assert.deepEqual(result.acceptedUrls, []);
    assert.deepEqual(result.protectedUrls, protectedUrls);
    assert.deepEqual(calls, []);
    assert.match(result.reason, /no API attempt or acceptance/);
  });
});

test('a bad mixed-batch count cannot turn protected URLs into API acceptances', async () => {
  const fresh = `${site}/zh/news/new-unhandled`;
  await withMockedBaidu({ body: JSON.stringify({ success: 2 }) }, async (calls) => {
    const result = await submitBaidu(site, [protectedUrls[0], fresh], false);
    assert.equal(result.ok, false);
    assert.deepEqual(result.acceptedUrls, []);
    assert.deepEqual(result.protectedUrls, [protectedUrls[0]]);
    assert.deepEqual(calls, [fresh]);
  });
});
