import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { selectChangedUrls, sitemapEntries } from './changed-search-urls.mjs';
import { baiduSubmissionMode, describeSubmissionFailure, selectUnprotectedBaiduUrls, submitBaidu } from './submit-search-engines.mjs';

const site = 'https://www.jssngyl.cn';

async function withBaiduConfiguration(values, check) {
  const names = ['BAIDU_TOKEN', 'BAIDU_PUSH_TOKEN', 'BAIDU_SITE', 'BAIDU_PUSH_MAX_URLS', 'BAIDU_SUBMISSION_MODE', 'BAIDU_ALLOW_HTTP'];
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  try {
    for (const name of names) delete process.env[name];
    Object.assign(process.env, { BAIDU_TOKEN: 'test-only', BAIDU_SITE: site, BAIDU_PUSH_MAX_URLS: '10', ...values });
    await check();
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of names) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
  }
}

test('direct Baidu entry defaults to manual and never requests even with token and HTTP opt-in', async () => {
  for (const values of [{}, { BAIDU_ALLOW_HTTP: 'true' }, { BAIDU_SUBMISSION_MODE: 'manual', BAIDU_ALLOW_HTTP: 'true' }]) {
    await withBaiduConfiguration(values, async () => {
      let calls = 0;
      globalThis.fetch = async () => { calls++; throw new Error('must not request'); };
      const result = await submitBaidu(site, [`${site}/zh`], false);
      assert.equal(result.paused, true);
      assert.equal(result.skipped, true);
      assert.deepEqual(result.acceptedUrls, []);
      assert.equal(calls, 0);
    });
  }
});

test('invalid Baidu modes fail before requesting and do not treat the old auto spelling as authorization', async () => {
  assert.equal(baiduSubmissionMode(''), 'manual');
  for (const mode of ['auto', 'true', 'AUTOMATIC', 'invalid']) {
    await withBaiduConfiguration({ BAIDU_SUBMISSION_MODE: mode, BAIDU_ALLOW_HTTP: 'true' }, async () => {
      let calls = 0;
      globalThis.fetch = async () => { calls++; };
      await assert.rejects(submitBaidu(site, [`${site}/zh`], false), /Invalid Baidu submission mode/);
      assert.equal(calls, 0);
    });
  }
});

test('only literal true selects the fixed official HTTP endpoint in automatic mode', async () => {
  for (const value of [undefined, 'false', 'TRUE', '1', 'yes', ' true ', 'true']) {
    await withBaiduConfiguration({ BAIDU_SUBMISSION_MODE: 'automatic', ...(value === undefined ? {} : { BAIDU_ALLOW_HTTP: value }) }, async () => {
      let calls = 0;
      globalThis.fetch = async (endpoint, request) => {
        calls++;
        assert.equal(new URL(endpoint).origin, value === 'true' ? 'http://data.zz.baidu.com' : 'https://data.zz.baidu.com');
        assert.equal(new URL(endpoint).pathname, '/urls');
        assert.equal(request.redirect, 'error');
        assert.equal(request.body, `${site}/zh`);
        return new Response(JSON.stringify({ success: 1 }));
      };
      assert.equal((await submitBaidu(site, [`${site}/zh`], false)).ok, true);
      assert.equal(calls, 1);
    });
  }
});

test('Baidu keeps the validated registered site literal and encodes only the token', async () => {
  const token = 'test-only&other=/#?';
  for (const [registeredSite, submittedSite] of [
    [site, site], [`${site}/`, site], ['http://www.jssngyl.cn', 'http://www.jssngyl.cn'],
    ['www.jssngyl.cn', 'www.jssngyl.cn'],
  ]) {
    await withBaiduConfiguration({ BAIDU_SUBMISSION_MODE: 'automatic', BAIDU_SITE: registeredSite, BAIDU_TOKEN: token }, async () => {
      globalThis.fetch = async (endpoint) => {
        assert.equal(endpoint, `https://data.zz.baidu.com/urls?site=${submittedSite}&token=${encodeURIComponent(token)}`);
        assert.doesNotMatch(endpoint.split('&token=')[0], /%3A|%2F/i);
        assert.equal(new URL(endpoint).searchParams.get('token'), token);
        return new Response(JSON.stringify({ success: 1 }));
      };
      assert.equal((await submitBaidu(site, [`${site}/zh`], false)).ok, true);
    });
  }
});

