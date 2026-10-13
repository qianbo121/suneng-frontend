import { describe, expect, it } from 'vitest';
import { getNewsRelatedLinks } from './news-related';

describe('reviewed manufacturer article links', () => {
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
