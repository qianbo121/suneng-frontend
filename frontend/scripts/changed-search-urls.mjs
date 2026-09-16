import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const decodeXml = (value) => value.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&apos;', "'");
export function sitemapEntries(xml) {
  if (!/<urlset(?:\s[^>]*)?>/.test(xml) || !/<\/urlset>\s*$/.test(xml) ||
      (xml.match(/<url>/g) || []).length !== (xml.match(/<\/url>/g) || []).length) {
    throw new Error('Sitemap is incomplete or is not a URL set');
  }
  const entries = new Map();
  for (const match of xml.matchAll(/<url>\s*([\s\S]*?)<\/url>/g)) {
    const url = match[1].match(/<loc>(.*?)<\/loc>/)?.[1];
    if (!url) throw new Error('Sitemap entry has no URL');
    const decoded = decodeXml(url.trim());
    if (entries.has(decoded)) throw new Error('Sitemap contains duplicate URLs');
    entries.set(decoded, match[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1] || '');
  }
  if (!entries.size) throw new Error('Sitemap contains no page URLs');
  return entries;
}

export function selectChangedUrls(before, after, files = [], cases = []) {
  const changed = new Set([...after].filter(([url, date]) => !before.has(url) || (date && before.get(url) !== date)).map(([url]) => url));
  const paths = new Set();
  for (const file of files) {
    const route = file.match(/^frontend\/src\/app\/\[locale\](.*?)\/page\.tsx$/)?.[1];
    if (route !== undefined && !route.includes('[')) {
      for (const locale of ['zh', 'en']) paths.add(`/${locale}${route}`);
    }
    const line = file.match(/^frontend\/src\/lib\/production-lines\/([^/]+)\.json$/)?.[1];
    if (line) paths.add(`/zh/products/detail/${line}`);
    if (file === 'frontend/src/lib/fastener-line-content.json') paths.add('/zh/products/detail/fastener-quench-temper-line');
    if (file.startsWith('frontend/src/components/home/')) { paths.add('/zh'); paths.add('/en'); }
    if (file.startsWith('frontend/src/components/about/')) { paths.add('/zh/about'); paths.add('/en/about'); }
    if (file.startsWith('frontend/src/components/service-pages/')) {
      paths.add('/zh/service');
      paths.add('/zh/service/installation-after-sales');
      paths.add('/zh/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan');
    }
    for (const item of cases) {
      if ([`frontend/content/cases/${item.file}`, `frontend/content/cases/${item.body}`].includes(file)) paths.add(`/zh/case/${item.slug}`);
    }
  }
  for (const url of after.keys()) if (paths.has(new URL(url).pathname)) changed.add(url);
  // Only canonical entries that are present after deployment are submitted.
  return [...changed].filter((url) => after.has(url)).sort();
}

function main() {
  const arg = (name) => process.argv.find((value) => value.startsWith(`${name}=`))?.slice(name.length + 1);
  const before = sitemapEntries(readFileSync(arg('--before'), 'utf8'));
  const after = sitemapEntries(readFileSync(arg('--after'), 'utf8'));
  const base = arg('--base');
  const files = base ? execFileSync('git', ['diff', '--name-only', base, 'HEAD'], { encoding: 'utf8' }).trim().split('\n') : [];
  const cases = readdirSync('frontend/content/cases').filter((file) => file.endsWith('.json')).map((file) => ({ ...JSON.parse(readFileSync(`frontend/content/cases/${file}`, 'utf8')), file }));
  const urls = selectChangedUrls(before, after, files, cases);
  writeFileSync(arg('--output'), JSON.stringify(urls, null, 2));
  console.log(`${urls.length} changed canonical pages selected; no whole-sitemap submission.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