test('Baidu rejects unsafe registered-site components before constructing a request', async () => {
  for (const registeredSite of [
    `${site}/path`, `${site}?token=injected`, `${site}#fragment`,
    'https://user:password@www.jssngyl.cn', 'ftp://www.jssngyl.cn',
  ]) {
    await withBaiduConfiguration({ BAIDU_SUBMISSION_MODE: 'automatic', BAIDU_SITE: registeredSite }, async () => {
      let calls = 0;
      globalThis.fetch = async () => { calls++; throw new Error('must not request'); };
      await assert.rejects(submitBaidu(site, [`${site}/zh`], false), /must match/);
      assert.equal(calls, 0);
    });
  }
});

test('Baidu failures expose only fixed categories and safe numeric response fields', async (t) => {
  const secret = 'token=test-only';
  const cases = [
    ['site error', 400, { error: 400, message: 'site error', success: 0, remain: 0, raw: secret }, 'site_error', { errorCode: 400, success: 0, remain: 0 }],
    ['empty content', 400, { error: 400, message: 'empty content', raw: secret }, 'empty_content', { errorCode: 400 }],
    ['invalid token', 401, { error: 401, message: 'token is not valid', raw: secret }, 'invalid_token', { errorCode: 401 }],
    ['over quota', 200, { error: 400, message: 'over quota', raw: secret }, 'over_quota', { errorCode: 400 }],
    ['unknown secret echo', 400, { error: 400, message: `${secret} site error over quota` }, 'baidu_error', { errorCode: 400 }],
    ['prototype-like message', 400, { error: 400, message: '__proto__', raw: secret }, 'baidu_error', { errorCode: 400 }],
    ['unsafe response fields', 400, { error: secret, message: { token: secret }, success: secret, remain: secret }, 'baidu_error', {}],
    ['unsafe integers', 400, { error: Number.MAX_SAFE_INTEGER + 1, success: Number.MAX_SAFE_INTEGER + 1, remain: -1, message: secret }, 'baidu_error', {}],
    ['HTTP failure', 503, { success: 1, remain: 4, message: secret }, 'http_error', { success: 1, remain: 4 }],
    ['invalid JSON', 200, `<html>${secret}</html>`, 'invalid_response', {}],
    ['incomplete batch', 200, { success: 0, remain: 4, message: secret }, 'incomplete_batch', { success: 0, remain: 4 }],
  ];
  for (const [name, status, body, reason, summary] of cases) {
    await t.test(name, async () => {
      await withBaiduConfiguration({ BAIDU_SUBMISSION_MODE: 'automatic' }, async () => {
        globalThis.fetch = async () => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });
        const result = await submitBaidu(site, [`${site}/zh`], false);
        assert.deepEqual(result, { skipped: false, ok: false, status, reason, ...summary, acceptedUrls: [], protectedUrls: [] });
        assert.doesNotMatch(JSON.stringify(result), /test-only|token=|__proto__/);
        assert.equal(Object.hasOwn(result, 'body'), false);
        assert.equal(Object.hasOwn(result, 'message'), false);
      });
    });
  }
});

test('explicit HTTP transport failure is attempted once with no other endpoint or fallback', async () => {
  await withBaiduConfiguration({ BAIDU_SUBMISSION_MODE: 'automatic', BAIDU_ALLOW_HTTP: 'true' }, async () => {
    let calls = 0;
    globalThis.fetch = async (endpoint, request) => {
      calls++;
      assert.equal(new URL(endpoint).origin, 'http://data.zz.baidu.com');
      assert.equal(request.redirect, 'error');
      throw new TypeError('test-only credential URL must not be logged');
    };
    await assert.rejects(submitBaidu(site, [`${site}/zh`], false), { name: 'TypeError' });
    assert.equal(calls, 1);
  });
});

test('Baidu response summaries cannot expose a credential echoed in raw response bodies', async () => {
  await withBaiduConfiguration({ BAIDU_SUBMISSION_MODE: 'automatic', BAIDU_ALLOW_HTTP: 'true' }, async () => {
    for (const body of [{ success: 1, message: 'token=test-only' }, { error: 400, message: 'token=test-only' }]) {
      globalThis.fetch = async () => new Response(JSON.stringify(body));
      const result = await submitBaidu(site, [`${site}/zh`], false);
      assert.doesNotMatch(JSON.stringify(result), /test-only|token=/);
      assert.equal(Object.hasOwn(result, 'body'), false);
    }
  });
});

test('selects additions and true content changes, not unchanged or removed pages', () => {
  const before = new Map([[`${site}/zh`, '2026-09-01'], [`${site}/zh/products`, ''], [`${site}/zh/gone`, '']]);
  const after = new Map([[`${site}/zh`, '2026-09-08'], [`${site}/zh/products`, ''], [`${site}/zh/new`, '']]);
  assert.deepEqual(selectChangedUrls(before, after), [`${site}/zh`, `${site}/zh/new`]);
});

