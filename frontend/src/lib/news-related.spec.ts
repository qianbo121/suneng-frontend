import { describe, expect, it } from 'vitest';

import { getNewsRelatedLinks } from '@/lib/news-related';

describe('news thematic internal links', () => {
  it.each([
    '网带炉每小时产量怎么算？先算理论值，再校核工艺与停机',
    '网带炉多少钱一条？先确认9项报价边界',
  ])('keeps the existing mesh-belt article on its product and proposal paths: %s', (titleZh) => {
    const links = getNewsRelatedLinks({
      titleZh,
      summaryZh: '核对连续生产线的工艺和产量',
      contentZh: '比较退火、调质、停机和维修要求。',
    });

    expect(links.map((link) => link.href)).toEqual([
      '/zh/products/detail/mesh-belt-furnace',
      '/zh/articles/gongye-lu-baojia-canshu',
    ]);
    expect(links.filter((link) => link.href.startsWith('/zh/case/')).map((link) => link.kind))
      .toEqual([]);
  });

  it('does not let an incidental mesh-belt mention replace a trolley-furnace subject', () => {
    const links = getNewsRelatedLinks({
      titleZh: '台车炉适合哪些工件？',
      summaryZh: '按工件和装炉方式选择设备',
      contentZh: '连续生产的小件也可比较网带炉。',
    });

    expect(links.some((link) => link.href === '/zh/products/detail/mesh-belt-furnace')).toBe(false);
  });

  it("connects renovation articles only to public service, equipment and approved cases", () => {
    const links=getNewsRelatedLinks({titleZh:'连续退火生产线节能改造怎么做？',summaryZh:'',contentZh:''});
    expect(links.map(x=>x.href)).toEqual(['/zh/service/furnace-renovation-overhaul','/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi','/zh/products/detail/annealing-solution-line','/zh/case/henan-annealing-solution-line']);
    const english=getNewsRelatedLinks({titleZh:'连续退火生产线节能改造怎么做？',summaryZh:'',contentZh:''},'en');
    expect(english.map(x=>x.href)).toEqual(['/en/products/detail/annealing-solution-line','/en/case/henan-annealing-solution-line']);
  });

  it('provides only the approved quotation guide as a generic fallback without duplicates', () => {
    const links = getNewsRelatedLinks({ titleZh: '公司动态', summaryZh: '', contentZh: '' });

    expect(links.map(link => link.href)).toEqual(['/zh/articles/gongye-lu-baojia-canshu']);
    expect(new Set(links.map((link) => link.href)).size).toBe(links.length);
  });
});


describe('news subject and language boundaries', () => {
  it('keeps a trolley topic ahead of incidental continuous-line and maintenance mentions', () => {
    const links = getNewsRelatedLinks({ titleZh: '台车炉温度均匀性怎么测？', summaryZh: '', contentZh: '可比较连续生产线的改造和维修。' });
    expect(links[0].href).toBe('/zh/products/detail/trolley-furnace');
    expect(links.map(x => x.href)).not.toContain('/zh/products/detail/annealing-solution-line');
    expect(links.map(x => x.href)).toContain('/zh/solutions/rechuli-lu-wendu-bujun-zhenggai');
  });
  it.each([
    ['箱式炉尺寸怎么选？', 'box-furnace'],
    ['井式炉有效深度怎么定？', 'pit-furnace'],
    ['辊棒炉转运接口怎么确认？', 'roller-hearth-furnace'],
  ])('links the named furnace to its English product: %s', (titleZh, slug) => {
    const links = getNewsRelatedLinks({ titleZh, summaryZh: '', contentZh: '维修连续生产线' }, 'en');
    expect(links[0].href).toBe(`/en/products/detail/${slug}`);
    expect(links.every(x => x.href.startsWith('/en/'))).toBe(true);
    expect(links.map(x => x.title + x.description).join('')).not.toMatch(/[\u4e00-\u9fff]/);
  });
  it('omits retired English solutions and unavailable English service routes', () => {
    const links = getNewsRelatedLinks({ titleZh: '旧热处理炉维修改造怎么安排？', summaryZh: '', contentZh: '' }, 'en');
    expect(links.map(x => x.href)).not.toContain('/en/solutions/rechuli-lu-gaizao-fengxian-zhouqi');
    expect(links.some(x => x.href.startsWith('/en/service/'))).toBe(false);
    expect(new Set(links.map(x => x.href)).size).toBe(links.length);
  });
  it('omits translated proposals and Chinese-only guides', () => {
    const links = getNewsRelatedLinks({ titleZh: '网带炉产量怎么算？', summaryZh: '', contentZh: '' }, 'en');
    expect(links.filter(x => x.href.startsWith('/en/case/'))).toHaveLength(0);
    expect(links.some(x => x.href.startsWith('/en/articles/'))).toBe(false);
  });
});
