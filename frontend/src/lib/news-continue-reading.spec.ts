import { describe, expect, it } from 'vitest';

import {
  type NewsContinueReadingCandidate,
  selectNewsContinueReadingItems,
} from '@/lib/news-continue-reading';

const candidates: NewsContinueReadingCandidate[] = [
  { id: 1, slug: 'current', title: '螺栓网带炉调质条件', categoryId: 1 },
  { id: 2, slug: 'same-new', title: '螺栓网带炉调质报价条件', categoryId: 1 },
  { id: 3, slug: 'other-new', title: '铜丝连续退火方案', categoryId: 2 },
  { id: 4, slug: 'same-old', title: '螺母网带炉调质产量', categoryId: 1 },
  { id: 5, slug: 'other-old', title: '网带炉调质工艺边界', categoryId: 3 },
  { id: 6, slug: 'last', title: '网带炉调质配置', categoryId: 4 },
];

describe('selectNewsContinueReadingItems', () => {
  it('排除当前文章，优先同工件工艺与下一步采购，而非后台分类', () => {
    const result = selectNewsContinueReadingItems(
      { id: 1, slug: 'current', titleZh: '螺栓网带炉调质条件', categoryId: 1 },
      candidates,
    );

    expect(result.map((item) => item.slug)).toEqual([
      'same-new',
      'same-old',
      'other-old',
      'last',
    ]);
  });

  it('去除重复链接并限制为四篇', () => {
    const result = selectNewsContinueReadingItems(
      { id: 99, slug: 'not-in-list', titleZh: '螺栓网带炉调质条件', categoryId: null },
      [candidates[1], { ...candidates[1], id: 20 }, ...candidates.slice(2)],
    );

    expect(result).toHaveLength(4);
    expect(result.map((item) => item.slug)).toEqual([
      'same-new',
      'same-old',
      'other-old',
      'last',
    ]);
  });

  it('keeps an older relevant candidate beyond the first twelve eligible', () => {
    const latest = Array.from({ length: 14 }, (_, index) => ({ id: index + 10, slug: `copper-${index}`, title: '铜丝退火线选型' }));
    const older = { id: 99, slug: 'older-spring-quote', title: '压簧网带回火炉报价需要哪些工况？', furnaces: ['mesh-belt'] as const };
    const result = selectNewsContinueReadingItems(
      { id: 1, slug: 'spring', titleZh: '压簧网带回火炉怎么选？', furnaces: ['mesh-belt'] },
      [...latest, { ...older, furnaces: [...older.furnaces] }],
    );
    expect(result.map(item => item.slug)).toEqual(['older-spring-quote']);
  });

  it('does not join conflicting processes just because the furnace matches', () => {
    const result = selectNewsContinueReadingItems(
      { id: 1, slug: 'annealing', titleZh: '网带炉退火产量怎么核算？' },
      [{ id: 2, slug: 'carburizing', title: '网带炉渗碳淬火产量' }, { id: 3, slug: 'annealing-quote', title: '网带炉退火报价边界' }],
    );
    expect(result.map(item => item.slug)).toEqual(['annealing-quote']);
  });

  it('leaves unrelated slots empty instead of recommending arbitrary latest records', () => {
    expect(selectNewsContinueReadingItems({ id: 1, slug: 'spring', titleZh: '压簧回火' }, [candidates[2]])).toEqual([]);
  });
});
