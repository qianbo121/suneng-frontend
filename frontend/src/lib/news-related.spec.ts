import { describe, expect, it } from 'vitest';

import { getNewsRelatedLinks } from '@/lib/news-related';
import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';

describe('news thematic internal links', () => {
  it.each([
    '网带炉每小时产量怎么算？先算理论值，再校核工艺与停机',
    '网带炉多少钱一条？先确认9项报价边界',
  ])('connects a mesh-belt question to its product and public calculation/quotation articles: %s', (titleZh) => {
    const links = getNewsRelatedLinks({
      titleZh,
      summaryZh: '核对连续生产线的工艺和产量',
      contentZh: '比较退火、调质、停机和维修要求。',
    });

    expect(links.map((link) => link.href)).toEqual([
      '/zh/products/detail/mesh-belt-furnace',
      '/zh/news/shuju-news-23',
      '/zh/news/shuju-news-22',
    ]);
    expect(links.some((link) => link.href.startsWith('/zh/case/'))).toBe(false);
  });

  it('does not let an incidental mesh-belt mention replace a trolley-furnace subject', () => {
    const links = getNewsRelatedLinks({
      titleZh: '台车炉适合哪些工件？',
      summaryZh: '按工件和装炉方式选择设备',
      contentZh: '连续生产的小件也可比较网带炉。',
    });

    expect(links.some((link) => link.href === '/zh/products/detail/mesh-belt-furnace')).toBe(false);
  });

  it('connects a strip-line renovation question to its service and product without restoring private proposals', () => {
    const links = getNewsRelatedLinks({
      titleZh: '带材连续退火固溶生产线节能改造',
      summaryZh: '改造燃烧和控制系统',
      contentZh: '包含停产与验收要求',
    });

    expect(links.map((link) => link.href)).toEqual(
      expect.arrayContaining([
        '/zh/service/furnace-renovation-overhaul',
        '/zh/products/detail/annealing-solution-line',
      ]),
    );
    expect(links.some((link) => /anonymous-tsingshan-1250-renovation|throughput-balance-proposal/.test(link.href))).toBe(false);
  });

  it('always exposes a quotation-parameter guide without duplicating URLs', () => {
    const links = getNewsRelatedLinks({ titleZh: '公司动态', summaryZh: '', contentZh: '' });

    expect(links.map((link) => link.href)).toContain('/zh/articles/gongye-lu-baojia-canshu');
    expect(new Set(links.map((link) => link.href)).size).toBe(links.length);
  });
});


