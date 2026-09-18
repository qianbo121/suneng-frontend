import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drainQueue, emptyQueue, mergeBatches, validateQueue } from './search-submission-queue.mjs';
import { manualBatch, restoreQueue } from './restore-search-queue.mjs';
import { submitIndexNow } from './submit-search-engines.mjs';

const urls = ['a', 'b', 'c'].map((path) => `https://www.jssngyl.cn/zh/${path}`);
const queued = () => mergeBatches(emptyQueue(), [{ id: 'deploy-1', urls }], urls);
const success = async (batch) => ({ ok: true, acceptedUrls: batch });
const options = (extra = {}) => ({ day: '2026-09-08', limit: 2, available: { baidu: true, indexnow: true }, submit: { baidu: success, indexnow: success }, save: async () => {}, ...extra });

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
