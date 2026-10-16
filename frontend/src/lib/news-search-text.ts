import { richTextToPlainText } from './sanitize';

// Search strings are never HTML. Common article markup needs no DOM tree just
// to discard its tags. Complex/malformed HTML stays on the existing sanitizer.
// Table text outside cells can be reordered by HTML parsing; retain that fallback.
const textTags = new Set([
  'p', 'div', 'br', 'span', 'a', 'strong', 'b', 'em', 'i', 'u', 's',
  'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
  'section', 'article', 'img', 'figure', 'figcaption', 'hr', 'pre', 'code',
  'small', 'sub', 'sup', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption',
]);
const spacedTag = /^(?:<br\s*\/?>|<\/(?:article|blockquote|div|h[1-6]|li|ol|p|section|td|th|tr|ul)>)$/i;

export function newsSearchText(value?: string | null) {
  if (!value || !value.includes('<')) return richTextToPlainText(value);
  const tags = /<\/?([a-z][a-z0-9-]*)(?:\s+(?:[^\'"<>]|"[^"]*"|'[^']*')*)?\s*\/?>/gi;
  const parts: string[] = [];
  let offset = 0;
  const tables: string[] = [];
  let cellDepth = 0;
  for (const match of value.matchAll(tags)) {
    const text = value.slice(offset, match.index);
    const tag = match[1].toLowerCase();
    const closing = match[0].startsWith('</');
    if (text.includes('<') || !textTags.has(tag) || /&[#a-z0-9]*$/i.test(text)) return richTextToPlainText(value);
    if (tables.length && !cellDepth && text.trim()) return richTextToPlainText(value);
    if (['table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption'].includes(tag)) {
      if (closing) {
        if (tables.pop() !== tag) return richTextToPlainText(value);
        if (['td', 'th', 'caption'].includes(tag)) cellDepth -= 1;
      } else {
        tables.push(tag);
        if (['td', 'th', 'caption'].includes(tag)) cellDepth += 1;
      }
    }
    parts.push(text);
    if (spacedTag.test(match[0])) parts.push(' ');
    offset = match.index! + match[0].length;
  }
  const tail = value.slice(offset);
  if (tables.length || tail.includes('<')) return richTextToPlainText(value);
  parts.push(tail);
  // Decode entities with the existing parser. The result remains plain text;
  // rich article rendering and its HTML sanitization are unchanged.
  return richTextToPlainText(parts.join(''));
}