describe('news subject and language boundaries', () => {
  it('keeps a trolley topic ahead of incidental continuous-line and maintenance mentions', () => {
    const links = getNewsRelatedLinks({ titleZh: '台车炉温度均匀性怎么测？', summaryZh: '', contentZh: '可比较连续生产线的改造和维修。' });
    expect(links[0].href).toBe('/zh/products/detail/trolley-furnace');
    expect(links.map(x => x.href)).not.toContain('/zh/products/detail/annealing-solution-line');
    expect(links.map(x => x.href)).toContain('/zh/articles/gongye-lu-baojia-canshu');
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
  it('uses the actual English renovation service and enquiry entry', () => {
    const links = getNewsRelatedLinks({ titleZh: '旧热处理炉维修改造怎么安排？', summaryZh: '', contentZh: '' }, 'en');
    expect(links.map(x => x.href)).toContain('/en/service/furnace-renovation-overhaul');
    expect(getNewsRelatedLinks({ titleZh: '工业炉报价前准备哪些工况？', summaryZh: '', contentZh: '' }, 'en')
      .map(x => x.href)).toContain('/en/contact');
    expect(links.some(x => x.href.startsWith('/en/solutions/'))).toBe(false);
    expect(new Set(links.map(x => x.href)).size).toBe(links.length);
  });
  it('uses published English mesh-belt calculation articles without private proposals', () => {
    const links = getNewsRelatedLinks({ titleZh: '网带炉产量怎么算？', summaryZh: '', contentZh: '' }, 'en');
    expect(links.filter(x => x.href.startsWith('/en/news/')).map(x => x.href)).toEqual([
      '/en/news/shuju-news-23', '/en/news/shuju-news-22',
    ]);
    expect(links.some(x => x.href.startsWith('/en/case/'))).toBe(false);
    expect(links.some(x => x.href.startsWith('/en/articles/'))).toBe(false);
  });
  it.each(['zh', 'en'] as const)('excludes the current calculation article and selects the carburizing line when named: %s', (locale) => {
    const links = getNewsRelatedLinks({
      slug: 'mesh-belt-carburizing-throughput-process-limits',
      titleZh: '网带炉连续渗碳的产量边界怎么算？', summaryZh: '', contentZh: '',
    }, locale);
    expect(links[0].href).toBe(`/${locale}/products/detail/mesh-belt-carbonitriding-line`);
    expect(links.map(x => x.href)).not.toContain(`/${locale}/news/mesh-belt-carburizing-throughput-process-limits`);
    expect(links.some(x => x.href.includes('proposal'))).toBe(false);
  });
  it('does not present a metal-strip project as semiconductor or copper-wire evidence', () => {
    for (const titleZh of ['金属退火与半导体退火设备怎么选？', '铜丝退火生产线怎么匹配工况？']) {
      const links = getNewsRelatedLinks({ titleZh, summaryZh: '', contentZh: '' });
      expect(links.some(x => /henan-annealing|annealing-solution-line/.test(x.href))).toBe(false);
    }
  });
});

describe('approved Chinese repair-guide recommendations', () => {
  const repairHref = '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin';
  const quoteHref = '/zh/articles/gongye-lu-baojia-canshu';

  it('shows the approved four-card trolley repair/replacement order', () => {
    const links = getNewsRelatedLinks({ titleZh: '旧台车炉改造还是换新？先算这4笔账', summaryZh: '', contentZh: '' });
    expect(links.map((link) => link.href)).toEqual([
      '/zh/products/detail/trolley-furnace',
      '/zh/service/furnace-renovation-overhaul',
      repairHref,
      quoteHref,
    ]);
  });
  it('reserves the fourth annual-overhaul slot for repair decisions', () => {
    const links = getNewsRelatedLinks({ titleZh: '热处理生产线年度大修要做什么？苏能“两单三关”闭环法', summaryZh: '', contentZh: '' });
    expect(links.map((link) => link.href)).toEqual([
      '/zh/service/furnace-renovation-overhaul',
      '/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi',
      repairHref,
    ]);
  });
  it('retains repair decisions in the mesh-belt early-return branch without exposing withdrawn proposals', () => {
    const links = getNewsRelatedLinks({ titleZh: '网带炉维修和大修怎么安排？', summaryZh: '', contentZh: '' });
    expect(links.map((link) => link.href)).toEqual([
      '/zh/products/detail/mesh-belt-furnace', '/zh/news/shuju-news-23', repairHref, '/zh/news/shuju-news-22',
    ]);
    expect(links.some((link) => link.href.startsWith('/zh/case/'))).toBe(false);
  });
  it.each([
    '箱式炉大修前检查哪些条件？',
    '井式炉改造前如何核对吊装边界？',
    '辊底炉换新前核对哪些接口？',
    '台车炉温度均匀性与维修边界怎么核对？',
    '旧热处理炉换新前如何判断？',
    '热处理炉维修与改造该怎么安排？',
  ])('keeps exactly one repair guide and at most four public cards for %s', (titleZh) => {
    const links = getNewsRelatedLinks({ titleZh, summaryZh: '', contentZh: '' });
    expect(links.filter((link) => link.href === repairHref)).toHaveLength(1);
    expect(links.length).toBeLessThanOrEqual(4);
    expect(new Set(links.map((link) => link.href)).size).toBe(links.length);
    expect(links.every((link) => !isWithdrawnTechnicalPath(link.href))).toBe(true);
  });
  it.each([
    '网带炉产量怎么算？', '台车炉适合哪些工件？', '连续退火生产线怎么选？', '公司动态', '工业炉燃烧系统怎么选？',
  ])('does not add cards because the summary/body mentions maintenance: %s', (titleZh) => {
    const beforeMention = getNewsRelatedLinks({ titleZh, summaryZh: '', contentZh: '' });
    expect(getNewsRelatedLinks({ titleZh, summaryZh: '维修、大修、改造和换新', contentZh: '比较维修、大修、改造和换新边界。' })).toEqual(beforeMention);
  });

});
