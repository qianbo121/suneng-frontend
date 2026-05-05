function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function stripDangerousBlocks(html: string) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/<input\b[^>]*>/gi, '')
    .replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, '')
    .replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, '')
    .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '');
}

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

  return stripDangerousBlocks(value)
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*(\2)/gi, '$1="#"')
    .replace(/(href|src)\s*=\s*javascript:[^\s>]+/gi, '$1="#"');
}

