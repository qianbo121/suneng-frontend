import { describe, expect, it } from 'vitest';
import DOMPurify from 'isomorphic-dompurify';
import revisions from './news-reviewed-copy.json';
import translations from './english-news-copy.json';
import { applyEnglishNewsCopy } from './english-news';
import { hasPublishableEnglishNews } from './news-routing';
import { prepareNewsArticleHtml } from './sanitize';
import type { NewsApiItem } from '@/types/news';

const revision = revisions['73'];
const casePath = '/zh/case/henan-annealing-solution-line';

describe('approved inline case reference in shuju-news-28', () => {
  it('renders one contextual link between the evidence and confidentiality paragraphs', () => {
    const html = prepareNewsArticleHtml(revision.contentZh);
    const root = DOMPurify.sanitize(html, { RETURN_DOM: true }) as HTMLElement;
    const links = root.querySelectorAll(`a[href="${casePath}"]`);
    expect(links).toHaveLength(1);
    const paragraph = links[0].parentElement!;
    expect(paragraph.tagName).toBe('P');
    expect(links[0].textContent).toBe('河南850毫米退洗线的供货范围说明');
    expect(paragraph.textContent).toBe(
      '可参照河南850毫米退洗线的供货范围说明，核对设备配套与整线责任。',
    );
    expect(paragraph.previousElementSibling?.textContent).toContain('以及培训和备件清单。');
    expect(paragraph.nextElementSibling?.textContent).toMatch(/^如果客户名称和项目参数不能公开/);
  });

  it('keeps the existing English article available without changing its copy or dates', async () => {
    const item = {
      id: 73,
      categoryId: 1,
      ...revision,
      seoTitleZh: revision.titleZh,
      publishDate: '2026-08-28T00:44:44.185Z',
      contentUpdatedAt: revision.reviewedAt,
      status: 'published',
      isPublished: true,
    } as NewsApiItem;
    const translated = await applyEnglishNewsCopy(item);
    expect(hasPublishableEnglishNews(translated)).toBe(true);
    expect(translated.contentEn).toBe(translations['73'].contentEn);
    expect(translated.titleEn).toBe(translations['73'].titleEn);
    expect(translated.englishContentUpdatedAt).toBe(translations['73'].translatedAt);
    expect(translated.publishDate).toBe(item.publishDate);
    expect(translated.contentUpdatedAt).toBe(item.contentUpdatedAt);
    expect(translated.contentZh).toBe(revision.contentZh);
  });
});
