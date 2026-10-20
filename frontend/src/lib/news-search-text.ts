import { richTextToPlainText } from './sanitize';

// Search strings are never HTML. Common article markup needs no DOM tree just
// to discard its tags. Complex/malformed HTML stays on the existing sanitizer.
// Table text outside cells and leading newlines in pre need HTML parsing.
const textTags = new Set([
  'p', 'div', 'br', 'span', 'a', 'strong', 'b', 'em', 'i', 'u', 's',
  'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
  'section', 'article', 'img', 'figure', 'figcaption', 'hr', 'code',
  'small', 'sub', 'sup', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption',
]);
const spacedTag = /^(?:<br\s*\/?>|<\/(?:article|blockquote|div|h[1-6]|li|ol|p|section|td|th|tr|ul)>)$/i;

// Validate attribute boundaries separately so malformed names such as ="="
// stay on the HTML parser. Sticky tokens avoid scanning overlapping suffixes.
function hasSimpleAttributes(source: string, nameLength: number, closing: boolean) {
  const attribute = /\s+[^\s"'<>/=`]+(?:\s*=\s*(?:"[^"<>]*"|'[^'<>]*'|[^\s"'=<>`]+))?/y;
  const end = /\s*\/?>/y;
  let offset = nameLength + (closing ? 2 : 1);
  while (offset < source.length) {
    end.lastIndex = offset;
    if (end.exec(source)?.[0] && end.lastIndex === source.length) return true;
    if (closing) return false;
    attribute.lastIndex = offset;
    if (!attribute.exec(source)) return false;
    offset = attribute.lastIndex;
  }
  return false;
}

export function newsSearchText(value?: string | null) {
  if (!value || !value.includes('<')) return richTextToPlainText(value);
  // Keep whitespace in one token and match only at the next opening bracket.
  // Failed tags fall back immediately instead of retrying overlapping matches.
  // Quoted attributes containing angle brackets also use the HTML parser;
  // malformed quotes must never consume later tags and their body text.
  const tags = /<\/?([a-z][a-z0-9-]*)(?:\s(?:[^'"<>]|"[^"<>]*"|'[^'<>]*')*)?\/?>/iy;
  const parts: string[] = [];
  let offset = 0;
  const tables: string[] = [];
  let cellDepth = 0;
  for (let index = value.indexOf('<'); index !== -1; index = value.indexOf('<', offset)) {
    tags.lastIndex = index;
    const match = tags.exec(value);
    if (!match) return richTextToPlainText(value);
    const text = value.slice(offset, index);
    const tag = match[1].toLowerCase();
    const closing = match[0].startsWith('</');
    if (!hasSimpleAttributes(match[0], match[1].length, closing)) return richTextToPlainText(value);
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
    offset = index + match[0].length;
  }
  const tail = value.slice(offset);
  if (tables.length || tail.includes('<')) return richTextToPlainText(value);
  parts.push(tail);
  // Decode entities with the existing parser. The result remains plain text;
  // rich article rendering and its HTML sanitization are unchanged.
  return richTextToPlainText(parts.join(''));
}
