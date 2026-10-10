import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { sitemapEntries } from './changed-search-urls.mjs';
const FALLBACK_SITE_URL = 'https://www.jssngyl.cn';

function normalizeSiteUrl(value) {
  const cleaned = value?.trim().replace(/\/+$/, '');
  if (!cleaned || /localhost|127\.0\.0\.1/i.test(cleaned)) return FALLBACK_SITE_URL;
  return cleaned;
}

function readArg(name) {
  const prefix = `${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : '';
}

function readArgs(name) {
  const prefix = `${name}=`;
  return process.argv.filter((arg) => arg.startsWith(prefix)).map((arg) => arg.slice(prefix.length));
}

function getEnv(name) {
  return process.env[name]?.trim() || '';
}

// Both direct and queued submissions must honor the same explicit owner switch.
export function baiduSubmissionMode(value = process.env.BAIDU_SUBMISSION_MODE) {
  const mode = value?.trim() || 'manual';
  if (!['manual', 'automatic'].includes(mode)) {
    throw new Error('Invalid Baidu submission mode; expected manual or automatic');
  }
  return mode;
}

// Never log the raw error, URL or cause: submission URLs contain credentials.
// Only emit fixed descriptions for known transport failures.
export function describeSubmissionFailure(error) {
  const seen = new Set();
  for (let cause = error; cause && !seen.has(cause) && seen.size < 5; cause = cause.cause) {
    seen.add(cause);
    switch (cause.code) {
      case 'ERR_TLS_CERT_ALTNAME_INVALID':
        return 'TLS certificate does not match the endpoint hostname; secure connection blocked (no insecure fallback)';
      case 'CERT_HAS_EXPIRED':
      case 'CERT_NOT_YET_VALID':
      case 'DEPTH_ZERO_SELF_SIGNED_CERT':
      case 'SELF_SIGNED_CERT_IN_CHAIN':
      case 'UNABLE_TO_VERIFY_LEAF_SIGNATURE':
      case 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY':
        return 'TLS certificate validation failed; secure connection blocked (no insecure fallback)';
      case 'ENOTFOUND':
      case 'EAI_AGAIN':
        return 'endpoint DNS lookup failed';
      case 'ETIMEDOUT':
      case 'UND_ERR_CONNECT_TIMEOUT':
      case 'UND_ERR_HEADERS_TIMEOUT':
      case 'UND_ERR_BODY_TIMEOUT':
        return 'request timed out; acceptance is unconfirmed';
      case 'ECONNREFUSED':
      case 'ECONNRESET':
        return 'endpoint connection failed; acceptance is unconfirmed';
    }
    if (cause.name === 'TimeoutError' || cause.name === 'AbortError') {
      return 'request interrupted or timed out; acceptance is unconfirmed';
    }
  }
  return 'request failed; acceptance is unconfirmed';
}

function normalizeSubmissionUrl(value, siteUrl) {
  const url = new URL(value, `${siteUrl}/`);
  if (url.origin !== new URL(siteUrl).origin) {
    throw new Error(`Submission URL must use ${new URL(siteUrl).origin}: ${url.href}`);
  }
  url.hash = '';
  return url.href.replace(/\/$/, '');
}

export function selectSubmissionUrls(siteUrl, sitemapUrls) {
  const file = readArg('--urls-file');
  const requested = file ? JSON.parse(readFileSync(file, 'utf8')) : readArgs('--url');
  if (!Array.isArray(requested) || requested.some((url) => typeof url !== 'string')) throw new Error('URL file must contain a JSON array of URLs');
  const excluded = new Set(readArgs('--exclude').map((url) => normalizeSubmissionUrl(url, siteUrl)));
  const candidates = file || requested.length ? requested : sitemapUrls;
  const selected = candidates
    .map((url) => normalizeSubmissionUrl(url, siteUrl))
    .filter((url) => !excluded.has(url) && sitemapUrls.includes(url));

  return {
    urls: [...new Set(selected)],
    requested: requested.length,
    excluded: [...excluded],
  };
}

export async function loadSitemapUrls(siteUrl) {
  return [...(await loadSitemapEntries(siteUrl)).keys()];
}

export async function loadSitemapEntries(siteUrl) {
  const sitemapUrl = `${siteUrl}/sitemap.xml`;
  const response = await fetch(sitemapUrl, {
    signal: AbortSignal.timeout(15000),
    headers: {
      accept: 'application/xml,text/xml,*/*',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${sitemapUrl}: HTTP ${response.status}`);
  }

  const xml = await response.text();
  return sitemapEntries(xml);
}

