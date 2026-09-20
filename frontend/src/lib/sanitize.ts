import { isWithdrawnTechnicalPath } from './publication-scope';
import DOMPurify from 'isomorphic-dompurify';
import { newsImageNoteReplacements } from './news-image-notes';
import { marked } from 'marked';
import { repairNewsPresentation } from './news-presentation-repairs';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Sanitize admin-authored rich text before it is rendered via
 * dangerouslySetInnerHTML (NewsArticleContent). Plain text (no markup) is
 * paragraph-wrapped with full escaping; HTML goes through DOMPurify's
 * audited allow-list, which strips scripts, event handlers and
 * javascript:/data: URLs while preserving normal formatting markup.
 *
 * Uses isomorphic-dompurify so it works both in the browser and during
 * Next.js server rendering (the news detail page is a server component).
 */
export function sanitizeRichTextHtml(value?: string | null) {
  if (!value) return '';

  const hasHtmlTag = /<\/?[a-z][\s\S]*>/i.test(value);

  if (!hasHtmlTag) {
    const paragraphs = value
      .split(/\n{2,}/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => `<p>${escapeHtml(item).replace(/\n/g, '<br />')}</p>`);

    return paragraphs.join('');
  }

  return DOMPurify.sanitize(value);
}

type PrepareNewsArticleHtmlOptions = {
  stackSimpleTables?: boolean;
  coverImage?: string | null;
  articleSlug?: string;
  locale?: string;
};

const DOUBLE_BREAK_PATTERN = /(?:<br\s*\/?>\s*){2,}/i;
const BLOCK_TAGS = new Set(['ARTICLE', 'BLOCKQUOTE', 'DIV', 'OL', 'SECTION', 'TABLE', 'UL']);

