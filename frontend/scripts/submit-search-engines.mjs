const FALLBACK_SITE_URL = 'https://www.sunengfurnace.com';

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

function getEnv(name) {
  return process.env[name]?.trim() || '';
}

function extractUrlsFromSitemap(xml) {
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((match) => match[1].trim()).filter(Boolean);
}

async function loadSitemapUrls(siteUrl) {
  const sitemapUrl = `${siteUrl}/sitemap.xml`;
  const response = await fetch(sitemapUrl, {
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

async function submitIndexNow(siteUrl, urls, dryRun) {
  const key = getEnv('INDEXNOW_KEY');
  const keyLocation = getEnv('INDEXNOW_KEY_LOCATION') || `${siteUrl}/${key}.txt`;

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

  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
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

async function submitBaidu(siteUrl, urls, dryRun) {
  const token = getEnv('BAIDU_PUSH_TOKEN');

  if (!token) {
    return { skipped: true, reason: 'BAIDU_PUSH_TOKEN is not set' };
  }

  const endpoint = `https://data.zz.baidu.com/urls?site=${encodeURIComponent(siteUrl)}&token=${encodeURIComponent(token)}`;

  if (dryRun) {
    return { skipped: false, dryRun: true, submitted: urls.length };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'text/plain',
    },
    body: urls.join('\n'),
  });

  return {
    skipped: false,
    ok: response.ok,
    status: response.status,
    body: await response.text(),
  };
}

function printResult(name, result) {
  if (result.skipped) {
    console.log(`${name}: skipped (${result.reason})`);
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
  const urls = await loadSitemapUrls(siteUrl);

  console.log(`Site: ${siteUrl}`);
  console.log(`URLs: ${urls.length}`);

  printResult('IndexNow', await submitIndexNow(siteUrl, urls, dryRun));
  printResult('Baidu', await submitBaidu(siteUrl, urls, dryRun));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