export async function submitIndexNow(siteUrl, urls, dryRun) {
  const key = readArg('--indexnow-key') || getEnv('INDEXNOW_KEY');
  const keyLocation =
    readArg('--indexnow-key-location') ||
    getEnv('INDEXNOW_KEY_LOCATION') ||
    `${siteUrl}/indexnow-key.txt`;

  if (!key) {
    return { skipped: true, reason: 'INDEXNOW_KEY is not set' };
  }

  const payload = {
    host: new URL(siteUrl).host,
    key,
    keyLocation,
    urlList: urls,
  };

  if (dryRun) {
    return { skipped: false, dryRun: true, submitted: urls.length };
  }

  // The public proof must match this key before any submission is attempted.
  if (new URL(keyLocation).origin !== new URL(siteUrl).origin) throw new Error('IndexNow key location must use the site origin');
  const proof = await fetch(keyLocation, { signal: AbortSignal.timeout(15000) });
  if (!proof.ok || (await proof.text()).trim() !== key) throw new Error('IndexNow public key proof is unavailable or does not match');

  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  return {
    skipped: false,
    ok: response.ok,
    status: response.status,
    body: await response.text(),
  };
}

// These holds only prevent duplicate API attempts for the approved repair batch.
// They never turn a manual report/receipt into an API acceptance or timestamp.
// A hold can only be released by a recorded human authorization for the exact
// currently observed content date. Missing/changed versions never match.
export function baiduReleaseAuthorizations(registry) {
  const releases = registry.releaseAuthorizations ?? [];
  if (!Array.isArray(releases) || releases.some((entry) => {
    try {
      const url = new URL(entry.url);
      return url.origin !== FALLBACK_SITE_URL || url.search || url.hash || url.href !== entry.url ||
        typeof entry.contentLastmod !== 'string' || !entry.contentLastmod ||
        !Number.isFinite(Date.parse(entry.contentLastmod)) || entry.authorizedBy !== 'user' ||
        typeof entry.authorizationSource !== 'string' || !entry.authorizationSource.trim();
    } catch { return true; }
  }) || new Set(releases.map((entry) => JSON.stringify([entry.url, entry.contentLastmod]))).size !== releases.length) {
    throw new Error('Invalid version-specific Baidu release authorization; refusing to release a hold');
  }
  return releases;
}

export function selectUnprotectedBaiduUrls(urls, liveVersions = new Map(), registry =
    JSON.parse(readFileSync(new URL('./baidu-manual-submission-protection.json', import.meta.url), 'utf8'))) {
  if (registry.version !== 1 || !Array.isArray(registry.entries) || registry.entries.some((entry) =>
    !['user-reported-submitted', 'platform-received'].includes(entry.evidenceStatus) ||
    typeof entry.url !== 'string' || new URL(entry.url).origin !== FALLBACK_SITE_URL ||
    new URL(entry.url).search || new URL(entry.url).hash || new URL(entry.url).href !== entry.url) ||
    new Set(registry.entries.map((entry) => entry.url)).size !== registry.entries.length) {
    throw new Error('Invalid manual-submission protection; refusing an automatic attempt');
  }
  if (!(liveVersions instanceof Map)) throw new Error('Current content versions are required for Baidu release checks');
  const released = new Set(baiduReleaseAuthorizations(registry)
    .filter((entry) => liveVersions.get(entry.url) === entry.contentLastmod).map((entry) => entry.url));
  const held = new Set(registry.entries.map((entry) => entry.url).filter((url) => !released.has(url)));
  return { urls: urls.filter((url) => !held.has(url)), protectedUrls: urls.filter((url) => held.has(url)) };
}

