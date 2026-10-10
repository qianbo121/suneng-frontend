import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drainQueue, emptyQueue, mergeBatches, preserveBaiduManualBackup, reconcileBaiduManualQueue, refreshLiveQueue, validateQueue } from './search-submission-queue.mjs';
import { readFileSync } from 'node:fs';
import { manualBatch, restoreQueue } from './restore-search-queue.mjs';
import { submitBaidu, submitIndexNow } from './submit-search-engines.mjs';

const urls = ['a', 'b', 'c'].map((path) => `https://www.jssngyl.cn/zh/${path}`);
const queued = () => mergeBatches(emptyQueue(), [{ id: 'deploy-1', urls }], urls);
const success = async (batch) => ({ ok: true, acceptedUrls: batch });
const options = (extra = {}) => ({ day: '2026-09-08', limit: 2, baiduMode: 'automatic', available: { baidu: true, indexnow: true }, submit: { baidu: success, indexnow: success }, save: async () => {}, ...extra });

test('queue normalizes manual mode with the same parser as the direct entry before sending', async () => {
  const state = queued();
  let baiduRequests = 0;
  const result = await drainQueue(state, options({ baiduMode: ' manual ', submit: {
    indexnow: success, baidu: async () => { baiduRequests++; },
  } }));
  assert.equal(result.baidu.paused, true);
  assert.equal(baiduRequests, 0);
  assert.equal(state.baiduAttempted, 0);
  assert.deepEqual(state.pending.baidu, urls);
});

test('HTTP quota, partial or unreadable receipts and transport failure retain the durable queue', async () => {
  const names = ['BAIDU_TOKEN', 'BAIDU_PUSH_TOKEN', 'BAIDU_SITE', 'BAIDU_PUSH_MAX_URLS', 'BAIDU_SUBMISSION_MODE', 'BAIDU_ALLOW_HTTP'];
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  try {
    for (const name of names) delete process.env[name];
    Object.assign(process.env, { BAIDU_TOKEN: 'test-only', BAIDU_SITE: 'https://www.jssngyl.cn', BAIDU_SUBMISSION_MODE: 'automatic', BAIDU_ALLOW_HTTP: 'true' });
    for (const body of [JSON.stringify({ error: 400, message: 'over quota' }), JSON.stringify({ success: 1 }), '{', null]) {
      let calls = 0;
      let snapshot;
      globalThis.fetch = async (endpoint, request) => {
        calls++;
        assert.equal(new URL(endpoint).origin, 'http://data.zz.baidu.com');
        assert.equal(request.redirect, 'error');
        if (body === null) throw new TypeError('transport failure');
        return new Response(body);
      };
      const state = queued();
      const result = await drainQueue(state, options({ baiduMode: undefined,
        submit: { indexnow: success, baidu: (sent) => submitBaidu('https://www.jssngyl.cn', sent, false) },
        save: async (value) => { snapshot = structuredClone(value); },
      }));
      assert.equal(result.baidu.ok, false);
      assert.deepEqual(snapshot.pending.baidu, urls);
      assert.equal(snapshot.baiduAttempted, 2);
      assert.equal(calls, 1);
      assert.doesNotMatch(JSON.stringify(result), /test-only|token=/);
      assert.deepEqual(validateQueue(JSON.parse(JSON.stringify(snapshot))).pending.baidu, urls);
    }
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of names) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
  }
});

const baseline = () => ({ version: 1, site: 'https://www.jssngyl.cn', entries: [[urls[0], ''], [urls[1], '2026-09-19']], initialPending: [] });

test('discovers real live additions and dated edits, not candidate builds or unchanged undated pages', () => {
  const state = emptyQueue();
  assert.deepEqual(refreshLiveQueue(state, new Map(baseline().entries), baseline()), []);
  assert.deepEqual(state.pending.baidu, []);
  const live = new Map([[urls[0], ''], [urls[1], '2026-09-20'], [urls[2], '']]);
  assert.deepEqual(refreshLiveQueue(state, live, baseline()), [urls[1], urls[2]]);
  assert.deepEqual(state.pending.baidu, [urls[1], urls[2]]);
});

