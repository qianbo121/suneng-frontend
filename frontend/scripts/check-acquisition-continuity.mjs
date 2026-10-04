#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Public procurement contract only. Withdrawn cases and unapproved English pages
// must not be made public to satisfy this check. No form or submission requests.
export const CANONICAL_ORIGIN = 'https://www.jssngyl.cn';
export const PROCUREMENT_PAGES = Object.freeze([
  { path: '/zh/articles/gongye-lu-baojia-canshu', topic: '单台工业炉报价' },
  { path: '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin', topic: '老旧热处理炉' },
  { path: '/zh/solutions/continuous-heat-treatment-line', topic: '连续热处理生产线' },
  { path: '/zh/solutions/jiangsu-gongye-lu-changjia', topic: '江苏工业炉厂家' },
  { path: '/zh/solutions/rechuli-lu-changjia', topic: '热处理炉厂家' },
  { path: '/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi', topic: '改造风险与停产安排' },
  { path: '/zh/solutions/rechuli-lu-kongzhi-xitong-shengji', topic: '控制系统升级' },
  { path: '/zh/solutions/rechuli-lu-dian-gai-ran-yure-huishou', topic: '能源切换与余热利用' },
  { path: '/zh/solutions/rechuli-lu-luchen-fanxin', topic: '炉衬损坏与翻新' },
  { path: '/zh/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan', topic: '停产与搬迁复产' },
  { path: '/zh/solutions/rechuli-lu-wendu-bujun-zhenggai', topic: '温度不均整改' },
].map(Object.freeze));

const EXPECTED_PHONE = '13052986814';
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;
const VOID_TAGS = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const NON_BODY_TAGS = new Set(['script', 'style', 'template', 'noscript', 'svg', 'nav', 'header', 'footer']);

function decodeEntities(value) {
  const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (whole, entity) => {
    if (entity[0] !== '#') return named[entity.toLowerCase()] ?? whole;
    const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
  });
}