export async function submitBaidu(siteUrl, urls, dryRun, remaining = Infinity, { liveVersions = new Map(), registry } = {}) {
  const mode = baiduSubmissionMode();
  const protection = selectUnprotectedBaiduUrls(urls, liveVersions, registry);
  urls = protection.urls;
  const protectedUrls = protection.protectedUrls;
  if (!urls.length && protectedUrls.length) {
    return { skipped: true, reason: 'manually handled URLs protected; no API attempt or acceptance', protectedUrls, acceptedUrls: [] };
  }
  if (mode === 'manual') {
    return { skipped: true, paused: true, reason: 'automatic submission paused by owner decision; manual review only; pending URLs retained (not accepted)', protectedUrls, acceptedUrls: [] };
  }
  const token = getEnv('BAIDU_TOKEN') || getEnv('BAIDU_PUSH_TOKEN');

  if (!token) {
    return { skipped: true, reason: 'BAIDU_TOKEN is not set (BAIDU_PUSH_TOKEN is accepted as a legacy alias)', protectedUrls };
  }

  const limit = Number(getEnv('BAIDU_PUSH_MAX_URLS') || 10);
  if (!Number.isInteger(limit) || limit < 1) throw new Error('Invalid Baidu submission limit');
  const selected = urls.slice(0, Math.min(limit, remaining));
  if (!selected.length) return { skipped: true, reason: 'Daily submission budget exhausted', protectedUrls };
  if (selected.length < urls.length) {
    console.warn(`${process.env.CI ? '::warning::' : ''}Baidu: ${urls.length - selected.length} URLs deferred by per-run budget:`);
    for (const url of urls.slice(selected.length)) console.log(`DEFERRED ${url}`);
  }
  const registeredSite = getEnv('BAIDU_SITE') || siteUrl;
  const registeredUrl = new URL(registeredSite.includes('://') ? registeredSite : `https://${registeredSite}`);
  if (!['http:', 'https:'].includes(registeredUrl.protocol) || registeredUrl.hostname !== new URL(siteUrl).hostname || registeredUrl.username || registeredUrl.password || registeredUrl.search || registeredUrl.hash || registeredUrl.pathname !== '/') {
    throw new Error('Baidu registered site must match the public website host');
  }
  // The official HTTP endpoint is available only by a separate literal opt-in.
  // Never downgrade after a TLS error or accept a caller-supplied endpoint.
  const protocol = process.env.BAIDU_ALLOW_HTTP === 'true' ? 'http' : 'https';
  const endpoint = `${protocol}://data.zz.baidu.com/urls?site=${encodeURIComponent(registeredSite)}&token=${encodeURIComponent(token)}`;

  if (dryRun) {
    return { skipped: false, dryRun: true, submitted: selected.length, protectedUrls };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    // Do not follow redirects with a credential-bearing submission request.
    redirect: 'error',
    signal: AbortSignal.timeout(15000),
    headers: {
      'content-type': 'text/plain',
    },
    body: selected.join('\n'),
  });

  const body = await response.text();
  let accepted = false;
  try {
    const result = JSON.parse(body);
    accepted = Boolean(result && typeof result === 'object' && !Array.isArray(result) &&
      !Object.prototype.hasOwnProperty.call(result, 'error') &&
      Number.isSafeInteger(result.success) && result.success === selected.length &&
      (result.remain === undefined || (Number.isSafeInteger(result.remain) && result.remain >= 0)) &&
      ['not_valid', 'not_same_site'].every((key) => result[key] === undefined ||
        (Array.isArray(result[key]) && result[key].length === 0)));
  } catch { /* Invalid responses are failures. */ }
  // Do not expose raw response bodies: an upstream error may echo the token.
  const ok = response.ok && accepted;
  return { skipped: false, ok, status: response.status,
    ...(!ok ? { reason: 'Baidu did not confirm the complete batch; acceptance is unconfirmed' } : {}),
    acceptedUrls: ok ? selected : [], protectedUrls };

}

function printResult(name, result) {
  if (result.skipped) {
    console.log(`${process.env.CI ? '::warning::' : ''}${name}: skipped (${result.reason}); not submitted.`);
    return;
  }

  if (result.dryRun) {
    console.log(`${name}: dry run, ${result.submitted} URLs ready`);
    return;
  }

  console.log(`${name}: HTTP ${result.status}${result.ok ? ' OK' : ' FAILED'}`);
  if (result.body) console.log(result.body);
}

async function main() {
  const siteUrl = normalizeSiteUrl(readArg('--site') || getEnv('NEXT_PUBLIC_SITE_URL'));
  const dryRun = process.argv.includes('--dry-run');
  const sitemapUrls = await loadSitemapUrls(siteUrl);
  const selection = selectSubmissionUrls(siteUrl, sitemapUrls);
  const urls = selection.urls;

  if (!urls.length) {
    console.log('No changed URLs selected; nothing submitted.');
    return;
  }

  console.log(`Site: ${siteUrl}`);
  console.log(`Sitemap URLs: ${sitemapUrls.length}`);
  console.log(`Selected URLs: ${urls.length}`);
  if (selection.requested) console.log(`Explicit URLs: ${selection.requested}`);
  if (selection.excluded.length) console.log(`Excluded URLs: ${selection.excluded.length}`);
  for (const url of urls) console.log(`- ${url}`);

  for (const [name, submit] of [['IndexNow', submitIndexNow], ['Baidu', submitBaidu]]) {
    try {
      const result = await submit(siteUrl, urls, dryRun);
      printResult(name, result);
      if (!result.skipped && !result.dryRun && !result.ok) process.exitCode = 1;
    } catch (error) {
      console.error(`${name}: ${describeSubmissionFailure(error)}.`);
      process.exitCode = 1;
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
