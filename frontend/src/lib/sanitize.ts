import DOMPurify from 'isomorphic-dompurify';

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