function canonicalAssetPath(value?: string | null) {
  const source = value?.trim();
  if (!source) return '';

  try {
    return decodeURIComponent(new URL(source, 'https://suneng.invalid').pathname);
  } catch {
    return source.split(/[?#]/, 1)[0];
  }
}

function getNewsHeadingTag(text: string) {
  if (!text || text.length > 32) return null;

  if (/^(为什么|苏能四包|合同附件|第一次沟通|信息来源|投标|验收|结语|建议)/.test(text)) {
    return 'h2';
  }

  if (/^第[一二三四五六七八九十]+(?:包|清|件|步|部分)/.test(text)) {
    return 'h3';
  }

  if (/^(备件包|资料包|服务包|培训包|质保起算|控制权限|故障闭环)$/.test(text)) {
    return 'h4';
  }

  return null;
}

function hasDirectDoubleBreak(element: Element) {
  let breakCount = 0;

  for (const node of Array.from(element.childNodes)) {
    if (node.nodeName === 'BR') {
      breakCount += 1;
      if (breakCount >= 2) return true;
      continue;
    }

    if (node.nodeType === node.TEXT_NODE && !node.textContent?.trim()) continue;
    breakCount = 0;
  }

  return false;
}

function appendRichPart(fragment: DocumentFragment, document: Document, html: string) {
  const probe = document.createElement('div');
  probe.innerHTML = html;
  const text = probe.textContent?.trim() || '';
  if (!text) return;

  const leadingLine = html.match(/^([^<]+)<br\s*\/?>\s*([\s\S]+)$/i);
  const leadingHeading = leadingLine?.[1]?.trim() || '';
  const leadingHeadingTag = getNewsHeadingTag(leadingHeading);

  if (leadingLine && leadingHeadingTag) {
    const heading = document.createElement(leadingHeadingTag);
    heading.textContent = leadingHeading;
    fragment.append(heading);
    appendRichPart(fragment, document, leadingLine[2]);
    return;
  }

  const headingTag = getNewsHeadingTag(text);
  if (headingTag) {
    const heading = document.createElement(headingTag);
    heading.innerHTML = html;
    fragment.append(heading);
    return;
  }

  const meaningfulNodes = Array.from(probe.childNodes).filter(
    (node) => node.nodeType !== node.TEXT_NODE || Boolean(node.textContent?.trim()),
  );
  const containsOnlyBlocks =
    meaningfulNodes.length > 0 &&
    meaningfulNodes.every(
      (node) => node.nodeType === node.ELEMENT_NODE && BLOCK_TAGS.has((node as Element).tagName),
    );

  if (containsOnlyBlocks) {
    meaningfulNodes.forEach((node) => fragment.append(node));
    return;
  }

  const paragraph = document.createElement('p');
  paragraph.innerHTML = html;
  fragment.append(paragraph);
}

/**
 * Prepares sanitized article HTML for the public detail layout without
 * rewriting article copy. It removes a body image only when it matches the
 * separately rendered cover and promotes existing short break-delimited
 * labels into headings for a readable document structure.
 */
export function prepareNewsArticleHtml(
  value?: string | null,
  options: PrepareNewsArticleHtmlOptions = {},
) {
  const source = value || '';
  const hasMarkdownHeading = /(^|\n)\s*#{1,6}[ \t]+\S/.test(source);
  const hasHtml = /<\/?[a-z][^>]*>/i.test(source);
  const sanitized =
    hasMarkdownHeading && !hasHtml
      ? DOMPurify.sanitize(marked.parse(source, { async: false, breaks: true }))
      : sanitizeRichTextHtml(source);
  if (!sanitized) return '';

  const root = DOMPurify.sanitize(sanitized, { RETURN_DOM: true }) as HTMLElement;
  const document = root.ownerDocument;
  if (!document) return sanitized;
  for (const link of root.querySelectorAll('a[href]')) {
    if (isWithdrawnTechnicalPath(link.getAttribute('href') ?? '')) link.replaceWith(...Array.from(link.childNodes));
  }
  const coverPath = canonicalAssetPath(options.coverImage);

  // Remove only reviewed editorial image notes, keeping media and technical conditions.
  for (const block of root.querySelectorAll('p, figcaption')) {
    const text = block.textContent?.trim() ?? '';
    if (!Object.prototype.hasOwnProperty.call(newsImageNoteReplacements, text)) continue;
    const replacement = newsImageNoteReplacements[text];
    const images = Array.from(block.querySelectorAll('img'));
    if (images.length) block.replaceWith(...images, document.createTextNode(replacement));
    else if (replacement) block.textContent = replacement;
    else block.remove();
  }

  if (coverPath) {
    const duplicateCover = Array.from(root.querySelectorAll('img')).find(
      (image) => canonicalAssetPath(image.getAttribute('src')) === coverPath,
    );

    if (duplicateCover) {
      const wrapper = duplicateCover.parentElement;
      const wrapperOnlyContainsImage =
        wrapper &&
        wrapper !== root &&
        !wrapper.textContent?.trim() &&
        wrapper.children.length === 1 &&
        wrapper.firstElementChild === duplicateCover;

      if (wrapperOnlyContainsImage) wrapper.remove();
      else duplicateCover.remove();
    }
  }

  Array.from(root.querySelectorAll('div'))
    .filter(hasDirectDoubleBreak)
    .forEach((container) => {
      const parts = container.innerHTML
        .split(DOUBLE_BREAK_PATTERN)
        .map((part) => part.trim())
        .filter(Boolean);

      if (parts.length < 2) return;

      const fragment = document.createDocumentFragment();
      parts.forEach((part) => appendRichPart(fragment, document, part));
      container.replaceWith(fragment);
    });

  // Older editor imports also store Markdown inside individual HTML paragraphs.
  // Keep existing rich text intact and only convert blocks with explicit headings.
  Array.from(root.querySelectorAll('p, div')).forEach((block) => {
    if (block.querySelector('p, div, pre, code, table, ul, ol, h1, h2, h3, h4, h5, h6')) return;
    const markdown = block.innerHTML.replace(/<br\s*\/?>/gi, '\n');
    if (!/(^|\n)\s*#{1,6}[ \t]+\S/.test(markdown)) return;
    const replacement = document.createElement('template');
    replacement.innerHTML = DOMPurify.sanitize(
      marked.parse(markdown, { async: false, breaks: true }),
    );
    block.replaceWith(replacement.content);
  });
  // Some editor exports put a heading text node beside a nested list, rather
  // than in its own paragraph. Promote that node without flattening the list.
  for (const container of [
    root,
    ...Array.from(root.querySelectorAll('div, p, section, article')),
  ]) {
    if (container.closest('pre, code')) continue;
    for (const node of Array.from(container.childNodes)) {
      if (node.nodeType !== node.TEXT_NODE) continue;
      const heading = node.textContent?.trim().match(/^(#{1,6})[ \t]+([^\r\n]+)$/);
      if (!heading) continue;
      const replacement = document.createElement(`h${Math.max(2, heading[1].length)}`);
      replacement.textContent = heading[2].trim();
      const next = node.nextSibling;
      node.replaceWith(replacement);
      if (next?.nodeName === 'BR') next.remove();
    }
  }
  // English comparison tables reuse the existing labelled mobile-card layout.
  // Only simple rectangular tables can be represented without losing relationships.
  if (options.stackSimpleTables) {
    root.querySelectorAll('table').forEach((table) => {
      if (table.querySelector('[rowspan], [colspan], table')) return;
      const headers = Array.from(table.querySelectorAll('thead th')).map(
        (cell) => cell.textContent?.trim() || '',
      );
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      if (
        !headers.length ||
        headers.some((label) => !label) ||
        !rows.length ||
        rows.some(
          (row) =>
            row.children.length !== headers.length ||
            Array.from(row.children).some((cell) => cell.tagName !== 'TD'),
        )
      )
        return;
      table.classList.add('furnace-decision-table');
      rows.forEach((row) =>
        Array.from(row.children).forEach((cell, index) =>
          cell.setAttribute('data-label', headers[index]),
        ),
      );
    });
  }
  // The detail layout owns the only page-level heading.
  root.querySelectorAll('h1').forEach((heading) => {
    const replacement = document.createElement('h2');
    replacement.innerHTML = heading.innerHTML;
    heading.replaceWith(replacement);
  });

  repairNewsPresentation(root, options.articleSlug, options.locale);
  return DOMPurify.sanitize(root.innerHTML);
}

export function richTextToPlainText(value?: string | null) {
  if (!value) return '';

  // Plain text has no tags or entities to parse. Keep rich/encoded text on the
  // sanitizer path, including null characters that HTML parsing normalizes.
  if (!/[<&\u0000]/.test(value)) return value.replace(/\s+/g, ' ').trim();

  const spacedValue = value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(?:article|blockquote|div|h[1-6]|li|ol|p|section|td|th|tr|ul)>/gi, ' ');
  const sanitizedBody = DOMPurify.sanitize(spacedValue, { RETURN_DOM: true });

  return (sanitizedBody.textContent || '').replace(/\s+/g, ' ').trim();
}