test('Baidu refuses a different registered website before sending its credential', async () => {
  const original = globalThis.fetch;
  const saved = { BAIDU_TOKEN: process.env.BAIDU_TOKEN, BAIDU_SITE: process.env.BAIDU_SITE, BAIDU_SUBMISSION_MODE: process.env.BAIDU_SUBMISSION_MODE, BAIDU_ALLOW_HTTP: process.env.BAIDU_ALLOW_HTTP };
  try {
    process.env.BAIDU_SUBMISSION_MODE = 'automatic';
    delete process.env.BAIDU_ALLOW_HTTP;
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
    process.env.BAIDU_SUBMISSION_MODE = 'automatic';
    delete process.env.BAIDU_ALLOW_HTTP;
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
    for (const key of ['BAIDU_TOKEN', 'BAIDU_PUSH_MAX_URLS', 'BAIDU_SITE', 'BAIDU_SUBMISSION_MODE', 'BAIDU_ALLOW_HTTP']) {
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
    process.env.BAIDU_SUBMISSION_MODE = 'automatic';
    delete process.env.BAIDU_ALLOW_HTTP;
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
    for (const key of ['BAIDU_TOKEN', 'BAIDU_SITE', 'BAIDU_PUSH_MAX_URLS', 'BAIDU_SUBMISSION_MODE', 'BAIDU_ALLOW_HTTP']) {
      if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key];
    }
  }
});


async function withMockedBaidu(response, check) {
  const originalFetch = globalThis.fetch;
  const names = ['BAIDU_TOKEN', 'BAIDU_PUSH_TOKEN', 'BAIDU_SITE', 'BAIDU_PUSH_MAX_URLS', 'BAIDU_SUBMISSION_MODE', 'BAIDU_ALLOW_HTTP'];
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  const calls = [];
  try {
    process.env.BAIDU_SUBMISSION_MODE = 'automatic';
    delete process.env.BAIDU_ALLOW_HTTP;
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

test('manual protection distinguishes five reports and sixteen receipt records without claiming exact submission times', () => {
  assert.equal(protectedUrls.length, 21);
  assert.equal(new Set(protectedUrls).size, 21);
  assert.equal(manualProtection.entries.filter((entry) => entry.evidenceStatus === 'user-reported-submitted').length, 5);
  assert.equal(manualProtection.entries.filter((entry) => entry.evidenceStatus === 'platform-received').length, 16);
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

test('all registered manually handled URLs skip the API and never claim acceptance', async () => {
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


test('manual protection releases only the authorized address and exact observed content version', async () => {
  const url = protectedUrls[0]; const other = protectedUrls[1];
  const version = '2026-10-08T00:00:00Z';
  const registry = { ...manualProtection, releaseAuthorizations: [{ url, contentLastmod: version,
    authorizedBy: 'user', authorizationSource: 'test-human-explicit-version-release' }] };
  assert.deepEqual(selectUnprotectedBaiduUrls([url, other], new Map(), registry),
    { urls: [], protectedUrls: [url, other] });
  assert.deepEqual(selectUnprotectedBaiduUrls([url, other], new Map([[url, '2026-10-09T00:00:00Z']]), registry),
    { urls: [], protectedUrls: [url, other] });
  assert.deepEqual(selectUnprotectedBaiduUrls([url, other], new Map([[url, version]]), registry),
    { urls: [url], protectedUrls: [other] });
  await withMockedBaidu({ body: JSON.stringify({ success: 1 }) }, async (calls) => {
    const result = await submitBaidu(site, [url, other], false, 10, {
      liveVersions: new Map([[url, version]]), registry,
    });
    assert.deepEqual(calls, [url]);
    assert.deepEqual(result.acceptedUrls, [url]);
    assert.deepEqual(result.protectedUrls, [other]);
  });
});

test('an unproven release fails before sending a credential-bearing request', async () => {
  await withMockedBaidu({ body: JSON.stringify({ success: 1 }) }, async (calls) => {
    const registry = { ...manualProtection, releaseAuthorizations: [{ url: protectedUrls[0],
      contentLastmod: '2026-10-08T00:00:00Z', authorizedBy: 'automation', authorizationSource: 'not-human' }] };
    await assert.rejects(submitBaidu(site, [protectedUrls[0]], false, 10, {
      liveVersions: new Map([[protectedUrls[0], '2026-10-08T00:00:00Z']]), registry,
    }), /Invalid version-specific/);
    assert.deepEqual(calls, []);
  });
});
