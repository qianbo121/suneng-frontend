import { describe, expect, it } from 'vitest';

import { getNewsRelatedLinks } from '@/lib/news-related';

describe('news thematic internal links', () => {
  it('connects a renovation production-line article to a service, solution, product and case', () => {
    const links = getNewsRelatedLinks({
      titleZh: '连续退火固溶生产线节能改造',
      summaryZh: '改造燃烧和控制系统',
      contentZh: '包含停产与验收要求',
    });

    expect(links.map((link) => link.href)).toEqual(
      expect.arrayContaining([
        '/zh/service/furnace-renovation-overhaul',
        '/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi',
        '/zh/products/detail/annealing-solution-line',
        '/zh/case/henan-annealing-solution-line',
      ]),
    );
  });

  it('always exposes a quotation-parameter guide without duplicating URLs', () => {
    const links = getNewsRelatedLinks({ titleZh: '公司动态', summaryZh: '', contentZh: '' });

    expect(links.map((link) => link.href)).toContain('/zh/articles/gongye-lu-baojia-canshu');
    expect(new Set(links.map((link) => link.href)).size).toBe(links.length);
  });
});