// Small structural reader for server HTML, not a JavaScript evaluator. In
// particular, strings in React's serialized payload are never page content.
function readHtml(html) {
  const root = { tag: '#document', attrs: {}, children: [] };
  const stack = [root];
  const tokens = /<!--[\s\S]*?-->|<![^>]*>|<\/?[a-zA-Z](?:[^"'<>]|"[^"]*"|'[^']*')*>|[^<]+|</g;
  for (const token of html.match(tokens) ?? []) {
    const parent = stack.at(-1);
    if (['script', 'style'].includes(parent.tag) && !new RegExp(`^</${parent.tag}\\s*>$`, 'i').test(token)) {
      parent.children.push({ tag: '#text', value: token, parent });
      continue;
    }
    if (token.startsWith('<!--')) {
      parent.children.push({ tag: '#comment', value: token.slice(4, -3), parent });
    } else if (token.startsWith('</')) {
      const tag = token.match(/^<\/\s*([^\s>]+)/)?.[1].toLowerCase();
      const position = stack.findLastIndex((node) => node.tag === tag);
      if (position > 0) stack.length = position;
    } else if (/^<[a-zA-Z]/.test(token)) {
      const tag = token.match(/^<([^\s/>]+)/)[1].toLowerCase();
      const attrs = {};
      const attributes = token.slice(tag.length + 1, -1);
      for (const match of attributes.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
        attrs[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '');
      }
      const node = { tag, attrs, children: [], parent };
      parent.children.push(node);
      if (!VOID_TAGS.has(tag) && !token.endsWith('/>')) stack.push(node);
    } else if (!token.startsWith('<!')) {
      parent.children.push({ tag: '#text', value: decodeEntities(token), parent });
    }
  }
  return root;
}

function descendants(node, predicate) {
  const found = [];
  function visit(current) {
    if (predicate(current)) found.push(current);
    for (const child of current.children ?? []) visit(child);
  }
  visit(node);
  return found;
}

function hidden(node) {
  for (let current = node; current; current = current.parent) {
    const attrs = current.attrs ?? {};
    if ('hidden' in attrs || attrs['aria-hidden'] === 'true' || /(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*hidden)\b/i.test(attrs.style ?? '')) return true;
    if ((attrs.class ?? '').split(/\s+/).some((token) => ['hidden', 'invisible'].includes(token))) return true;
  }
  return false;
}

function textContent(node, excludeNavigation = false) {
  if (hidden(node) || (excludeNavigation && NON_BODY_TAGS.has(node.tag)) || ['script', 'style', 'template', 'noscript', 'svg'].includes(node.tag)) return '';
  if (node.tag === '#text') return node.value;
  return (node.children ?? []).map((child) => textContent(child, excludeNavigation)).join('');
}

// React puts resolved Suspense HTML in a hidden S:* container, then replaces
// the B:* fallback. Recognize only literal completed $RC boundary instructions;
// never eval arbitrary response scripts or count an unresolved hidden segment.
function completeStreamedBoundaries(root) {
  const scripts = descendants(root, (node) => node.tag === 'script');
  for (const script of scripts) {
    const source = (script.children ?? []).filter((node) => node.tag === '#text').map((node) => node.value).join('');
    for (const match of source.matchAll(/\$RC\(\s*"(B:[\w-]+)"\s*,\s*"(S:[\w-]+)"\s*\)/g)) {
      const boundary = descendants(root, (node) => node.tag === 'template' && node.attrs.id === match[1])[0];
      const segment = descendants(root, (node) => node.tag === 'div' && node.attrs.id === match[2] && 'hidden' in node.attrs)[0];
      if (!boundary || !segment) continue;
      const siblings = boundary.parent.children;
      const position = siblings.indexOf(boundary);
      let depth = 0;
      let end = -1;
      for (let index = position + 1; index < siblings.length; index++) {
        if (siblings[index].tag !== '#comment') continue;
        const value = siblings[index].value.trim();
        if (['$', '$?', '$!'].includes(value)) depth++;
        if (value === '/$') {
          if (depth === 0) { end = index; break; }
          depth--;
        }
      }
      if (end < 0) continue;
      for (const child of segment.children) child.parent = boundary.parent;
      siblings.splice(position, end - position, ...segment.children);
      segment.parent.children.splice(segment.parent.children.indexOf(segment), 1);
    }
  }
}

function check(passed, detail) { return { passed: Boolean(passed), detail }; }

export function inspectProcurementHtml(html, page, headers = {}) {
  const root = readHtml(html);
  completeStreamedBoundaries(root);
  const metas = descendants(root, (node) => node.tag === 'meta');
  const blocked = metas.filter((node) => /^(robots|.*bot|.*spider)$/i.test(node.attrs.name ?? '') && /\b(noindex|none)\b/i.test(node.attrs.content ?? ''));
  const headerBlock = /\b(noindex|none)\b/i.test(headers['x-robots-tag'] ?? '');
  const canonicals = descendants(root, (node) => node.tag === 'link' && (node.attrs.rel ?? '').toLowerCase().split(/\s+/).includes('canonical')).map((node) => node.attrs.href);
  const expectedCanonical = CANONICAL_ORIGIN + page.path;
  const mains = descendants(root, (node) => node.tag === 'main' && !hidden(node));
  const headings = [...new Set(mains.flatMap((main) => descendants(main, (node) => node.tag === 'h1' && !hidden(node))))];
  const h1Texts = headings.map((node) => textContent(node).replace(/\s+/g, '').trim()).filter(Boolean);
  const main = mains[0];
  const bodyText = main ? textContent(main, true).replace(/\s+/g, '').trim() : '';
  const contentPassed = h1Texts.length === 1 && h1Texts[0].includes(page.topic) && bodyText.length >= 300;
  const toolbars = descendants(root, (node) => node.attrs && 'data-contact-toolbar' in node.attrs && !hidden(node));
  const contactPassed = toolbars.some((toolbar) => {
    const actions = descendants(toolbar, (node) => !hidden(node));
    const phone = actions.some((node) => node.tag === 'a' && /^tel:/i.test(node.attrs.href ?? '') && (node.attrs.href ?? '').replace(/\D/g, '').replace(/^86/, '') === EXPECTED_PHONE && /电话|拨打|联系|call/i.test(textContent(node) + (node.attrs['aria-label'] ?? '')));
    const wechat = actions.some((node) => node.tag === 'button' && node.attrs['aria-haspopup'] === 'dialog' && !('disabled' in node.attrs) && /微信|wechat/i.test(textContent(node) + (node.attrs['aria-label'] ?? '')));
    return phone && wechat;
  });
  return {
    checks: {
      indexable: check(!blocked.length && !headerBlock, blocked.length || headerBlock ? '存在禁止索引指令' : '未发现禁止索引指令'),
      canonical: check(canonicals.length === 1 && canonicals[0] === expectedCanonical, `预期 ${expectedCanonical}；实际 ${canonicals.join(', ') || '缺失'}`),
      content: check(contentPassed, `主标题 ${h1Texts.join(' / ') || '缺失'}；正文 ${bodyText.length} 字；预期主题 ${page.topic}`),
      contactToolbar: check(contactPassed, '同一个非隐藏联系条需包含批准号码的电话链接，以及带微信名称的弹窗按钮'),
    },
    h1: h1Texts,
    bodyCharacters: bodyText.length,
  };
}

function validateBaseUrl(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('--base-url 必须是无账号、无路径的 http(s) 站点地址');
  return url.origin;
}

async function getResponse(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { method: 'GET', redirect: 'manual', signal: controller.signal, headers: { Accept: 'text/html, application/xml;q=0.9', 'User-Agent': 'SunengAcquisitionContinuityCheck/1.0' } });
    let size = 0;
    const chunks = [];
    for await (const chunk of response.body ?? []) {
      size += chunk.length;
      if (size > MAX_RESPONSE_BYTES) { controller.abort(); throw new Error('响应超过 5 MiB 上限'); }
      chunks.push(chunk);
    }
    return { status: response.status, finalUrl: response.url, headers: Object.fromEntries(response.headers), body: Buffer.concat(chunks).toString('utf8') };
  } catch (error) {
    return { status: null, finalUrl: url, headers: {}, body: '', error: controller.signal.aborted ? `请求超时或超过响应上限（${timeoutMs} 毫秒）` : error.message };
  } finally { clearTimeout(timer); }
}

