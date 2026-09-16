import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';

const internalSourceHeadings = new Set([
  '资料来源与沟通',
  '资料来源与继续了解',
  '资料来源',
  'sources and project discussion',
  'sources and enquiries',
  'sources and contact',
  'sources and further reading',
  'sources',
]);

/** All case Markdown is rendered on the server and sanitized before entering HTML. */
export function prepareCaseBody(markdown: string, locale: 'zh' | 'en' = 'zh') {
  const root = DOMPurify.sanitize(marked.parse(markdown, { async: false, gfm: true }), {
    RETURN_DOM: true,
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button', 'video', 'audio'],
    FORBID_ATTR: ['style'],
  }) as HTMLElement;
  const used = new Set<string>();
  for (const h1 of root.querySelectorAll('h1')) {
    const h2 = root.ownerDocument.createElement('h2');
    h2.innerHTML = h1.innerHTML;
    h1.replaceWith(h2);
  }
  // Keep the source records in Markdown, but omit this internal section from
  // public HTML, navigation and search in both languages.
  for (const heading of root.querySelectorAll('h2')) {
    if (!internalSourceHeadings.has(heading.textContent?.trim().toLowerCase() ?? '')) continue;
    let sibling = heading.nextElementSibling;
    while (sibling && sibling.tagName !== 'H2') {
      const next = sibling.nextElementSibling;
      sibling.remove();
      sibling = next;
    }
    heading.remove();
  }
  const toc = Array.from(root.querySelectorAll('h2')).map((heading) => {
    const title = heading.textContent?.trim() || '正文';
    const base =
      (heading.id || title)
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[^\p{L}\p{N}_-]+/gu, '-')
        .replace(/^-|-$/g, '') || 'section';
    let id = base;
    let suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id);
    heading.id = id;
    return { id, title };
  });
  root.querySelectorAll('table').forEach((table) => {
    const wrapper = root.ownerDocument.createElement('div');
    wrapper.className = 'case-table-scroll';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', locale === 'en' ? 'Project parameters; scroll horizontally' : '项目参数表，可横向滚动');
    table.replaceWith(wrapper);
    wrapper.appendChild(table);
    table.querySelectorAll('thead th').forEach((cell) => cell.setAttribute('scope', 'col'));
  });
  root.querySelectorAll('a').forEach((link) => {
    const href = link.getAttribute('href') ?? '';
    if (!/^(\/[^/]|#|https?:\/\/|tel:|mailto:)/i.test(href)) link.removeAttribute('href');
    if (link.target === '_blank') link.rel = 'noopener noreferrer';
  });
  root.querySelectorAll('img').forEach((img) => {
    if (!/^\/images\//.test(img.getAttribute('src') ?? '')) img.remove();
    else {
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
    }
  });
  return { html: root.innerHTML, toc, plainText: root.textContent ?? '' };
}
