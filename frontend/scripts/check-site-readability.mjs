#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { PROCUREMENT_PAGES, CANONICAL_ORIGIN } from './check-acquisition-continuity.mjs';

export const USER_AGENT = 'suneng-internal-linkcheck';
const DEFAULT_MANIFEST = new URL('./site-readability-manifest.json', import.meta.url);
const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const SKIP = new Set(['script', 'style', 'template', 'noscript', 'svg']);
const NAVIGATION = new Set(['nav', 'aside']);
const RANK = { unreadable: 0, partial: 1, readable: 2, exempt: 3 };

function decode(text) {
  return text.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (match, entity) => {
    const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
    if (entity[0] !== '#') return named[entity.toLowerCase()] ?? match;
    const value = /^#x/i.test(entity) ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return value > 0 && value <= 0x10ffff ? String.fromCodePoint(value) : match;
  });
}
const flat = (value) => value.replace(/\s+/g, ' ').trim();

// Reads only literal HTML. In particular it never evaluates, replays or
// simulates React's $RC/$RS instructions and never promotes hidden segments.
export function inspectHtml(html, { minBodyCharacters = 300, contentContract, path: pathname } = {}) {
  if (contentContract && (contentContract.path !== pathname || !contentContract.expectedH1
    || !Array.isArray(contentContract.requiredTexts) || !contentContract.requiredTexts.length
    || !Array.isArray(contentContract.requiredMainLinks) || !contentContract.requiredMainLinks.length)) {
    throw new Error('a short-page contract must match the exact path and specify title, body text and main links');
  }
  const stack = [];
  const body = [], headings = [], screenReaderHeadings = [], hiddenHeadings = [], links = [];
  let currentHeading = null;
  let cssDependentNodes = 0;
  const tokens = html.match(/<!--[\s\S]*?-->|<![^>]*>|<\/?[a-zA-Z](?:[^"'<>]|"[^"]*"|'[^']*')*>|[^<]+|</g) ?? [];
  for (const token of tokens) {
    const parent = stack.at(-1);
    if (parent && ['script', 'style'].includes(parent.tag) && !new RegExp(`^</${parent.tag}\\s*>$`, 'i').test(token)) continue;
    if (token.startsWith('<!--') || token.startsWith('<!')) continue;
    if (token.startsWith('</')) {
      const tag = token.match(/^<\/\s*([^\s>]+)/)?.[1].toLowerCase();
      const position = stack.findLastIndex((node) => node.tag === tag);
      if (position >= 0) {
        if (stack.slice(position).some((node) => node.heading === currentHeading) && currentHeading) {
          const value = flat(currentHeading.text.join(''));
          if (value) (currentHeading.visible ? headings : currentHeading.screenReaderReadable ? screenReaderHeadings : hiddenHeadings).push(value);
          currentHeading = null;
        }
        stack.length = position;
      }
      continue;
    }
    if (/^<[a-z]/i.test(token)) {
      const tag = token.match(/^<([^\s/>]+)/)[1].toLowerCase();
      const attrs = {};
      for (const match of token.slice(tag.length + 1, -1).matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? '');
      const classes = (attrs.class ?? '').split(/\s+/);
      const responsiveOverride = classes.some((name) => /:(?:block|flex|grid|inline|inline-block|inline-flex|table)$/.test(name));
      if (classes.includes('hidden') && responsiveOverride) cssDependentNodes++;
      const structurallyHidden = Boolean(parent?.structurallyHidden || 'hidden' in attrs || attrs['aria-hidden'] === 'true'
        || /(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*hidden)\b/i.test(attrs.style ?? '')
        || classes.includes('invisible') || (classes.includes('hidden') && !responsiveOverride));
      const screenReaderOnly = Boolean(parent?.screenReaderOnly || classes.includes('sr-only'));
      const hidden = structurallyHidden || screenReaderOnly;
      const skipped = Boolean(parent?.skipped || SKIP.has(tag));
      const inMain = tag === 'main' || Boolean(parent?.inMain);
      // An article's own header often contains its real h1. Only headers and
      // footers outside main are site chrome; nav/aside remain excluded.
      const inNavigation = NAVIGATION.has(tag) || (['header', 'footer'].includes(tag) && !inMain) || Boolean(parent?.inNavigation);
      const node = { tag, hidden, structurallyHidden, screenReaderOnly, skipped, inMain, inNavigation };
      if (tag === 'h1' && !skipped) {
        currentHeading = { visible: inMain && !hidden && !inNavigation,
          screenReaderReadable: inMain && screenReaderOnly && !structurallyHidden && !inNavigation, text: [] };
        node.heading = currentHeading;
      }
      if (tag === 'a' && attrs.href && !skipped) links.push({ href: attrs.href, hidden, visibleMain: inMain && !hidden && !inNavigation });
      if (!VOID.has(tag) && !token.endsWith('/>')) stack.push(node);
      continue;
    }
    if (!parent || parent.skipped) continue;
    const text = decode(token);
    if (currentHeading) currentHeading.text.push(text);
    if (parent.inMain && !parent.hidden && !parent.inNavigation) body.push(text);
  }
  const mainText = flat(body.join(''));
  const bodyCharacters = mainText.replace(/\s/g, '').length;
  const semanticHeadingCount = headings.length + screenReaderHeadings.length;
  const visibleMainLinks = links.filter((link) => link.visibleMain).map((link) => link.href);
  const contractChecks = contentContract ? {
    title: { expected: contentContract.expectedH1, passed: headings.length === 1 && headings[0] === contentContract.expectedH1 },
    text: contentContract.requiredTexts.map((text) => ({ text, passed: mainText.includes(text) })),
    links: contentContract.requiredMainLinks.map((expected) => ({ ...expected, passed: visibleMainLinks.some((href) => {
      if (expected.href) return href === expected.href;
      if (expected.pathname) {
        const local = localPath(href, CANONICAL_ORIGIN, pathname);
        return local !== null && new URL(local, CANONICAL_ORIGIN).pathname === expected.pathname;
      }
      return false;
    }) })),
  } : null;
  const contractPassed = contractChecks ? contractChecks.title.passed && contractChecks.text.every((item) => item.passed) && contractChecks.links.every((item) => item.passed) : null;
  // A declared short-page contract is mandatory even if filler pushes the page
  // above the generic length threshold. Footer/navigation/hidden text cannot
  // replace a missing contact block or approved case card.
  const readable = semanticHeadingCount === 1 && (contentContract ? contractPassed : bodyCharacters >= minBodyCharacters);
  return {
    classification: readable ? 'readable' : semanticHeadingCount || bodyCharacters >= minBodyCharacters ? 'partial' : 'unreadable',
    h1: headings, screenReaderH1: screenReaderHeadings, hiddenH1: hiddenHeadings, bodyCharacters, minBodyCharacters,
    contentProfile: contentContract ? 'verified-short-page' : 'standard', contentContract: contractChecks ? { passed: contractPassed, checks: contractChecks } : null,
    visibleMainLinks,
    mainTextSha256: createHash('sha256').update(mainText).digest('hex'),
    bodyPreview: mainText.slice(0, 120), links, cssDependentNodes,
  };
}

function originOnly(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('base URL must be a credential-free http(s) origin');
  return url.origin;
}

export function localPath(value, baseUrl, fromPath = '/') {
  let url;
  try { url = new URL(value, baseUrl + fromPath); } catch { return null; }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
  if (![baseUrl, CANONICAL_ORIGIN, 'https://jssngyl.cn'].includes(url.origin)) return null;
  url.hash = '';
  // Never fetch APIs, admin, action-like query URLs or framework payloads.
  if (/^\/(?:api|admin|_next)(?:\/|$)/i.test(url.pathname) || url.searchParams.has('_rsc')) return null;
  return url.pathname + url.search;
}

async function responseFor(baseUrl, pathname, { timeoutMs, maxBytes, rawHtmlDir }, fetcher) {
  const started = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const result = { path: pathname, status: null, location: null, bytes: 0, firstByteMs: null, totalMs: null };
  try {
    const response = await fetcher(baseUrl + pathname, { method: 'GET', redirect: 'manual', signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html, application/xml;q=0.9', 'Accept-Encoding': 'identity' } });
    result.firstByteMs = Math.round(performance.now() - started);
    result.status = response.status;
    result.location = response.headers.get('location');
    result.contentType = response.headers.get('content-type') ?? '';
    const chunks = [];
    for await (const chunk of response.body ?? []) {
      result.bytes += chunk.length;
      if (result.bytes > maxBytes) { controller.abort(); throw new Error(`response exceeds ${maxBytes} bytes`); }
      chunks.push(chunk);
    }
    const bytes = Buffer.concat(chunks);
    result.body = bytes.toString('utf8');
    result.htmlSha256 = createHash('sha256').update(bytes).digest('hex');
    if (rawHtmlDir) {
      const name = createHash('sha256').update(pathname).digest('hex');
      const extension = /text\/html/i.test(result.contentType) ? '.html' : '.txt';
      result.rawPath = path.join(rawHtmlDir, name + extension);
      await fs.writeFile(result.rawPath, bytes, { flag: 'wx' });
    }
  } catch (error) { result.error = error.message; }
  finally { clearTimeout(timeout); result.totalMs = Math.round(performance.now() - started); }
  return result;
}

async function pool(items, concurrency, action) {
  let next = 0;
  const output = new Array(items.length);
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) { const index = next++; output[index] = await action(items[index]); }
  }));
  return output;
}

export async function scanSite(options = {}) {
  const baseUrl = originOnly(options.baseUrl ?? 'http://127.0.0.1:3000');
  const manifest = options.manifest ?? JSON.parse(await fs.readFile(DEFAULT_MANIFEST, 'utf8'));
  const config = { timeoutMs: options.timeoutMs ?? 15000, maxBytes: 5 * 1024 * 1024 };
  if (options.rawHtmlDir) {
    config.rawHtmlDir = path.resolve(options.rawHtmlDir);
    if (config.rawHtmlDir.split(path.sep).some((part) => ['src', 'public', '.git', 'content'].includes(part))) throw new Error('raw response directory must not be a source/content directory');
    try { await fs.access(config.rawHtmlDir); throw new Error('raw response directory exists; choose a new path'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    await fs.mkdir(config.rawHtmlDir, { recursive: true });
  }
  const concurrency = options.concurrency ?? 2;
  const maxUrls = options.maxUrls ?? 1200;
  const listedPaths = options.paths ?? manifest.paths;
  const linkScope = options.linkScope ?? 'all';
  if (!['all', 'listed'].includes(linkScope)) throw new Error('link scope must be all or listed');
  if (listedPaths && (!Array.isArray(listedPaths) || !listedPaths.length || listedPaths.some((item) => typeof item !== 'string'))) throw new Error('paths must be a nonempty string array');
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 3) throw new Error('concurrency must be 1–3');
  if (!Number.isInteger(config.timeoutMs) || config.timeoutMs < 100 || config.timeoutMs > 60000) throw new Error('timeout must be 100–60000 ms');
  if (!Number.isInteger(maxUrls) || maxUrls < 1 || maxUrls > 3000) throw new Error('max URLs must be 1–3000');
  const cache = new Map(), issues = [], sitemapPaths = new Set();
  const fetcher = options.fetcher ?? fetch;
  const get = async (pathname) => {
    if (!cache.has(pathname)) {
      if (cache.size >= maxUrls) throw new Error(`URL cap exceeded (${maxUrls}); scan incomplete`);
      cache.set(pathname, responseFor(baseUrl, pathname, config, fetcher));
    }
    return cache.get(pathname);
  };
  const maps = listedPaths ? [] : ['/sitemap.xml'], seenMaps = new Set();
  while (maps.length) {
    if (seenMaps.size >= 12) throw new Error('sitemap file cap exceeded; scan incomplete');
    const mapPath = maps.shift();
    if (seenMaps.has(mapPath)) continue;
    seenMaps.add(mapPath);
    const result = await get(mapPath);
    if (result.error || result.status !== 200) { issues.push({ kind: 'sitemap', path: mapPath, status: result.status, error: result.error }); continue; }
    const xml = result.body.replace(/<!--[\s\S]*?-->/g, '');
    const isIndex = /<sitemapindex(?:\s|>)/i.test(xml);
    if (!isIndex && !/<urlset(?:\s|>)/i.test(xml)) { issues.push({ kind: 'invalid-sitemap', path: mapPath }); continue; }
    const locs = [...xml.matchAll(/<loc(?:\s[^>]*)?>([\s\S]*?)<\/loc\s*>/gi)].map((match) => decode(match[1].trim()));
    if (!locs.length) issues.push({ kind: 'empty-sitemap', path: mapPath });
    for (const loc of locs) {
      const pathname = localPath(loc, baseUrl);
      if (!pathname) { issues.push({ kind: 'out-of-scope-sitemap-url', url: loc }); continue; }
      if (isIndex) maps.push(pathname); else sitemapPaths.add(pathname);
    }
  }
  const normalizedListedPaths = listedPaths?.map((item) => {
    const pathname = localPath(item, baseUrl);
    if (!pathname) throw new Error(`unsafe listed path: ${item}`);
    return pathname;
  });
  const keyPaths = (manifest.keyPages ?? PROCUREMENT_PAGES.map((page) => page.path))
    .filter((pathname) => !normalizedListedPaths || normalizedListedPaths.includes(pathname));
  const seeds = [...new Set(normalizedListedPaths ?? [...sitemapPaths, ...keyPaths, ...(manifest.extraPages ?? [])])].sort();
  for (const pathname of seeds) if (localPath(pathname, baseUrl) !== pathname) throw new Error(`unsafe manifest path: ${pathname}`);
  const baseline = options.baseline;
  if (baseline && (baseline.kind !== 'site-readability-report' || baseline.version !== 1)) throw new Error('unsupported baseline report');
  const baselinePages = new Map((baseline?.pages ?? []).map((page) => [page.path, page]));
  const pages = await pool(seeds, concurrency, async (pathname) => {
    const response = await get(pathname);
    const { body = '', ...transport } = response;
    const inspected = inspectHtml(body, { minBodyCharacters: manifest.minBodyCharacters ?? 300, path: pathname, contentContract: manifest.contentContracts?.[pathname] });
    if (response.error) inspected.classification = 'error';
    else if (response.status !== 200 || !/text\/html/i.test(response.contentType ?? '')) inspected.classification = 'not-page';
    const exception = (manifest.readabilityExceptions ?? []).find((item) => item.path === pathname);
    const required = (options.requiredPrefixes ?? []).some((prefix) => pathname.startsWith(prefix))
      || (manifest.requiredReadablePaths ?? []).includes(pathname);
    const item = { ...transport, ...inspected, inSitemap: sitemapPaths.has(pathname), exception: exception?.reason ?? null, required };
    if (response.error || response.status !== 200 || !/text\/html/i.test(response.contentType ?? '')) issues.push({ kind: 'page-response', path: pathname, status: response.status, error: response.error });
    if (!exception && ['partial', 'unreadable'].includes(inspected.classification)) {
      const before = baselinePages.get(pathname);
      const baselineComparable = before?.status === 200 && !before.error
        && ['readable', 'partial', 'unreadable'].includes(before.classification);
      const regression = !baselineComparable || RANK[inspected.classification] < RANK[before.classification];
      if (!baseline || required || regression) issues.push({ kind: 'readability', path: pathname, classification: inspected.classification, baseline: before?.classification ?? null, baselineComparable: Boolean(baselineComparable) });
    }
    return item;
  });
  const inbound = new Map();
  let excludedLinkCount = 0;
  for (const page of pages) for (const link of page.links) {
    const target = localPath(link.href, baseUrl, page.path);
    if (!target || /\.(?:png|jpe?g|webp|gif|svg|ico|css|js|woff2?|mp4|webm|mp3)(?:\?|$)/i.test(target)) continue;
    if (linkScope === 'listed' && !seeds.includes(target)) { excludedLinkCount++; continue; }
    if (!inbound.has(target)) inbound.set(target, new Set());
    inbound.get(target).add(page.path);
  }
  const follow = async (pathname) => {
    const chain = [], seen = new Set();
    for (let hops = 0; hops < 6; hops++) {
      if (seen.has(pathname)) return { chain, error: 'redirect loop' };
      seen.add(pathname);
      const response = await get(pathname);
      chain.push({ path: pathname, status: response.status, location: response.location });
      if (response.error) return { chain, error: response.error };
      if (![301, 302, 303, 307, 308].includes(response.status)) return { chain, finalStatus: response.status, finalPath: pathname };
      const next = response.location && localPath(response.location, baseUrl, pathname);
      if (!next) return { chain, error: 'redirect leaves allowed site or has unsafe destination' };
      pathname = next;
    }
    return { chain, error: 'redirect limit exceeded' };
  };
  const links = await pool([...inbound.keys()].sort(), concurrency, async (pathname) => {
    const result = await follow(pathname);
    const passed = !result.error && result.finalStatus >= 200 && result.finalStatus < 300;
    const row = { path: pathname, from: [...inbound.get(pathname)].sort(), ...result, passed };
    if (!passed) issues.push({ kind: 'internal-link', ...row });
    return row;
  });
  const expectedUrls = await pool(manifest.expectedUrls ?? [], concurrency, async (expected) => {
    if (localPath(expected.path, baseUrl) !== expected.path || !Array.isArray(expected.statuses) || !expected.reason) throw new Error('invalid expected URL entry');
    const response = await get(expected.path);
    const actualLocation = response.location ? localPath(response.location, baseUrl, expected.path) : null;
    const redirects = [301, 302, 303, 307, 308].includes(response.status);
    const destination = redirects ? await follow(expected.path) : null;
    const destinationPassed = !redirects || (!destination.error && destination.finalStatus >= 200 && destination.finalStatus < 300);
    const passed = !response.error && expected.statuses.includes(response.status)
      && (expected.location === undefined || actualLocation === expected.location) && destinationPassed;
    const row = { ...expected, actualStatus: response.status, actualLocation,
      ...(destination ? { chain: destination.chain, finalStatus: destination.finalStatus ?? null, finalPath: destination.finalPath ?? null, destinationPassed } : {}),
      error: response.error ?? destination?.error, passed };
    if (!passed) issues.push({ kind: 'expected-url', ...row });
    return row;
  });
  const removals = baseline && !listedPaths ? baseline.pages.filter((page) => page.inSitemap && !sitemapPaths.has(page.path)).map((page) => page.path) : [];
  for (const pathname of removals) issues.push({ kind: 'removed-from-sitemap', path: pathname });
  const counts = { readable: 0, partial: 0, unreadable: 0, error: 0, 'not-page': 0, exempt: 0 };
  for (const page of pages) { counts[page.classification]++; if (page.exception) counts.exempt++; delete page.links; }
  const byPath = new Map(pages.map((page) => [page.path, page]));
  const keyPages = keyPaths.map((pathname) => ({ path: pathname, status: byPath.get(pathname)?.status ?? null, passed: byPath.get(pathname)?.status === 200 && !byPath.get(pathname)?.error }));
  return {
    kind: 'site-readability-report', version: 1, checkedAt: new Date().toISOString(), baseUrl, userAgent: USER_AGENT,
    passed: issues.length === 0, mode: baseline ? 'no-regression-with-required-scope' : 'strict-inventory',
    scope: { source: listedPaths ? 'explicit-path-list' : 'sitemap-and-protected-pages', linkScope, excludedLinkOccurrences: excludedLinkCount, originsMappedToRequestedBase: [CANONICAL_ORIGIN, 'https://jssngyl.cn'], rawHtmlDirectory: config.rawHtmlDir ?? null },
    method: 'GET-only literal HTML; no page JavaScript, no streaming-boundary replay, no contact clicks or submissions',
    summary: { sitemapPages: sitemapPaths.size, pagesChecked: pages.length, ...counts, internalLinksChecked: links.length, brokenLinks: links.filter((row) => !row.passed).length, requests: cache.size, issues: issues.length },
    browserChecks: { status: 'not-run', required: ['desktop/mobile contact toolbar visible', 'phone target', 'WeChat opens and copies', 'form validation', 'no hydration errors'], note: 'Run isolated browser acceptance separately. HTML success never proves viewport visibility, interactions or event persistence.' },
    baseline: baseline ? { checkedAt: baseline.checkedAt, baseUrl: baseline.baseUrl, comparedBy: 'identical normalized path and query; requested origin explicitly remapped', matchedPages: seeds.filter((pathname) => baselinePages.has(pathname)).length, removedFromSitemap: removals } : null,
    limitations: ['Structural readability is not proof of crawler indexing or AI recommendation.', 'Responsive/external CSS is not rendered; cssDependentNodes and desktop/mobile browser evidence must be reviewed.', 'Timing is a single bounded request observation, not a performance benchmark.', 'Known dead links remain failures even when already present in a baseline.'],
    pages, keyPages, links, expectedUrls, issues,
  };
}

export async function run(argv) {
  const options = {}, requiredPrefixes = [];
  let reportPath, manifestPath, baselinePath, pathsFile;
  for (let index = 0; index < argv.length; index++) {
    const flag = argv[index];
    if (flag === '--help') { console.log('node scripts/check-site-readability.mjs --base-url http://127.0.0.1:3000 --report NEW.json [--raw-html-dir NEW_DIRECTORY] [--manifest FILE.json] [--paths-file PATHS.json] [--link-scope all|listed] [--baseline REPORT.json] [--require-prefix /zh/products/detail/] [--concurrency 2] [--timeout-ms 15000] [--max-urls 1200]\nOnly GET; report and raw response directory must not exist; exit 1 means reported failures, exit 2 means invalid/incomplete scan. Path files contain a JSON string array; listed link scope explicitly excludes targets outside that list.'); return 0; }
    if (!['--base-url', '--report', '--raw-html-dir', '--manifest', '--paths-file', '--link-scope', '--baseline', '--require-prefix', '--concurrency', '--timeout-ms', '--max-urls'].includes(flag)) throw new Error(`unknown flag: ${flag}`);
    const value = argv[++index];
    if (!value || value.startsWith('--')) throw new Error(`missing value: ${flag}`);
    if (flag === '--base-url') options.baseUrl = value;
    if (flag === '--report') reportPath = path.resolve(value);
    if (flag === '--raw-html-dir') options.rawHtmlDir = value;
    if (flag === '--manifest') manifestPath = path.resolve(value);
    if (flag === '--baseline') baselinePath = path.resolve(value);
    if (flag === '--paths-file') pathsFile = path.resolve(value);
    if (flag === '--link-scope') options.linkScope = value;
    if (flag === '--require-prefix') requiredPrefixes.push(value);
    if (flag === '--concurrency') options.concurrency = Number(value);
    if (flag === '--timeout-ms') options.timeoutMs = Number(value);
    if (flag === '--max-urls') options.maxUrls = Number(value);
  }
  if (!reportPath) throw new Error('--report is required');
  if (reportPath.split(path.sep).some((part) => ['src', 'public', '.git', 'content'].includes(part))) throw new Error('report must not be written into source/content directories');
  try { await fs.access(reportPath); throw new Error('report exists; choose a new path'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (manifestPath) options.manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  if (baselinePath) options.baseline = JSON.parse(await fs.readFile(baselinePath, 'utf8'));
  if (pathsFile) options.paths = JSON.parse(await fs.readFile(pathsFile, 'utf8'));
  options.requiredPrefixes = requiredPrefixes;
  const report = await scanSite(options);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ passed: report.passed, report: reportPath, ...report.summary, browserChecks: report.browserChecks.status }));
  return report.passed ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = await run(process.argv.slice(2)); }
  catch (error) { console.error(JSON.stringify({ passed: false, incomplete: true, error: error.message })); process.exitCode = 2; }
}
