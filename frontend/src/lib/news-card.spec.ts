import { describe, expect, it, vi } from 'vitest';

vi.mock('react', async () => {
  const react = await vi.importActual<typeof import('react')>('react');

  return {
    ...react,
    cache: <T>(callback: T) => callback,
  };
});

import { mapNewsCard } from './news';
import type { NewsApiItem } from '@/types/news';

const baseItem: NewsApiItem = {
  id: 76,
  categoryId: 1,
  titleZh: '热处理生产线自动化要做到什么程度？',
  publishDate: '2026-08-29T00:00:00.000Z',
  slug: 'shuju-news-31',
};

describe('mapNewsCard', () => {
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

    expect(card.summary.zh).toBe('画面说明 热处理生产线自动化不是越多越好。');
    expect(card.summary.zh).not.toMatch(/<\/?(?:div|img|br)\b/i);
  });
});