async function readSitemap(baseUrl, timeoutMs) {
  const pending = [`${baseUrl}/sitemap.xml`];
  const seen = new Set();
  const urls = new Set();
  const errors = [];
  while (pending.length && seen.size < 12) {
    const url = pending.shift();
    if (seen.has(url)) continue;
    seen.add(url);
    const response = await getResponse(url, timeoutMs);
    if (response.status !== 200 || response.error) { errors.push(`${url}：${response.error ?? `HTTP ${response.status}`}`); continue; }
    const xml = response.body.replace(/<!--[\s\S]*?-->/g, '');
    const isIndex = /<sitemapindex(?:\s|>)/i.test(xml) && /<\/sitemapindex\s*>/i.test(xml);
    const isUrlset = /<urlset(?:\s|>)/i.test(xml) && /<\/urlset\s*>/i.test(xml);
    const locs = [...xml.matchAll(/<loc(?:\s[^>]*)?>([\s\S]*?)<\/loc\s*>/gi)].map((match) => decodeEntities(match[1].trim()));
    if (!locs.length || (!isIndex && !isUrlset)) { errors.push(`${url}：没有可读取的网址地图`); continue; }
    for (const loc of locs) {
      if (!isIndex) { urls.add(loc); continue; }
      let child;
      try { child = new URL(loc); } catch { errors.push('地图子地址无效'); continue; }
      // A preview's sitemap index may still name the production host. Read the
      // equivalent local path, never follow it onto production implicitly.
      if (![baseUrl, CANONICAL_ORIGIN].includes(child.origin) || child.username || child.password || child.hash || child.search) { errors.push('地图子地址超出本站范围'); continue; }
      pending.push(baseUrl + child.pathname);
    }
  }
  if (pending.length) errors.push('地图子文件超过 12 个检查上限');
  return { passed: errors.length === 0, errors, filesChecked: seen.size, urls };
}