test('first upgrade seeds only eight confirmed live guides, not all 208 canonical URLs', async () => {
  const seed = JSON.parse(readFileSync(new URL('./search-live-baseline.json', import.meta.url), 'utf8'));
  assert.equal(seed.entries.length, 208);
  assert.equal(seed.initialPending.length, 8);
  const state = emptyQueue();
  refreshLiveQueue(state, new Map(seed.entries), seed);
  assert.deepEqual(state.pending.baidu, seed.initialPending);
  await drainQueue(state, options({ limit: 10 }));
  const restored = JSON.parse(JSON.stringify(state));
  refreshLiveQueue(restored, new Map(seed.entries), seed);
  assert.deepEqual(restored.pending, { baidu: [], indexnow: [] });
});

test('live snapshot and pending URLs survive rejected submissions together, without requeueing accepted URLs', async () => {
  const state = queued(); // Old snapshot format without liveSitemap is supported.
  const live = new Map([[urls[0], ''], [urls[1], '2026-09-20'], [urls[2], '']]);
  refreshLiveQueue(state, live, baseline());
  let saved;
  await drainQueue(state, options({ save: async value => { saved = structuredClone(value); }, submit: {
    indexnow: success, baidu: async () => ({ ok: false }),
  } }));
  assert.deepEqual(saved.liveSitemap.entries, [...live]);
  assert.deepEqual(saved.pending.baidu, urls);
  refreshLiveQueue(saved, live, baseline());
  assert.deepEqual(saved.pending.indexnow, []);
  assert.deepEqual(saved.pending.baidu, urls);
  // An actual later edit to the same address is a new batch, including a reversion.
  live.set(urls[1], '2026-09-19');
  refreshLiveQueue(saved, live, baseline());
  assert.deepEqual(saved.pending.indexnow, [urls[1]]);
});

test('removed live URLs drop out; corrupt or cross-site snapshots fail before state mutation', () => {
  const state = queued();
  refreshLiveQueue(state, new Map([[urls[0], '']]), baseline());
  assert.deepEqual(state.pending.baidu, [urls[0]]);
  const before = structuredClone(state);
  for (const live of [new Map(), new Map([['https://foreign.example/page', '']]), new Map([[urls[0], null]])]) {
    assert.throws(() => refreshLiveQueue(state, live, baseline()));
    assert.deepEqual(state, before);
  }
  assert.throws(() => validateQueue({ ...state, liveSitemap: { revision: 0, site: baseline().site, entries: baseline().entries } }));
});

test('retains excess Baidu URLs across serialized runs and drains them on the next day', async () => {
  let state = queued();
  await drainQueue(state, options());
  assert.deepEqual(state.pending, { baidu: [urls[2]], indexnow: [] });
  state = JSON.parse(JSON.stringify(state));
  mergeBatches(state, [{ id: 'deploy-1', urls }], urls);
  await drainQueue(state, options());
  assert.deepEqual(state.pending.baidu, [urls[2]]);
  await drainQueue(state, options({ day: '2026-09-09' }));
  assert.deepEqual(state.pending.baidu, []);
});

test('a later content edit requeues a previously accepted URL once, and removed pages drop out', async () => {
  const state = queued();
  await drainQueue(state, options({ limit: 10 }));
  mergeBatches(state, [{ id: 'deploy-2', urls: [urls[0], urls[1], 'https://external.test/'] }], [urls[0]]);
  assert.deepEqual(state.pending, { baidu: [urls[0]], indexnow: [urls[0]] });
});

test('missing credentials preserve both queues without reserving quota', async () => {
  const state = queued();
  await drainQueue(state, options({ available: { baidu: false, indexnow: false }, submit: {} }));
  assert.deepEqual(state.pending, { baidu: urls, indexnow: urls });
  assert.equal(state.baiduAttempted, 0);
});

test('manual-only mode sends no Baidu request, reserves no budget and leaves IndexNow working', async () => {
  for (const hasCredential of [true, false]) {
    const state = queued();
    let saved;
    let baiduRequests = 0;
    const result = await drainQueue(state, options({
      baiduMode: 'manual',
      available: { baidu: hasCredential, indexnow: true },
      submit: { indexnow: success, baidu: async () => { baiduRequests++; return { ok: true }; } },
      save: async value => { saved = structuredClone(value); },
    }));
    assert.equal(baiduRequests, 0);
    assert.equal(saved.baiduAttempted, 0);
    assert.deepEqual(saved.pending, { baidu: urls, indexnow: [] });
    assert.equal(result.indexnow.ok, true);
    assert.equal(result.baidu.paused, true);
    assert.equal(result.baidu.skipped, true);
    assert.equal(result.baidu.ok, undefined);
    assert.match(result.baidu.reason, /not accepted/);
    assert.doesNotMatch(result.baidu.reason, /credentials/);
  }
});

