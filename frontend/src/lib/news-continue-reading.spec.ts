import { describe, expect, it } from 'vitest';

import {
  type NewsContinueReadingCandidate,
  selectNewsContinueReadingItems,
} from '@/lib/news-continue-reading';

const candidates: NewsContinueReadingCandidate[] = [
  { id: 1, slug: 'current', title: '当前文章', categoryId: 1 },
  { id: 2, slug: 'same-new', title: '同类新文章', categoryId: 1 },
  { id: 3, slug: 'other-new', title: '其他新文章', categoryId: 2 },
  { id: 4, slug: 'same-old', title: '同类旧文章', categoryId: 1 },
  { id: 5, slug: 'other-old', title: '其他旧文章', categoryId: 3 },
  { id: 6, slug: 'last', title: '最后一篇', categoryId: 4 },
];

describe('selectNewsContinueReadingItems', () => {
  it('排除当前文章，同类优先且每组保持原有顺序', () => {
    const result = selectNewsContinueReadingItems(
      { id: 1, slug: 'current', categoryId: 1 },
      candidates,
    );

    expect(result.map((item) => item.slug)).toEqual([
      'same-new',
      'same-old',
      'other-new',
      'other-old',
    ]);
  });

  it('去除重复链接并限制为四篇', () => {
    const result = selectNewsContinueReadingItems(
      { id: 99, slug: 'not-in-list', categoryId: null },
      [candidates[1], { ...candidates[1], id: 20 }, ...candidates.slice(2)],
    );

    expect(result).toHaveLength(4);
    expect(result.map((item) => item.slug)).toEqual([
      'same-new',
      'other-new',
      'same-old',
      'other-old',
    ]);
  });
});
