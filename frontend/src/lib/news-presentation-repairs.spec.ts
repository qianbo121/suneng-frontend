import { describe, expect, it, vi } from 'vitest';
import DOMPurify from 'isomorphic-dompurify';
import revisions from './news-reviewed-copy.json';
import translations from './english-news-copy.json';
import { normalizeNewsHtml } from './news';
import { applyEnglishNewsCopy } from './english-news';
import { prepareNewsArticleHtml } from './sanitize';
import type { NewsApiItem } from '@/types/news';

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

const revision = revisions['76'];
const item = {
  id: 76,
  categoryId: 1,
  ...revision,
  seoTitleZh: revision.titleZh,
  status: 'published',
  isPublished: true,
  publishDate: '2026-08-29T08:21:40.000Z',
  contentUpdatedAt: revision.reviewedAt,
} as NewsApiItem;
const parse = (html: string) => DOMPurify.sanitize(html, { RETURN_DOM: true }) as HTMLElement;

describe('format-only repair of the automation article', () => {
  it('promotes exactly the four original labels without changing visible text or source data', () => {
    const beforeItem = JSON.stringify(item);
    const before = parse(prepareNewsArticleHtml(item.contentZh));
    const after = parse(normalizeNewsHtml('zh', item));
    expect(
      Array.from(after.querySelectorAll('h2.news-section-heading'), (h) => h.textContent),
    ).toEqual(['第一层：动作层', '第二层：联锁层', '第三层：记录层', '第四层：接口层']);
    expect(after.textContent).toBe(before.textContent);
    expect(after.querySelectorAll('h1')).toHaveLength(0);
    expect(JSON.stringify(item)).toBe(beforeItem);
  });

  it('describes only the verified diagram and retains its source plus all links', () => {
    const before = parse(prepareNewsArticleHtml(item.contentZh));
    const after = parse(normalizeNewsHtml('zh', item));
    const attrs = (root: HTMLElement, selector: string, name: string) =>
      Array.from(root.querySelectorAll(selector), (el) => el.getAttribute(name));
    expect(attrs(after, 'img', 'src')).toEqual(attrs(before, 'img', 'src'));
    expect(attrs(after, 'a', 'href')).toEqual(attrs(before, 'a', 'href'));
    expect(after.querySelector('img[alt="20260829-162120.jpg"]')).toBeNull();
    expect(after.querySelectorAll('img')[1].getAttribute('alt')).toContain(
      '动作、联锁、记录、接口四层',
    );
    expect(after.querySelectorAll('img')[0].getAttribute('alt')).toBe('20260829-162048.jpg');
  });

  it('leaves another article and a later changed image description alone', () => {
    expect(normalizeNewsHtml('zh', { ...item, slug: 'other-article' })).toBe(
      prepareNewsArticleHtml(item.contentZh),
    );
    const changed = {
      ...item,
      contentZh: item.contentZh?.replace('alt="20260829-162120.jpg"', 'alt="后续审核说明"'),
    };
    expect(normalizeNewsHtml('zh', changed)).toContain('alt="后续审核说明"');
  });

  it('does not describe a replacement image using the old diagram description', () => {
    const changed = {
      ...item,
      contentZh: item.contentZh?.replace(
        '1787991761833-bc8141ad-a684-4bc8-9a9a-3524905e5eca.webp',
        'replacement.webp',
      ),
    };
    expect(normalizeNewsHtml('zh', changed)).toContain('alt="20260829-162120.jpg"');
  });

  it('keeps the English source binding, copy and dates without rehashing', async () => {
    const translated = await applyEnglishNewsCopy(item);
    expect(translated.contentEn).toBe(translations['76'].contentEn);
    expect(translated.publishDate).toBe(item.publishDate);
    expect(translated.englishContentUpdatedAt).toBe(translations['76'].translatedAt);
    expect(normalizeNewsHtml('en', translated)).toBe(
      prepareNewsArticleHtml(translated.contentEn, { stackSimpleTables: true }),
    );
  });
});