test('default manual mode preserves restored URLs and live additions across days', async () => {
  const state = queued();
  state.pending.baidu = [urls[0], urls[1]];
  state.pending.indexnow = [];
  state.liveSitemap = { site: baseline().site, revision: 1, entries: baseline().entries };
  const live = new Map([...baseline().entries, [urls[2], '']]);
  refreshLiveQueue(state, live, baseline());
  const manualOptions = options({ baiduMode: undefined, submit: { indexnow: success } });
  await drainQueue(state, manualOptions);
  const restored = JSON.parse(JSON.stringify(state));
  refreshLiveQueue(restored, live, baseline());
  await drainQueue(restored, { ...manualOptions, day: '2026-09-09' });
  assert.deepEqual(restored.pending, { baidu: urls, indexnow: [] });
  assert.equal(restored.baiduAttempted, 0);
});

test('invalid manual-mode configuration fails before saving or sending', async () => {
  let writes = 0;
  let requests = 0;
  await assert.rejects(drainQueue(queued(), options({
    baiduMode: 'manul',
    save: async () => { writes++; },
    submit: { indexnow: async () => { requests++; }, baidu: async () => { requests++; } },
  })), /Invalid Baidu submission mode/);
  assert.equal(writes, 0);
  assert.equal(requests, 0);
});

test('scheduled queue wires owner-controlled mode and HTTP opt-in with safe defaults', () => {
  const workflow = readFileSync(new URL('../../.github/workflows/search-submission.yml', import.meta.url), 'utf8');
  assert.match(workflow, /BAIDU_SUBMISSION_MODE: \$\{\{ vars\.BAIDU_SUBMISSION_MODE \|\| 'manual' \}\}/);
  assert.match(workflow, /BAIDU_ALLOW_HTTP: \$\{\{ vars\.BAIDU_ALLOW_HTTP \|\| 'false' \}\}/);
  assert.match(workflow, /BAIDU_SITE: \$\{\{ vars\.BAIDU_SITE \}\}/);
  assert.match(workflow, /BAIDU_TOKEN: \$\{\{ secrets\.BAIDU_TOKEN \|\| secrets\.BAIDU_PUSH_TOKEN \}\}/);
  assert.match(workflow, /INDEXNOW_KEY: \$\{\{ secrets\.INDEXNOW_KEY \}\}/);
  assert.match(workflow, /name: Preserve queue even when a search engine rejects the request/);
});

test('network and partial-response failures retain pending URLs and reserve ambiguous quota before POST', async () => {
  const state = queued();
  let saved;
  const result = await drainQueue(state, options({
    save: async (value) => { saved = structuredClone(value); },
    submit: { indexnow: async () => { throw new Error('timeout'); }, baidu: async () => {
      assert.equal(saved.baiduAttempted, 2);
      return { ok: false, status: 200, body: '{"success":1}' };
    } },
  }));
  assert.deepEqual(state.pending, { baidu: urls, indexnow: urls });
  assert.equal(result.baidu.ok, false);
  assert.equal(result.indexnow.ok, false);
});

test('Baidu certificate failure is explicit, retains all pending URLs, and does not block IndexNow', async () => {
  const state = queued();
  let saved;
  let attempts = 0;
  const result = await drainQueue(state, options({
    save: async (value) => { saved = structuredClone(value); },
    submit: { indexnow: success, baidu: async () => {
      attempts++;
      throw new TypeError('https://data.zz.baidu.com/urls?token=test-secret', {
        cause: { code: 'ERR_TLS_CERT_ALTNAME_INVALID', message: 'test-secret' },
      });
    } },
  }));
  assert.equal(result.baidu.ok, false);
  assert.match(result.baidu.reason, /certificate does not match/);
  assert.match(result.baidu.reason, /pending URLs retained/);
  assert.doesNotMatch(JSON.stringify(result), /test-secret|token=/);
  assert.equal(result.indexnow.ok, true);
  assert.deepEqual(saved.pending, { baidu: urls, indexnow: [] });
  assert.equal(saved.baiduAttempted, 2);
  await drainQueue(saved, options({ submit: { indexnow: success, baidu: async () => { attempts++; } } }));
  assert.equal(attempts, 1); // Same-day re-runs do not repeat the attempted batch.
});

