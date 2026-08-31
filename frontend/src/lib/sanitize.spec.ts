import { describe, it, expect } from 'vitest';

import { richTextToPlainText, sanitizeRichTextHtml } from './sanitize';

describe('sanitizeRichTextHtml', () => {
  it('strips <script> from HTML content', () => {
    const out = sanitizeRichTextHtml('<p>ok</p><script>alert(1)</script>');
    expect(out).not.toContain('<script');
    expect(out).toContain('ok');
  });

  it('removes event-handler attributes (onerror)', () => {
    const out = sanitizeRichTextHtml('<img src="x" onerror="alert(1)">').toLowerCase();
    expect(out).not.toContain('onerror');
  });

  it('drops javascript: scheme hrefs', () => {
    const out = sanitizeRichTextHtml('<a href="javascript:alert(1)">x</a>').toLowerCase();
    expect(out).not.toContain('javascript:');
  });

  it('preserves safe formatting markup', () => {
    const out = sanitizeRichTextHtml('<p><b>bold</b> text</p>');
    expect(out).toContain('<b>bold</b>');
  });

  it('escapes raw < and paragraph-wraps plain text', () => {
    expect(sanitizeRichTextHtml('a < b')).toContain('&lt;');
    expect(sanitizeRichTextHtml('line one\n\nline two')).toContain('<p>');
  });

  it('returns an empty string for nullish input', () => {
    expect(sanitizeRichTextHtml('')).toBe('');
    expect(sanitizeRichTextHtml(null)).toBe('');
  });
});

describe('richTextToPlainText', () => {
  it('removes rich-text markup and preserves readable spacing', () => {
    expect(
      richTextToPlainText(
        '<div><img src="/cover.webp" alt="cover"></div><div>第一段<br><br>第二段</div>',
      ),
    ).toBe('第一段 第二段');
  });

  it('decodes HTML entities and removes unsafe content', () => {
    expect(richTextToPlainText('<script>alert(1)</script><p>A&nbsp;&amp;&nbsp;B</p>')).toBe(
      'A & B',
    );
  });

  it('returns an empty string for nullish input', () => {
    expect(richTextToPlainText('')).toBe('');
    expect(richTextToPlainText(null)).toBe('');
  });
});
