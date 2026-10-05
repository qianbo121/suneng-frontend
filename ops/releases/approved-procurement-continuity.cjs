// A separate scope; the existing eleven-guide checker remains unchanged.
const { createHash } = require('node:crypto');
const CANONICAL_ORIGIN = 'https://www.jssngyl.cn';
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


function contentFingerprint(container) {
  const stream = [];
  function visit(node) {
    if (node.tag === '#comment') return;
    if (hidden(node)) throw new Error('Hidden approved body');
    if (node.tag === '#text') {
      const value = node.value.replace(/\s+/g, '');
      if (value) stream.push(['text', value]);
      return;
    }
    if (!['p', 'h2', 'a', 'section'].includes(node.tag)) throw new Error('Unexpected approved body structure');
    const attrs = {};
    for (const key of ['id', 'href']) if (key in node.attrs && (key !== 'id' || node.tag !== 'h2')) attrs[key] = node.attrs[key];
    stream.push(['open', node.tag, attrs]);
    node.children.forEach(visit);
    stream.push(['close', node.tag]);
  }
  container.children.forEach(visit);
  return createHash('sha256').update(JSON.stringify(stream)).digest('hex');
}

function inspectApprovedPage(html, page, headers) {
  const root = readHtml(html);
  completeStreamedBoundaries(root);
  const all = (predicate) => descendants(root, predicate);
  const canonical = all(n => n.tag === 'link' && (n.attrs.rel ?? '').split(/\s+/).includes('canonical'));
  const headings = all(n => n.tag === 'h1' && !hidden(n));
  const bodies = all(n => n.attrs?.id === page.bodyId && !hidden(n));
  const children = bodies.length === 1 ? bodies[0].children.filter(n => n.tag !== '#comment' && (n.tag !== '#text' || n.value.trim())) : [];
  let contentStreamSha256 = null;
  try {
    if (children.length === 1 && children[0].tag === 'div') contentStreamSha256 = contentFingerprint(children[0]);
  } catch { /* A malformed or hidden body stays a failed check. */ }
  const blocked = all(n => n.tag === 'meta' && /^(robots|.*bot|.*spider)$/i.test(n.attrs.name ?? '') && /\b(noindex|none)\b/i.test(n.attrs.content ?? ''));
  const toolbars = all(n => n.attrs && 'data-contact-toolbar' in n.attrs && !hidden(n));
  const visiblePhone = textContent(root).replace(/\D/g, '').includes(EXPECTED_PHONE);
  const enabled = n => !hidden(n) && !('disabled' in (n.attrs ?? {})) && n.attrs?.['aria-disabled'] !== 'true'
    && !(n.attrs?.class ?? '').split(/\s+/).includes('pointer-events-none');
  const contact = visiblePhone && toolbars.some(toolbar => {
    const actions = descendants(toolbar, enabled);
    const phone = actions.some(n => n.tag === 'a' && /^tel:/i.test(n.attrs.href ?? '')
      && (n.attrs.href ?? '').replace(/\D/g, '').replace(/^86/, '') === EXPECTED_PHONE
      && /电话|拨打|call/i.test(textContent(n) + (n.attrs['aria-label'] ?? '')));
    const wechat = actions.some(n => n.tag === 'button' && n.attrs['aria-haspopup'] === 'dialog'
      && /微信|wechat/i.test(textContent(n) + (n.attrs['aria-label'] ?? '')));
    return phone && wechat;
  });
  const checks = {
    canonical: canonical.length === 1 && canonical[0].attrs.href === CANONICAL_ORIGIN + page.path,
    h1: headings.length === 1 && textContent(headings[0]).trim() === page.h1,
    indexable: !blocked.length && !/\b(noindex|none)\b/i.test(headers['x-robots-tag'] ?? ''),
    body: contentStreamSha256 === page.contentStreamSha256,
    anchors: page.anchors.every(id => {
      const matches = all(n => n.attrs?.id === id);
      return matches.length === 1 && !hidden(matches[0]) && bodies.length === 1 && descendants(bodies[0], n => n === matches[0]).length === 1;
    }),
    contactToolbar: contact,
  };
  return {contentStreamSha256, checks};
}

async function checkApprovedProcurement({baseUrl, pages}) {
  const parsed = new URL(baseUrl);
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) throw new Error('Invalid approved check origin');
  const exact = ['/zh/articles/special-industrial-furnace-procurement-assessment', '/zh/service/industrial-furnace-parts-purchasing'];
  if (!Array.isArray(pages) || new Set(pages.map(p => p.path)).size !== pages.length || pages.some(p => !exact.includes(p.path))) throw new Error('Unapproved procurement scope');
  const sitemap = pages.length ? await getResponse(baseUrl + '/sitemap.xml', 20000) : null;
  const xml = (sitemap?.body ?? '').replace(/<!--[\s\S]*?-->/g, '');
  const listed = new Set([...xml.matchAll(/<loc(?:\s[^>]*)?>([\s\S]*?)<\/loc\s*>/gi)].map(m => decodeEntities(m[1].trim())));
  const rows = [];
  for (const page of pages) {
    const response = await getResponse(baseUrl + page.path, 20000);
    const inspected = inspectApprovedPage(response.body, page, response.headers);
    const entry = await getResponse(baseUrl + page.entryPath, 20000);
    const entryRoot = readHtml(entry.body); completeStreamedBoundaries(entryRoot);
    const checks = {
      http: response.status === 200 && response.finalUrl === baseUrl + page.path && !response.error && /\btext\/html\b/i.test(response.headers['content-type'] ?? ''),
      ...inspected.checks,
      sitemap: sitemap?.status === 200 && !sitemap.error && /<urlset(?:\s|>)/i.test(xml) && /<\/urlset\s*>/i.test(xml) && listed.has(CANONICAL_ORIGIN + page.path),
      entry: entry.status === 200 && !entry.error && descendants(entryRoot, n => n.tag === 'a' && !hidden(n) && n.attrs.href === page.path).length > 0,
    };
    const flags = Object.fromEntries(Object.entries(checks).map(([key, passed]) => [key, {passed: Boolean(passed)}]));
    rows.push({path: page.path, status: response.status, contentStreamSha256: inspected.contentStreamSha256, checks: flags, passed: Object.values(flags).every(c => c.passed)});
  }
  return {kind: 'approved-procurement-continuity', baseUrl, canonicalOrigin: CANONICAL_ORIGIN, pagesChecked: rows.length, passed: rows.every(p => p.passed), pages: rows, formsOrContactEvents: false};
}
module.exports = {checkApprovedProcurement, inspectApprovedPage};