test('invalid state, invalid limit and a future budget date stop without silently resetting', async () => {
  assert.throws(() => validateQueue({ version: 1 }));
  await assert.rejects(drainQueue(queued(), options({ limit: 0 })));
  const state = queued(); state.baiduDay = '2026-09-10';
  await assert.rejects(drainQueue(state, options()));
});

test('failed persistence stops before any POST', async () => {
  let posts = 0;
  await assert.rejects(drainQueue(queued(), options({ save: async () => { throw new Error('disk full'); }, submit: { baidu: async () => { posts++; }, indexnow: async () => { posts++; } } })));
  assert.equal(posts, 0);
});

const repository = 'owner/site';
const run = (path, extra = {}) => ({ repository: { full_name: repository }, head_repository: { full_name: repository }, head_branch: 'main', path, status: 'completed', conclusion: 'success', event: 'workflow_dispatch', ...extra });
test('restores failed-run queue snapshots and all unseen successful deployments; ignores fork artifacts', async () => {
  const state = queued(); state.sources = ['4'];
  const artifacts = [
    { id: 8, name: 'search-queue-state-8', workflow_run: { id: 8 } },
    { id: 4, name: 'search-changes-4', workflow_run: { id: 4 } },
    { id: 5, name: 'search-changes-5', workflow_run: { id: 5 } },
    { id: 6, name: 'search-changes-6', workflow_run: { id: 6 } },
  ];
  const restored = await restoreQueue({ artifacts, previousRuns: [], repository, currentRunId: 9,
    runInfo: async (id) => id === 8 ? run('.github/workflows/search-submission.yml', { conclusion: 'failure' }) : run('.github/workflows/deploy.yml', id === 6 ? { head_repository: { full_name: 'fork/site' } } : {}),
    download: async (artifact) => artifact.id === 8 ? state : urls,
  });
  assert.deepEqual(restored.state, state);
  assert.deepEqual(restored.batches, [{ id: '5', urls }]);
});

test('missing or expired queue archives block instead of creating a fresh empty queue', async () => {
  const base = { artifacts: [], previousRuns: [{ id: 1, head_branch: 'main' }], repository, currentRunId: 2 };
  await assert.rejects(restoreQueue(base), /missing/);
  await assert.rejects(restoreQueue({ ...base, artifacts: [{ id: 1, name: 'search-queue-state-1', expired: true, workflow_run: { id: 1 } }], runInfo: async () => run('.github/workflows/search-submission.yml') }), /expired/);
  assert.deepEqual((await restoreQueue({ ...base, previousRuns: [] })).state, emptyQueue());
});

test('IndexNow stops before POST if the public ownership key does not match', async () => {
  const original = globalThis.fetch; const key = process.env.INDEXNOW_KEY; const location = process.env.INDEXNOW_KEY_LOCATION;
  try {
    process.env.INDEXNOW_KEY = 'test-key-123456'; delete process.env.INDEXNOW_KEY_LOCATION;
    let posts = 0;
    globalThis.fetch = async (_url, request) => { if (request.method === 'POST') posts++; return new Response('wrong-key'); };
    await assert.rejects(submitIndexNow('https://www.jssngyl.cn', urls, false), /does not match/);
    assert.equal(posts, 0);
  } finally {
    globalThis.fetch = original;
    if (key === undefined) delete process.env.INDEXNOW_KEY; else process.env.INDEXNOW_KEY = key;
    if (location === undefined) delete process.env.INDEXNOW_KEY_LOCATION; else process.env.INDEXNOW_KEY_LOCATION = location;
  }
});

test('accepts URLs named at dispatch as one single-use batch, and only from the live sitemap', () => {
  const batch = manualBatch(`${urls[0]}\n  ${urls[1]}  \n\n${urls[0]}\n`, '42', '2');
  assert.deepEqual(batch, { id: 'manual-42-2', urls: [urls[0], urls[1]] });
  // Replaying the same batch id adds nothing; an address outside the sitemap is dropped.
  const state = mergeBatches(emptyQueue(), [batch, batch, { id: 'manual-42-3', urls: ['https://www.jssngyl.cn/zh/gone'] }], urls);
  assert.deepEqual(state.pending.indexnow, [urls[0], urls[1]]);
  assert.equal(manualBatch('', '42', '1'), null);
  assert.equal(manualBatch(undefined, '42', '1'), null);
  assert.equal(manualBatch(urls[0], '7', undefined).id, 'manual-7-1');
  assert.throws(() => manualBatch(urls[0], '', '1'), /run id/);
});


