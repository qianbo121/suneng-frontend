import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({ ...(await original<typeof import('react')>()), cache: (fn: unknown) => fn }));

import descriptions from './news-image-descriptions.json';
import { normalizeNewsHtml } from './news';
import { prepareNewsArticleHtml } from './sanitize';
import type { NewsApiItem } from '@/types/news';

const firstPath = Object.keys(descriptions)[0] as keyof typeof descriptions;
const first = descriptions[firstPath];
const article = (html: string): NewsApiItem => ({
  id: 1, categoryId: 1, titleZh: '测试文章', titleEn: 'Article',
  slug: 'image-description-test', publishDate: '2026-09-29', contentZh: html, contentEn: html,
});

describe('reviewed news image descriptions', () => {
  it.each(Object.entries(descriptions))('repairs the old placeholder for %s in the rendered Chinese article', (src, copy) => {
    const html = normalizeNewsHtml('zh', article(`<p>工艺条件不变。</p><img src="https://www.jssngyl.cn${src}" alt="${copy.previousAlt}">`));
    expect(html).toContain(`alt="${copy.alt}"`);
    expect(html).toContain(src);
    expect(html).toContain('工艺条件不变。');
  });

  it('accepts the same reviewed asset as a relative URL with a cache query', () => {
    const html = normalizeNewsHtml('zh', article(`<img src="${firstPath}?v=2" alt="${first.previousAlt}">`));
    expect(html).toContain(`alt="${first.alt}"`);
  });

  it('preserves editor-written, decorative, English and unrelated image descriptions', () => {
    for (const alt of ['工程师后来更新的图片说明', '']) {
      expect(normalizeNewsHtml('zh', article(`<img src="${firstPath}" alt="${alt}">`))).toContain(`alt="${alt}"`);
    }
    const html = `<img src="${firstPath}" alt="${first.previousAlt}">`;
    expect(normalizeNewsHtml('en', article(html))).toContain(`alt="${first.previousAlt}"`);
    expect(prepareNewsArticleHtml(html)).toContain(`alt="${first.previousAlt}"`);
    expect(normalizeNewsHtml('zh', article('<img src="/uploads/new.webp" alt="新闻正文图片">'))).toContain('alt="新闻正文图片"');
    expect(normalizeNewsHtml('zh', article(`<img src="https://example.com${firstPath}" alt="${first.previousAlt}">`))).toContain(`alt="${first.previousAlt}"`);
  });

  it('keeps cover deduplication and HTML sanitization intact', () => {
    const html = normalizeNewsHtml('zh', article(`<p>正文保持。</p><img src="${firstPath}" alt="${first.previousAlt}" onerror="alert(1)"><script>alert(2)</script>`), { coverImage: firstPath });
    expect(html).toContain('正文保持。');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('<script');
  });
});
