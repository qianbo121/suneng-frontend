import { describe, expect, it } from 'vitest';

import { getNewsRelatedLinks } from '@/lib/news-related';
import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';

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

  it("keeps public renovation, equipment and repair-decision paths within four cards", () => {
    const links=getNewsRelatedLinks({titleZh:'连续退火生产线节能改造怎么做？',summaryZh:'',contentZh:''});
    expect(links.map(x=>x.href)).toEqual(['/zh/service/furnace-renovation-overhaul','/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi','/zh/products/detail/annealing-solution-line','/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin']);
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
      '/zh/products/detail/annealing-solution-line',
      repairHref,
    ]);
  });
  it('retains repair decisions in the mesh-belt early-return branch without exposing withdrawn proposals', () => {
    const links = getNewsRelatedLinks({ titleZh: '网带炉维修和大修怎么安排？', summaryZh: '', contentZh: '' });
    expect(links.map((link) => link.href)).toEqual(['/zh/products/detail/mesh-belt-furnace', repairHref, quoteHref]);
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

  // Full English cards captured before this approved Chinese-only edit.
  const beforeEnglishCards = [
  {
    "titleZh": "旧台车炉改造还是换新？先算这4笔账",
    "cards": [
      {
        "kind": "产品",
        "title": "Trolley furnace",
        "description": "Review loading, working dimensions, heating and acceptance conditions.",
        "href": "/en/products/detail/trolley-furnace"
      }
    ]
  },
  {
    "titleZh": "热处理生产线年度大修要做什么？苏能“两单三关”闭环法",
    "cards": [
      {
        "kind": "产品",
        "title": "Annealing and solution treatment line",
        "description": "Review process zones, cooling and control boundaries.",
        "href": "/en/products/detail/annealing-solution-line"
      },
      {
        "kind": "案例",
        "title": "Annealing and solution treatment project",
        "description": "Review the published project scope, design parameters and delivery boundaries.",
        "href": "/en/case/henan-annealing-solution-line"
      }
    ]
  },
  {
    "titleZh": "网带炉维修和大修怎么安排？",
    "cards": [
      {
        "kind": "产品",
        "title": "Mesh belt furnace",
        "description": "Match workpieces and loading with the required heat treatment process.",
        "href": "/en/products/detail/mesh-belt-furnace"
      }
    ]
  },
  {
    "titleZh": "台车炉温度均匀性与维修边界怎么核对？",
    "cards": [
      {
        "kind": "产品",
        "title": "Trolley furnace",
        "description": "Review loading, working dimensions, heating and acceptance conditions.",
        "href": "/en/products/detail/trolley-furnace"
      }
    ]
  }
];
  it.each(beforeEnglishCards)('keeps English cards unchanged for $titleZh', ({ titleZh, cards }) => {
    expect(getNewsRelatedLinks({ titleZh, summaryZh: '', contentZh: '' }, 'en')).toEqual(cards);
  });
});