const heldBaiduUrls = JSON.parse(readFileSync(new URL('./baidu-manual-submission-protection.json', import.meta.url), 'utf8')).entries.map((entry) => entry.url);
const withHeldQueue = (batch) => mergeBatches(emptyQueue(), [{ id: 'manual-and-new', urls: batch }], batch);

test('Baidu protects manual URLs before budget slicing while IndexNow processes the full mixed batch', async () => {
  const batch = [heldBaiduUrls[0], urls[0], heldBaiduUrls[7], urls[1]];
  const state = withHeldQueue(batch);
  let baiduBatch;
  let indexNowBatch;
  const result = await drainQueue(state, options({ limit: 1, submit: {
    indexnow: async (sent) => { indexNowBatch = sent; return success(sent); },
    baidu: async (sent) => {
      assert.equal(state.baiduAttempted, 1);
      baiduBatch = sent;
      return success(sent);
    },
  } }));
  assert.deepEqual(indexNowBatch, batch);
  assert.deepEqual(baiduBatch, [urls[0]]);
  assert.equal(state.baiduAttempted, 1);
  assert.deepEqual(state.pending, { baidu: [heldBaiduUrls[0], heldBaiduUrls[7], urls[1]], indexnow: [] });
  assert.deepEqual(result.baidu.acceptedUrls, [urls[0]]);
  assert.deepEqual(result.baidu.protectedUrls, [heldBaiduUrls[0], heldBaiduUrls[7]]);
});

test('all manually handled Baidu URLs remain protected across runs without attempts or API acceptance', async () => {
  const state = withHeldQueue(heldBaiduUrls);
  let requests = 0;
  const opts = options({ submit: { indexnow: success, baidu: async () => { requests++; } } });
  const result = await drainQueue(state, opts);
  await drainQueue(state, { ...opts, day: '2026-09-09' });
  assert.equal(requests, 0);
  assert.equal(state.baiduAttempted, 0);
  assert.deepEqual(state.pending, { baidu: heldBaiduUrls, indexnow: [] });
  assert.equal(result.baidu.skipped, true);
  assert.equal(result.baidu.ok, undefined);
  assert.equal(result.baidu.acceptedUrls, undefined);
  assert.deepEqual(result.baidu.protectedUrls, heldBaiduUrls);
});

test('bad actual helper replies preserve mixed pending URLs and reserve only unprotected attempts', async () => {
  const originalFetch = globalThis.fetch;
  const names = ['BAIDU_TOKEN', 'BAIDU_PUSH_TOKEN', 'BAIDU_SITE', 'BAIDU_PUSH_MAX_URLS', 'BAIDU_SUBMISSION_MODE', 'BAIDU_ALLOW_HTTP'];
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  const batch = [heldBaiduUrls[0], urls[0]];
  const state = withHeldQueue(batch);
  let calls = 0;
  try {
    process.env.BAIDU_SUBMISSION_MODE = 'automatic';
    delete process.env.BAIDU_ALLOW_HTTP;
    process.env.BAIDU_TOKEN = 'test-only';
    delete process.env.BAIDU_PUSH_TOKEN;
    process.env.BAIDU_SITE = 'https://www.jssngyl.cn';
    process.env.BAIDU_PUSH_MAX_URLS = '10';
    globalThis.fetch = async (_endpoint, request) => {
      calls++;
      assert.equal(request.body, urls[0]);
      return new Response(JSON.stringify({ success: '1' }));
    };
    const result = await drainQueue(state, options({ submit: {
      indexnow: success, baidu: (sent) => submitBaidu('https://www.jssngyl.cn', sent, false),
    } }));
    assert.equal(calls, 1);
    assert.equal(state.baiduAttempted, 1);
    assert.deepEqual(state.pending, { baidu: batch, indexnow: [] });
    assert.equal(result.baidu.ok, false);
    assert.deepEqual(result.baidu.acceptedUrls, []);
    assert.deepEqual(result.baidu.protectedUrls, [heldBaiduUrls[0]]);
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of names) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
  }
});