export async function checkAcquisitionContinuity({ baseUrl = 'http://localhost:3000', timeoutMs = 10000 } = {}) {
  baseUrl = validateBaseUrl(baseUrl);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 10 || timeoutMs > 60000) throw new Error('超时须为 10–60000 毫秒的整数');
  const pages = [];
  // Bounded batches: all 11 protected pages are checked, even after a failure.
  for (let start = 0; start < PROCUREMENT_PAGES.length; start += 3) {
    pages.push(...await Promise.all(PROCUREMENT_PAGES.slice(start, start + 3).map(async (page) => {
      const requestedUrl = baseUrl + page.path;
      const response = await getResponse(requestedUrl, timeoutMs);
      const inspected = inspectProcurementHtml(response.body, page, response.headers);
      const checks = { http: check(response.status === 200 && response.finalUrl === requestedUrl && !response.error && /\btext\/html\b/i.test(response.headers['content-type'] ?? ''), response.error ?? `HTTP ${response.status}；最终地址 ${response.finalUrl}`), ...inspected.checks };
      return { path: page.path, topic: page.topic, status: response.status, finalUrl: response.finalUrl, checks, h1: inspected.h1, bodyCharacters: inspected.bodyCharacters };
    })));
  }
  const sitemap = await readSitemap(baseUrl, timeoutMs);
  for (const page of pages) {
    page.checks.sitemap = check(sitemap.passed && sitemap.urls.has(CANONICAL_ORIGIN + page.path), sitemap.errors.length ? sitemap.errors.join('；') : '网址地图应包含本页的正式规范地址');
    page.passed = Object.values(page.checks).every((item) => item.passed);
  }
  return {
    kind: 'acquisition-continuity-report', version: 1, checkedAt: new Date().toISOString(), baseUrl, canonicalOrigin: CANONICAL_ORIGIN,
    passed: pages.every((page) => page.passed), pagesChecked: pages.length, failedPages: pages.filter((page) => !page.passed).length,
    scope: '仅检查已确认公开的 11 个中文采购入口的基础连续性；只读 GET，不提交询盘、通知或搜索收录。',
    limitations: ['未执行浏览器脚本；仅识别已完成的 React 流式边界，不验证视觉可见性、点击、弹窗号码/账号或二维码加载。', '检查通过不证明排名、AI 推荐、电话接听、微信添加或真实客户咨询恢复。', '独立检查命令，尚未接入部署流水线；未开放撤回案例或未批准英文页。'],
    sitemap: { passed: sitemap.passed, filesChecked: sitemap.filesChecked, urlsRead: sitemap.urls.size, errors: sitemap.errors }, pages,
  };
}

export async function run(argv, writeOutput = console.log) {
  const options = {};
  let reportPath;
  let jsonOutput = false;
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--help') {
      writeOutput('npm run acquisition:check -- [--base-url http://localhost:3000] [--timeout-ms 10000] [--json] [--report 新报告.json]\n默认只检查 localhost:3000；只有显式 --base-url 才选择其他站点。仅 GET，不提交询盘、不发布。规范地址固定为正式官网地址。报告文件必须尚不存在。');
      return 0;
    }
    if (arg === '--json') { jsonOutput = true; continue; }
    if (!['--base-url', '--timeout-ms', '--report'].includes(arg)) throw new Error(`未知参数：${arg}`);
    const value = argv[++index];
    if (!value || value.startsWith('--')) throw new Error(`${arg} 缺少值`);
    if (arg === '--base-url') options.baseUrl = value;
    if (arg === '--timeout-ms') options.timeoutMs = Number(value);
    if (arg === '--report') reportPath = path.resolve(value);
  }
  // Check report destination before making even read-only requests. Never
  // overwrite a prior receipt or source file through an accidental CLI path.
  if (reportPath) {
    if (reportPath.split(path.sep).some((part) => ['src', 'public', '.git', 'content'].includes(part))) throw new Error('报告不得写入网站内容或代码目录');
    try { await fs.access(reportPath); throw new Error('报告文件已存在，请使用新的报告路径'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  const report = await checkAcquisitionContinuity(options);
  if (reportPath) {
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  }
  if (jsonOutput) writeOutput(JSON.stringify(report, null, 2));
  else {
    writeOutput(`${report.passed ? '可以通过' : '存在问题'}：已检查 ${report.pagesChecked} 个采购入口，${report.failedPages} 页失败。`);
    for (const page of report.pages.filter((item) => !item.passed)) writeOutput(`${page.path}：${Object.entries(page.checks).filter(([, item]) => !item.passed).map(([name, item]) => `${name} ${item.detail}`).join('；')}`);
    writeOutput(report.limitations.join('\n'));
  }
  return report.passed ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = await run(process.argv.slice(2)); }
  catch (error) { console.error(JSON.stringify({ passed: false, error: error.message })); process.exitCode = 2; }
}
