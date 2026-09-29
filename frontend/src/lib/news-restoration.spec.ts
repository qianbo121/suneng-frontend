import { describe, expect, it } from 'vitest';
import revisions from './news-reviewed-copy.json';
import translations from './english-news-copy.json';
import { applyEnglishNewsCopy } from './english-news';
import { getNewsRelatedLinks } from './news-related';
import type { NewsApiItem } from '@/types/news';

const approvedIds = ['20', '22', '23', '24', '25', '26', '27', '29', '30'] as const;

describe('approved non-product restoration boundaries', () => {
  it.each(approvedIds)(
    'keeps the existing English edition available after Chinese cleanup: %s',
    async (id) => {
      const revision = revisions[id];
      const item = {
        id: Number(id),
        slug: revision.slug,
        status: 'published',
        isPublished: true,
        titleZh: revision.titleZh,
        seoTitleZh: revision.titleZh,
        summaryZh: revision.summaryZh,
        contentZh: revision.contentZh,
        seoDescriptionZh: revision.seoDescriptionZh,
        publishDate: '2026-08-20T00:00:00Z',
      } as NewsApiItem;
      const translated = await applyEnglishNewsCopy(item);
      expect(translated.contentEn).toBe(translations[id].contentEn);
      expect(translated.publishDate).toBe(item.publishDate);
      expect(translated.contentZh).not.toContain('anonymous-tsingshan-1250-renovation');
      // The compatibility update must still refuse an unrelated later Chinese revision.
      const later = { ...item, contentZh: '<p>A later editorial revision</p>' };
      expect(await applyEnglishNewsCopy(later)).toBe(later);
      const withdrawn = { ...item, status: 'offline' as const };
      expect(await applyEnglishNewsCopy(withdrawn)).toBe(withdrawn);
      const cmsEnglish = { ...item, titleEn: 'Later title', contentEn: '<p>Later English</p>' };
      expect(await applyEnglishNewsCopy(cmsEnglish)).toBe(cmsEnglish);
    },
  );

  it('adds procurement evidence only to the reviewed Chinese title, not incidental body mentions or English', () => {
    const item = { titleZh: '台车炉厂家怎么选？先核验这5类能力证据', summaryZh: '', contentZh: '' };
    const chinese = getNewsRelatedLinks(item, 'zh');
    expect(chinese.map((link) => link.href)).toEqual([
      '/zh/products/detail/trolley-furnace',
      '/zh/solutions/rechuli-lu-changjia',
      '/zh/strength/honors',
      '/zh/articles/gongye-lu-baojia-canshu',
    ]);
    expect(
      getNewsRelatedLinks(item, 'en').some((link) => link.href.includes('/strength/honors')),
    ).toBe(false);
    const unrelated = {
      titleZh: '普通采购注意事项',
      summaryZh: item.titleZh,
      contentZh: item.titleZh,
    };
    expect(getNewsRelatedLinks(unrelated).map((link) => link.href)).toEqual([
      '/zh/articles/gongye-lu-baojia-canshu',
    ]);
    expect(getNewsRelatedLinks({ ...unrelated, titleZh: 'constructor' })).toHaveLength(1);
  });
});