test('manual mode remains unchanged even when all pending URLs have manual protection', async () => {
  const state = withHeldQueue(heldBaiduUrls);
  let requests = 0;
  const result = await drainQueue(state, options({ baiduMode: 'manual', submit: {
    indexnow: success, baidu: async () => { requests++; },
  } }));
  assert.equal(requests, 0);
  assert.equal(state.baiduAttempted, 0);
  assert.deepEqual(state.pending, { baidu: heldBaiduUrls, indexnow: [] });
  assert.equal(result.baidu.paused, true);
  assert.equal(Object.prototype.hasOwnProperty.call(result.baidu, 'protectedUrls'), false);
});


const manualReceiptEntry = (url, extra = {}) => ({ url, evidenceStatus: 'platform-received',
  exactSubmissionTime: null, receiptObservedAt: '2026-10-07T06:37:42Z',
  receiptEvidenceScope: 'batch-level-ui-success', evidenceSources: ['reviewed-receipt.json'], ...extra });
const reviewRegistry = (entries) => ({ version: 1, entries });
const reviewedLive = () => new Map(urls.map((url) => [url, '2026-10-02T15:00:00Z']));

test('old schema restores with the complete original queue intact before manual separation', () => {
  const old = queued();
  const original = structuredClone(old);
  validateQueue(old);
  preserveBaiduManualBackup(old);
  const result = reconcileBaiduManualQueue(old, reviewedLive(), reviewRegistry([manualReceiptEntry(urls[0])]));
  assert.deepEqual(old.baiduManualReconciliation.originalQueue, original);
  assert.deepEqual(old.pending.baidu, urls.slice(1));
  assert.equal(result.originalPendingCount, 3);
  assert.equal(result.receivedUnchanged.length, 1);
  assert.equal(result.receivedUnchanged[0].apiAcceptanceVerified, false);
  assert.equal(result.receivedUnchanged[0].indexingVerified, false);
  const restored = JSON.parse(JSON.stringify(old));
  validateQueue(restored);
  assert.deepEqual(restored.baiduManualReconciliation.originalQueue, original);
});

test('repeated restored manual reconciliation does not requeue or submit a received batch', async () => {
  let state = queued();
  const registry = reviewRegistry(urls.map((url) => manualReceiptEntry(url)));
  reconcileBaiduManualQueue(state, reviewedLive(), registry);
  state = JSON.parse(JSON.stringify(state));
  mergeBatches(state, [{ id: 'later-dispatch', urls }], urls);
  reconcileBaiduManualQueue(state, reviewedLive(), registry);
  let posts = 0;
  const result = await drainQueue(state, options({ baiduMode: 'manual', submit: {
    indexnow: success, baidu: async () => { posts++; return success(urls); },
  } }));
  assert.equal(posts, 0);
  assert.deepEqual(state.pending.baidu, []);
  assert.equal(state.baiduManualReconciliation.records.length, 3);
  assert.equal(state.baiduManualReconciliation.originalQueue.pending.baidu.length, 3);
  assert.equal(result.baidu.ok, undefined);
  assert.equal(state.baiduAttempted, 0);
});

test('human reports, missing receipts and unknown content dates remain held without acceptance', () => {
  const state = queued();
  const live = reviewedLive(); live.set(urls[2], '');
  const result = reconcileBaiduManualQueue(state, live, reviewRegistry([
    manualReceiptEntry(urls[0], { evidenceStatus: 'user-reported-submitted' }),
    manualReceiptEntry(urls[1], { evidenceSources: [] }),
    manualReceiptEntry(urls[2]),
  ]));
  assert.equal(result.receivedUnchanged.length, 0);
  assert.deepEqual(result.manualReview.map((entry) => entry.disposition),
    ['user-report-hold', 'receipt-evidence-missing', 'content-date-unknown']);
  assert.equal(result.manualReview.every((entry) => entry.needsReview && !entry.apiAcceptanceVerified && !entry.indexingVerified), true);
  assert.equal(result.manualReview.length, 3);
  assert.equal(state.baiduManualReconciliation.originalQueue.pending.baidu.length, 3);
  const unknownScope = reconcileBaiduManualQueue(queued(), reviewedLive(), reviewRegistry([
    manualReceiptEntry(urls[0], { receiptEvidenceScope: 'unverified' }),
  ]));
  assert.equal(unknownScope.receivedUnchanged.length, 0);
  assert.equal(unknownScope.manualReview[0].disposition, 'receipt-evidence-missing');
  const invalid = queued(); const before = structuredClone(invalid);
  assert.throws(() => reconcileBaiduManualQueue(invalid, live, reviewRegistry([
    manualReceiptEntry(urls[0], { evidenceStatus: 'unknown' }),
  ])), /Invalid manual-submission registry/);
  assert.deepEqual(invalid, before);
});

