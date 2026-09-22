import { existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { loadSitemapEntries, submitBaidu, submitIndexNow, safeRequestFailure } from './submit-search-engines.mjs';
import { selectChangedUrls } from './changed-search-urls.mjs';

export function emptyQueue() {
  return { version: 1, sources: [], pending: { baidu: [], indexnow: [] }, baiduDay: '', baiduAttempted: 0 };
}

export function validateQueue(state) {
  if (state?.version !== 1 || !Array.isArray(state.sources) || state.sources.some((id) => typeof id !== 'string') ||
      !['baidu', 'indexnow'].every((engine) => Array.isArray(state.pending?.[engine]) && state.pending[engine].every((url) => typeof url === 'string')) ||
      !Number.isSafeInteger(state.baiduAttempted) || state.baiduAttempted < 0 ||
      typeof state.baiduDay !== 'string' || (state.baiduDay && !/^\d{4}-\d{2}-\d{2}$/.test(state.baiduDay))) {
    throw new Error('Invalid queue state; refusing to reset or discard pending URLs');
  }
  if (state.liveSitemap !== undefined) {
    const snapshot = state.liveSitemap;
    if (!Number.isSafeInteger(snapshot?.revision) || snapshot.revision < 1) throw new Error('Invalid live sitemap revision');
    validateSnapshot(snapshot.entries, snapshot.site);
  }
  return state;
}

function validateSnapshot(entries, site) {
  if (typeof site !== 'string' || new URL(site).origin !== site ||
      !Array.isArray(entries) || !entries.length || entries.some((entry) =>
        !Array.isArray(entry) || entry.length !== 2 || typeof entry[0] !== 'string' || typeof entry[1] !== 'string' ||
        new URL(entry[0]).origin !== site || new URL(entry[0]).search || new URL(entry[0]).hash) ||
      new Set(entries.map(([url]) => url)).size !== entries.length) {
    throw new Error('Invalid live sitemap snapshot; refusing to discard pending URLs');
  }
}

// Observe the public site, not candidate-build completion. Snapshot and pending
// URLs are persisted together before any POST, so rejected requests can retry.
export function refreshLiveQueue(state, live, baseline) {
  validateQueue(state);
  if (baseline?.version !== 1 || !Array.isArray(baseline.initialPending) ||
      baseline.initialPending.some((url) => typeof url !== 'string')) throw new Error('Invalid live baseline');
  validateSnapshot(baseline.entries, baseline.site);
  validateSnapshot([...live], baseline.site);
  if (state.liveSitemap && state.liveSitemap.site !== baseline.site) throw new Error('Live sitemap site changed');
  const before = new Map(state.liveSitemap?.entries || baseline.entries);
  const changed = selectChangedUrls(before, live);
  const revision = (state.liveSitemap?.revision || 0) + 1;
  mergeBatches(state, [
    { id: 'live-bootstrap-approved-guides-20260920', urls: baseline.initialPending },
    ...(changed.length ? [{ id: `live-sitemap-${revision}`, urls: changed }] : []),
  ], [...live.keys()]);
  state.liveSitemap = { site: baseline.site, revision, entries: [...live] };
  return changed;
}

export function mergeBatches(state, batches, canonicalUrls) {
  validateQueue(state);
  const allowed = new Set(canonicalUrls);
  for (const batch of batches) {
    if (typeof batch.id !== 'string' || !Array.isArray(batch.urls) || batch.urls.some((url) => typeof url !== 'string')) throw new Error('Invalid search change batch');
    if (state.sources.includes(batch.id)) continue;
    for (const engine of ['baidu', 'indexnow']) state.pending[engine].push(...batch.urls.filter((url) => allowed.has(url)));
    state.sources.push(batch.id);
  }
  for (const engine of ['baidu', 'indexnow']) state.pending[engine] = [...new Set(state.pending[engine].filter((url) => allowed.has(url)))];
  return state;
}

export async function drainQueue(state, { day, limit, available, submit, save }) {
  validateQueue(state);
  if (!Number.isSafeInteger(limit) || limit < 1) throw new Error('Invalid daily Baidu submission limit');
  if (state.baiduDay > day) throw new Error('Queue date is in the future; refusing to reset budget');
  if (state.baiduDay !== day) { state.baiduDay = day; state.baiduAttempted = 0; }
  const results = {};
  await save(state);
  for (const engine of ['indexnow', 'baidu']) {
    const maximum = engine === 'baidu' ? Math.max(0, limit - state.baiduAttempted) : 10000;
    const urls = state.pending[engine].slice(0, maximum);
    if (!urls.length || !available[engine]) {
      results[engine] = { skipped: true, reason: !available[engine] ? 'credentials missing; pending URLs retained' : 'empty queue or daily budget exhausted' };
      continue;
    }
    // Reserve quota before the request. An ambiguous/partial response stays pending.
    if (engine === 'baidu') state.baiduAttempted += urls.length;
    await save(state);
    try {
      const result = await submit[engine](urls);
      results[engine] = result;
      if (result.ok) {
        const accepted = new Set(result.acceptedUrls || urls);
        state.pending[engine] = state.pending[engine].filter((url) => !accepted.has(url));
      }
    } catch (error) {
      results[engine] = { ok: false, reason: `${safeRequestFailure(error)}; pending URLs retained` };
    }
    await save(state);
  }
  return results;
}

async function main() {
  const arg = (name) => process.argv.find((value) => value.startsWith(`${name}=`))?.slice(name.length + 1);
  const stateFile = arg('--state-file');
  const batchFile = arg('--batches-file');
  if (!stateFile || !existsSync(stateFile) || !batchFile) throw new Error('Restored state and batches are required; queue initialization belongs to the restore step');
  const state = validateQueue(JSON.parse(readFileSync(stateFile, 'utf8')));
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jssngyl.cn').replace(/\/$/, '');
  const baseline = JSON.parse(readFileSync(new URL('./search-live-baseline.json', import.meta.url), 'utf8'));
  if (site !== baseline.site) throw new Error('Site does not match the reviewed baseline');
  const sitemap = await loadSitemapEntries(site);
  const changed = refreshLiveQueue(state, sitemap, baseline);
  mergeBatches(state, JSON.parse(readFileSync(batchFile, 'utf8')), [...sitemap.keys()]);
  console.log(`Live sitemap: ${sitemap.size} URLs; ${changed.length} added/changed; pending ${state.pending.baidu.length} Baidu / ${state.pending.indexnow.length} IndexNow.`);
  const save = (value) => { writeFileSync(`${stateFile}.tmp`, JSON.stringify(value, null, 2)); renameSync(`${stateFile}.tmp`, stateFile); };
  if (process.argv.includes('--dry-run')) {
    console.log(JSON.stringify({ dryRun: true, pending: state.pending }));
    return; // No network POST, no quota consumption, no state mutation on disk.
  }
  const results = await drainQueue(state, {
    day: new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10),
    limit: Number(process.env.BAIDU_PUSH_MAX_URLS || 10),
    available: { baidu: Boolean(process.env.BAIDU_TOKEN?.trim() || process.env.BAIDU_PUSH_TOKEN?.trim()), indexnow: Boolean(process.env.INDEXNOW_KEY?.trim()) },
    submit: { baidu: (urls) => submitBaidu(site, urls, false), indexnow: (urls) => submitIndexNow(site, urls, false) },
    save,
  });
  for (const [engine, result] of Object.entries(results)) {
    console.log(`${engine}: ${result.ok ? 'accepted by submission endpoint (not proof of indexing)' : result.reason || `HTTP ${result.status}; pending URLs retained`}; pending=${state.pending[engine].length}`);
    if (result.ok === false || (state.pending[engine].length && result.reason?.includes('credentials'))) process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Queue failed');
  process.exitCode = 1;
});
