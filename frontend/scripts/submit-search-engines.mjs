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

function extractUrlsFromSitemap(xml) {
  return [...sitemapEntries(xml).keys()];
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
  const urls = extractUrlsFromSitemap(xml);

  if (!urls.length) {
    throw new Error(`No <loc> URLs found in ${sitemapUrl}`);
  }

  return urls;
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

export async function submitBaidu(siteUrl, urls, dryRun, remaining = Infinity) {
  const token = getEnv('BAIDU_TOKEN') || getEnv('BAIDU_PUSH_TOKEN');

  if (!token) {
    return { skipped: true, reason: 'BAIDU_TOKEN is not set (BAIDU_PUSH_TOKEN is accepted as a legacy alias)' };
  }

  const limit = Number(getEnv('BAIDU_PUSH_MAX_URLS') || 10);
  if (!Number.isInteger(limit) || limit < 1) throw new Error('Invalid Baidu submission limit');
  const selected = urls.slice(0, Math.min(limit, remaining));
  if (!selected.length) return { skipped: true, reason: 'Daily submission budget exhausted' };
  if (selected.length < urls.length) {
    console.warn(`${process.env.CI ? '::warning::' : ''}Baidu: ${urls.length - selected.length} URLs deferred by per-run budget:`);
    for (const url of urls.slice(limit)) console.log(`DEFERRED ${url}`);
  }
  const registeredSite = getEnv('BAIDU_SITE') || siteUrl;
  const registeredUrl = new URL(registeredSite.includes('://') ? registeredSite : `https://${registeredSite}`);
  if (!['http:', 'https:'].includes(registeredUrl.protocol) || registeredUrl.hostname !== new URL(siteUrl).hostname || registeredUrl.username || registeredUrl.password || registeredUrl.search || registeredUrl.hash || registeredUrl.pathname !== '/') {
    throw new Error('Baidu registered site must match the public website host');
  }
  const endpoint = `https://data.zz.baidu.com/urls?site=${encodeURIComponent(registeredSite)}&token=${encodeURIComponent(token)}`;

  if (dryRun) {
    return { skipped: false, dryRun: true, submitted: selected.length };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: {
      'content-type': 'text/plain',
    },
    body: selected.join('\n'),
  });

  const body = await response.text();
  let accepted = false;
  try { const result = JSON.parse(body); accepted = !result.error && Number(result.success) === selected.length; } catch { /* Invalid responses are failures. */ }
  return { skipped: false, ok: response.ok && accepted, status: response.status, body, acceptedUrls: response.ok && accepted ? selected : [] };

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
    } catch {
      console.error(`${name}: request failed; check the engine response and credentials.`);
      process.exitCode = 1;
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
