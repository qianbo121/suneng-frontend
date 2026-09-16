import { describe, expect, it, vi } from 'vitest';

vi.mock('react', async () => {
  const react = await vi.importActual<typeof import('react')>('react');

  return {
    ...react,
    cache: <T>(callback: T) => callback,
  };
});

import { mapNewsCard, resolveNewsImage } from './news';
import type { NewsApiItem } from '@/types/news';

const baseItem: NewsApiItem = {
  id: 76,
  categoryId: 1,
  titleZh: '热处理生产线自动化要做到什么程度？',
  publishDate: '2026-08-29T00:00:00.000Z',
  slug: 'shuju-news-31',
};

describe('mapNewsCard', () => {
  it('keeps CMS upload paths on the public site origin', () => {
    expect(resolveNewsImage({ coverImage: '/uploads/2026/05/cover.webp' })).toBe(
      '/uploads/2026/05/cover.webp',
    );
    expect(resolveNewsImage({ coverImage: 'http://localhost/uploads/2026/05/cover.webp' })).toBe(
      '/uploads/2026/05/cover.webp',
    );
  });

  it('uses a clean plain-text summary when the stored summary is rich text', () => {
    const card = mapNewsCard('zh', {
      ...baseItem,
      summaryZh: '<p>正式摘要&nbsp;&amp;&nbsp;方法</p>',
      contentZh: '<p>正文</p>',
    });

    expect(card.summary.zh).toBe('正式摘要 & 方法');
  });

  it('strips markup when falling back from an empty summary to article content', () => {
    const card = mapNewsCard('zh', {
      ...baseItem,
      summaryZh: '',
      contentZh:
        '<div><img src="/cover.webp" alt="cover"></div><div>画面说明<br><br>热处理生产线自动化不是越多越好。</div>',
    });

    expect(card.summary.zh).toBe('热处理生产线自动化不是越多越好。');
    expect(card.summary.zh).not.toMatch(/<\/?(?:div|img|br)\b/i);
  });

  it('retains the complete CMS record and makes content and SEO fields searchable', () => {
    const item: NewsApiItem = {
      ...baseItem,
      titleEn: 'Automation scope',
      summaryZh: '列表摘要',
      contentZh: '<p>正文独有词：第二行</p>',
      coverImage: '/uploads/cover.webp',
      contentUpdatedAt: '2026-08-30T10:00:00.000Z',
      viewCount: 12,
      isPublished: true,
      sortOrder: 7,
      status: 'published',
      baiduSubmittedAt: '2026-08-30T11:00:00.000Z',
      seoTitleZh: '选型资料',
      seoDescriptionZh: '搜索专用说明',
      seoKeywordsZh: '炉温均匀性,产能',
      ogImage: '/uploads/og.webp',
      createdAt: '2026-08-28T10:00:00.000Z',
      updatedAt: '2026-08-30T10:00:00.000Z',
      category: {
        id: 4,
        nameZh: '工程资料',
        nameEn: 'Engineering resources',
        slug: 'engineering-resources',
        sortOrder: 3,
        status: 'published',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
      },
    };

    const card = mapNewsCard('zh', item);

    expect(card.source).toEqual(item);
    expect(card.updatedAt).toBe(item.contentUpdatedAt);
    expect(card.searchText).toContain('第二行');
    expect(card.searchText).toContain('搜索专用说明');
    expect(card.searchText).toContain('炉温均匀性');
    expect(card.searchText).not.toContain('<p>');
  });
});
