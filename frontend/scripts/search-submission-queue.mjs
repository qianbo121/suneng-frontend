import { existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { baiduReleaseAuthorizations, baiduSubmissionMode, describeSubmissionFailure, loadSitemapEntries, selectUnprotectedBaiduUrls, submitBaidu, submitIndexNow } from './submit-search-engines.mjs';
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
  if (state.baiduManualReconciliation !== undefined) {
    const manual = state.baiduManualReconciliation;
    if (manual.version !== 1 || !Array.isArray(manual.records) ||
        manual.originalQueue?.baiduManualReconciliation !== undefined ||
        new Set(manual.records.map((entry) => entry.url)).size !== manual.records.length ||
        manual.records.some((entry) => typeof entry.url !== 'string' ||
          !['user-reported-submitted', 'platform-received'].includes(entry.evidenceStatus) ||
          !['manual-received-unchanged', 'user-report-hold', 'receipt-evidence-missing', 'receipt-date-unknown',
            'content-date-unknown', 'content-changed-review', 'not-live-hold', 'released-for-version'].includes(entry.disposition) ||
          typeof entry.needsReview !== 'boolean' || typeof entry.firstObservedLastmod !== 'string')) {
      throw new Error('Invalid Baidu manual archive; refusing to discard its backup or held URLs');
    }
    validateQueue(manual.originalQueue);
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

// Preserve the exact restored queue before live filtering or manual reconciliation.
// This is a historical backup, never a submission receipt or a fresh empty queue.
export function preserveBaiduManualBackup(state) {
  validateQueue(state);
  if (!state.baiduManualReconciliation) {
    state.baiduManualReconciliation = { version: 1, originalQueue: structuredClone(state), records: [] };
  }
  return state;
}

function manualRegistry() {
  return JSON.parse(readFileSync(new URL('./baidu-manual-submission-protection.json', import.meta.url), 'utf8'));
}

function priority(url) {
  const path = new URL(url).pathname;
  return path.startsWith('/zh/news/') ? 0 : path.startsWith('/zh/') ? 1 : 2;
}

// A human report, a batch UI receipt and an API response are different evidence.
// Held/archived URLs stay durable outside the active list. A changed version is
// retained for manual review; it is never silently treated as received again.
export function reconcileBaiduManualQueue(state, live, registry = manualRegistry()) {
  validateQueue(state);
  if (!(live instanceof Map) || registry?.version !== 1 || !Array.isArray(registry.entries) ||
      new Set(registry.entries.map((entry) => entry.url)).size !== registry.entries.length ||
      registry.entries.some((entry) => {
        try {
          const url = new URL(entry.url);
          return url.origin !== 'https://www.jssngyl.cn' || url.search || url.hash || url.href !== entry.url ||
            !['user-reported-submitted', 'platform-received'].includes(entry.evidenceStatus) ||
            (entry.receiptObservedAt != null && !Number.isFinite(Date.parse(entry.receiptObservedAt)));
        } catch { return true; }
      })) throw new Error('Invalid manual-submission registry; refusing reconciliation');
  const releases = baiduReleaseAuthorizations(registry);
  preserveBaiduManualBackup(state);
  const archive = state.baiduManualReconciliation;
  const previous = new Map(archive.records.map((entry) => [entry.url, entry]));
  const records = registry.entries.map((entry) => {
    const lastmod = live.get(entry.url) || '';
    const prior = previous.get(entry.url);
    const receiptObservedAt = entry.receiptObservedAt || null;
    const sources = Array.isArray(entry.evidenceSources) ? entry.evidenceSources.filter((source) => typeof source === 'string' && source) : [];
    let disposition;
    let reason;
    if (!live.has(entry.url)) {
      disposition = 'not-live-hold'; reason = 'Address absent from the live sitemap; retained for review.';
    } else if (prior && prior.receiptObservedAt === receiptObservedAt &&
        (prior.firstObservedLastmod !== lastmod || prior.disposition === 'content-changed-review')) {
      disposition = 'content-changed-review'; reason = 'Content version changed after the prior review; new submission remains a manual decision.';
    } else if (entry.evidenceStatus === 'user-reported-submitted') {
      disposition = 'user-report-hold'; reason = 'Human reported submission; no platform receipt verified.';
    } else if (!sources.length || !['batch-level-ui-success', 'prior-platform-receipt-record'].includes(entry.receiptEvidenceScope)) {
      disposition = 'receipt-evidence-missing'; reason = 'Platform receipt evidence is missing; no acceptance inferred.';
    } else if (!receiptObservedAt) {
      disposition = 'receipt-date-unknown'; reason = 'Receipt observation date is unknown; cannot bind it to the current content version.';
    } else if (!lastmod || !Number.isFinite(Date.parse(lastmod))) {
      disposition = 'content-date-unknown'; reason = 'Content date is unavailable; the earlier receipt cannot prove this version was submitted.';
    } else if (Date.parse(lastmod) > Date.parse(receiptObservedAt)) {
      disposition = 'content-changed-review'; reason = 'Content date is later than receipt observation; new version retained for manual review.';
    } else {
      disposition = 'manual-received-unchanged'; reason = 'Batch UI receipt recorded; current content date precedes receipt observation. Not API acceptance or proof of indexing.';
    }
    return { url: entry.url, evidenceStatus: entry.evidenceStatus, disposition, reason,
      needsReview: disposition !== 'manual-received-unchanged', receiptObservedAt,
      exactSubmissionTime: entry.exactSubmissionTime ?? null,
      receiptEvidenceScope: entry.receiptEvidenceScope || null, evidenceSources: sources,
      firstObservedLastmod: prior && prior.receiptObservedAt === receiptObservedAt ? prior.firstObservedLastmod : lastmod,
      currentLastmod: lastmod, releaseHistory: prior?.releaseHistory || [],
      apiAcceptanceVerified: false, indexingVerified: false };
  });
  // Ordinary registry omission retains the hold. Only the explicit release
  // authorization below can restore that exact version to the pending list.
  for (const entry of archive.records) if (!records.some((record) => record.url === entry.url)) {
    records.push({ ...entry, needsReview: true, disposition: 'receipt-evidence-missing',
      currentLastmod: live.get(entry.url) || '',
      reason: 'Entry disappeared from registry; prior evidence retained for review.' });
  }
  for (const record of records) {
    const authorization = releases.find((entry) => entry.url === record.url && live.get(entry.url) === entry.contentLastmod);
    if (!authorization) continue;
    const releaseHistory = record.releaseHistory || [];
    const alreadyEnqueued = releaseHistory.some((entry) => entry.contentLastmod === authorization.contentLastmod &&
      entry.authorizationSource === authorization.authorizationSource);
    // Once a version changes or authorization is withdrawn, an old authorization
    // cannot clear review even if the content date later reverts to its old value.
    if (alreadyEnqueued && previous.get(record.url)?.disposition !== 'released-for-version') continue;
    if (!alreadyEnqueued) {
      state.pending.baidu.push(record.url);
      releaseHistory.push({ ...authorization, enqueueRecorded: true });
    }
    record.releaseHistory = releaseHistory;
    record.disposition = 'released-for-version';
    record.needsReview = false;
    record.reason = 'Explicit human resubmission authorization matches this content version; not a submission receipt.';
  }
  const held = new Set(records.filter((entry) => entry.disposition !== 'released-for-version').map((entry) => entry.url));
  archive.records = records;
  state.pending.baidu = [...new Set(state.pending.baidu.filter((url) => !held.has(url)))].sort((a, b) => priority(a) - priority(b));
  validateQueue(state);
  return { unhandledUrls: [...state.pending.baidu],
    receivedUnchanged: records.filter((entry) => entry.disposition === 'manual-received-unchanged'),
    releasedForVersion: records.filter((entry) => entry.disposition === 'released-for-version'),
    manualReview: records.filter((entry) => entry.needsReview),
    originalPendingCount: archive.originalQueue.pending.baidu.length };
}

export async function drainQueue(state, { day, limit, available, submit, save, baiduMode = baiduSubmissionMode() }) {
  validateQueue(state);
  baiduMode = baiduSubmissionMode(baiduMode);
  if (!Number.isSafeInteger(limit) || limit < 1) throw new Error('Invalid daily Baidu submission limit');
  if (state.baiduDay > day) throw new Error('Queue date is in the future; refusing to reset budget');
  if (state.baiduDay !== day) { state.baiduDay = day; state.baiduAttempted = 0; }
  const results = {};
  await save(state);
  for (const engine of ['indexnow', 'baidu']) {
    if (engine === 'baidu' && baiduMode === 'manual') {
      results.baidu = { skipped: true, paused: true, reason: 'automatic submission paused by owner decision; manual review only; pending URLs retained (not accepted)' };
      continue;
    }
    const maximum = engine === 'baidu' ? Math.max(0, limit - state.baiduAttempted) : 10000;
    const selection = engine === 'baidu' ? selectUnprotectedBaiduUrls(state.pending.baidu, new Map(state.liveSitemap?.entries || [])) : { urls: state.pending[engine] };
    const urls = selection.urls.slice(0, maximum);
    if (!urls.length || !available[engine]) {
      const allProtected = engine === 'baidu' && !selection.urls.length && selection.protectedUrls.length;
      results[engine] = { skipped: true, reason: allProtected ? 'manually handled URLs protected; no API attempt or acceptance' : !available[engine] ? 'credentials missing; pending URLs retained' : 'empty queue or daily budget exhausted',
        ...(engine === 'baidu' ? { protectedUrls: selection.protectedUrls } : {}) };
      continue;
    }
    // Reserve quota before the request. An ambiguous/partial response stays pending.
    if (engine === 'baidu') state.baiduAttempted += urls.length;
    await save(state);
    try {
      const result = await submit[engine](urls);
      results[engine] = engine === 'baidu' ? { ...result, protectedUrls: selection.protectedUrls } : result;
      if (result.ok) {
        const accepted = new Set(result.acceptedUrls || urls);
        state.pending[engine] = state.pending[engine].filter((url) => !accepted.has(url));
      }
    } catch (error) {
      results[engine] = { ok: false, reason: `${describeSubmissionFailure(error)}; pending URLs retained`,
        ...(engine === 'baidu' ? { protectedUrls: selection.protectedUrls } : {}) };
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
  preserveBaiduManualBackup(state);
  const sitemap = await loadSitemapEntries(site);
  const changed = refreshLiveQueue(state, sitemap, baseline);
  mergeBatches(state, JSON.parse(readFileSync(batchFile, 'utf8')), [...sitemap.keys()]);
  const manual = reconcileBaiduManualQueue(state, sitemap);
  console.log(`Live sitemap: ${sitemap.size} URLs; ${changed.length} added/changed; pending ${state.pending.baidu.length} Baidu / ${state.pending.indexnow.length} IndexNow; manual ${manual.receivedUnchanged.length} receipt-recorded unchanged / ${manual.manualReview.length} held for review; original backup ${manual.originalPendingCount} Baidu URLs.`);
  const save = (value) => { writeFileSync(`${stateFile}.tmp`, JSON.stringify(value, null, 2)); renameSync(`${stateFile}.tmp`, stateFile); };
  if (process.argv.includes('--dry-run')) {
    console.log(JSON.stringify({ dryRun: true, pending: state.pending, baiduManual: manual }));
    return; // No network POST, no quota consumption, no state mutation on disk.
  }
  const results = await drainQueue(state, {
    day: new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10),
    limit: Number(process.env.BAIDU_PUSH_MAX_URLS || 10),
    baiduMode: baiduSubmissionMode(),
    available: { baidu: Boolean(process.env.BAIDU_TOKEN?.trim() || process.env.BAIDU_PUSH_TOKEN?.trim()), indexnow: Boolean(process.env.INDEXNOW_KEY?.trim()) },
    submit: { baidu: (urls) => submitBaidu(site, urls, false, Infinity, { liveVersions: sitemap }), indexnow: (urls) => submitIndexNow(site, urls, false) },
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