test('changed and reverted content versions stay durable manual-review work instead of permanent success', () => {
  const state = queued(); const registry = reviewRegistry([manualReceiptEntry(urls[0])]);
  const live = reviewedLive();
  reconcileBaiduManualQueue(state, live, registry);
  live.set(urls[0], '2026-10-08T00:00:00Z');
  mergeBatches(state, [{ id: 'later-content-change', urls: [urls[0]] }], urls);
  let result = reconcileBaiduManualQueue(state, live, registry);
  assert.equal(result.receivedUnchanged.length, 0);
  assert.equal(result.manualReview[0].disposition, 'content-changed-review');
  assert.equal(result.manualReview[0].needsReview, true);
  assert.equal(result.manualReview[0].currentLastmod, '2026-10-08T00:00:00Z');
  assert.deepEqual(state.baiduManualReconciliation.originalQueue.pending.baidu, urls);
  live.set(urls[0], '2026-10-02T15:00:00Z');
  result = reconcileBaiduManualQueue(state, live, registry);
  assert.equal(result.manualReview[0].disposition, 'content-changed-review');
  assert.equal(result.manualReview[0].apiAcceptanceVerified, false);
});

test('missing receipt dates or omitted registry entries never discard held records', () => {
  const state = queued();
  const first = reconcileBaiduManualQueue(state, reviewedLive(), reviewRegistry([
    manualReceiptEntry(urls[0], { receiptObservedAt: null }),
  ]));
  assert.equal(first.manualReview[0].disposition, 'receipt-date-unknown');
  const second = reconcileBaiduManualQueue(state, reviewedLive(), reviewRegistry([]));
  assert.equal(second.manualReview.length, 1);
  assert.equal(second.manualReview[0].disposition, 'receipt-evidence-missing');
  assert.deepEqual(state.baiduManualReconciliation.originalQueue.pending.baidu, urls);
});

test('unhandled manual export prioritizes Chinese articles without losing other URLs', () => {
  const values = ['https://www.jssngyl.cn/en/news/english', 'https://www.jssngyl.cn/zh/service/help',
    'https://www.jssngyl.cn/zh/news/chinese'];
  const state = mergeBatches(emptyQueue(), [{ id: 'mixed-languages', urls: values }], values);
  const result = reconcileBaiduManualQueue(state, new Map(values.map((url) => [url, ''])), reviewRegistry([]));
  assert.deepEqual(result.unhandledUrls, [values[2], values[1], values[0]]);
  assert.deepEqual(state.baiduManualReconciliation.originalQueue.pending.baidu, values);
});


const releaseFor = (url, contentLastmod, extra = {}) => ({ url, contentLastmod,
  authorizedBy: 'user', authorizationSource: 'test-human-explicit-release-message', ...extra });

test('explicit matching-version authorization releases an omitted archived URL once and preserves its evidence', () => {
  let state = queued(); const live = reviewedLive();
  reconcileBaiduManualQueue(state, live, reviewRegistry([manualReceiptEntry(urls[0])]));
  const original = structuredClone(state.baiduManualReconciliation.originalQueue);
  const omitted = reconcileBaiduManualQueue(state, live, reviewRegistry([]));
  assert.equal(omitted.manualReview[0].disposition, 'receipt-evidence-missing');
  assert.equal(state.pending.baidu.includes(urls[0]), false);
  const registry = { ...reviewRegistry([]), releaseAuthorizations: [releaseFor(urls[0], live.get(urls[0]))] };
  let result = reconcileBaiduManualQueue(state, live, registry);
  assert.equal(result.releasedForVersion.length, 1);
  assert.equal(state.pending.baidu.filter((url) => url === urls[0]).length, 1);
  assert.equal(result.receivedUnchanged.length, 0);
  assert.deepEqual(state.baiduManualReconciliation.originalQueue, original);
  assert.deepEqual(result.releasedForVersion[0].evidenceSources, ['reviewed-receipt.json']);
  assert.equal(result.releasedForVersion[0].apiAcceptanceVerified, false);
  state = JSON.parse(JSON.stringify(state));
  result = reconcileBaiduManualQueue(state, live, registry);
  assert.equal(state.pending.baidu.filter((url) => url === urls[0]).length, 1);
  assert.equal(result.releasedForVersion[0].releaseHistory.length, 1);
  // Model a later processed item: replaying the same authorization cannot enqueue it again.
  state.pending.baidu = state.pending.baidu.filter((url) => url !== urls[0]);
  reconcileBaiduManualQueue(state, live, registry);
  assert.equal(state.pending.baidu.includes(urls[0]), false);
});

test('version-specific release expires on a later edit and needs a new explicit version authorization', () => {
  const state = queued(); const live = reviewedLive();
  const oldVersion = live.get(urls[0]);
  const registry = { ...reviewRegistry([manualReceiptEntry(urls[0])]),
    releaseAuthorizations: [releaseFor(urls[0], oldVersion)] };
  reconcileBaiduManualQueue(state, live, registry);
  live.set(urls[0], '2026-10-08T00:00:00Z');
  let result = reconcileBaiduManualQueue(state, live, registry);
  assert.equal(state.pending.baidu.includes(urls[0]), false);
  assert.equal(result.releasedForVersion.length, 0);
  assert.equal(result.manualReview[0].disposition, 'content-changed-review');
  assert.equal(result.manualReview[0].releaseHistory.length, 1);
  live.set(urls[0], oldVersion);
  result = reconcileBaiduManualQueue(state, live, registry);
  assert.equal(result.releasedForVersion.length, 0);
  assert.equal(result.manualReview[0].disposition, 'content-changed-review');
  assert.equal(state.pending.baidu.includes(urls[0]), false);
  live.set(urls[0], '2026-10-08T00:00:00Z');
  registry.releaseAuthorizations.push(releaseFor(urls[0], live.get(urls[0]), {
    authorizationSource: 'test-second-human-explicit-release-message',
  }));
  result = reconcileBaiduManualQueue(state, live, registry);
  assert.equal(state.pending.baidu.includes(urls[0]), true);
  assert.equal(result.releasedForVersion[0].releaseHistory.length, 2);
});

test('missing versions or authorization provenance cannot release a hold or mutate the old state', () => {
  for (const extra of [{ contentLastmod: '' }, { authorizedBy: 'automation' }, { authorizationSource: '' }]) {
    const state = queued(); const original = structuredClone(state);
    const registry = { ...reviewRegistry([manualReceiptEntry(urls[0])]),
      releaseAuthorizations: [releaseFor(urls[0], reviewedLive().get(urls[0]), extra)] };
    assert.throws(() => reconcileBaiduManualQueue(state, reviewedLive(), registry), /Invalid version-specific/);
    assert.deepEqual(state, original);
  }
  const state = queued();
  const registry = { ...reviewRegistry([manualReceiptEntry(urls[0])]),
    releaseAuthorizations: [releaseFor(urls[0], '2026-10-01T00:00:00Z')] };
  const result = reconcileBaiduManualQueue(state, reviewedLive(), registry);
  assert.equal(result.releasedForVersion.length, 0);
  assert.equal(state.pending.baidu.includes(urls[0]), false);
});

test('explicit release restores manual work without changing manual mode or making a platform request', async () => {
  const state = queued(); const live = reviewedLive();
  const registry = { ...reviewRegistry([manualReceiptEntry(urls[0])]),
    releaseAuthorizations: [releaseFor(urls[0], live.get(urls[0]))] };
  reconcileBaiduManualQueue(state, live, registry);
  let requests = 0;
  const result = await drainQueue(state, options({ baiduMode: undefined, submit: {
    indexnow: success, baidu: async () => { requests++; },
  } }));
  assert.equal(result.baidu.paused, true);
  assert.equal(result.baidu.ok, undefined);
  assert.equal(requests, 0);
  assert.equal(state.pending.baidu.includes(urls[0]), true);
  assert.equal(state.baiduAttempted, 0);
});
