import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import type { NewsApiItem } from '@/types/news';

export type NewsRelatedLink = {
  kind: '服务' | '产品' | '方案' | '案例' | '指南';
  title: string;
  description: string;
  href: string;
};

const LINKS = {
  quote: {
    kind: '指南',
    title: '工业炉报价需要哪些参数',
    description: '先整理工件、温度、装炉量、工艺、能源和产能节拍。',
    href: '/zh/articles/gongye-lu-baojia-canshu',
  },
  repair: {
    kind: '指南',
    title: '老旧热处理炉该修还是换',
    description: '从炉体、燃烧、电控、安全和停产窗口判断改造边界。',
    href: '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
  },
  renovation: {
    kind: '服务',
    title: '工业炉节能改造与大修',
    description: '查看现场诊断、方案边界、实施步骤和验收资料要求。',
    href: '/zh/service/furnace-renovation-overhaul',
  },
  risk: {
    kind: '方案',
    title: '改造风险、周期与生产影响',
    description: '按停产边界、安全条件和验收证据拆解改造决策。',
    href: '/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi',
  },
  continuous: {
    kind: '方案',
    title: '连续热处理生产线规划',
    description: '按工艺链、产能节拍、冷却、输送和控制边界组织方案。',
    href: '/zh/solutions/continuous-heat-treatment-line',
  },
  annealingProduct: {
    kind: '产品',
    title: '连续退火固溶生产线',
    description: '查看炉型结构、工艺分区、冷却与控制的配置边界。',
    href: '/zh/products/detail/annealing-solution-line',
  },
  lineCase: {
    kind: '案例',
    title: '连续退火固溶生产线案例',
    description: '查看已公开的项目边界、设计参数和交付口径。',
    href: '/zh/case/henan-annealing-solution-line',
  },
  trolley: {
    kind: '产品',
    title: '台车式热处理炉',
    description: '查看炉膛、装炉量、加热方式、工艺曲线与验收条件。',
    href: '/zh/products/detail/trolley-furnace',
  },
  box: { kind: '产品', title: '箱式热处理炉', description: '核对工件、装载方式、工作区与温度条件。', href: '/zh/products/detail/box-furnace' },
  pit: { kind: '产品', title: '井式热处理炉', description: '核对工件长度、有效深度、吊装与测温条件。', href: '/zh/products/detail/pit-furnace' },
  roller: { kind: '产品', title: '辊底式热处理炉', description: '核对工件支承、输送节拍和炉前炉后接口。', href: '/zh/products/detail/roller-hearth-furnace' },
  uniformity: { kind: '方案', title: '温度不均的核查与整改', description: '从测量、装载、热交换和复测证据定位问题。', href: '/zh/solutions/rechuli-lu-wendu-bujun-zhenggai' },
  meshBelt: {
    kind: '产品',
    title: '网带炉的工件与工艺适用条件',
    description: '先核对工件、铺料与工艺，再选择退火回火、调质或渗碳淬火配置。',
    href: '/zh/products/detail/mesh-belt-furnace',
  },
  meshBeltOutput: {
    kind: '方案',
    title: '网带炉每小时产量怎么算',
    description: '先算铺料与带速形成的理论值，再核对工艺时间、瓶颈和停机。',
    href: '/zh/news/shuju-news-23',
  },
  meshBeltCarburizing: {
    kind: '方案',
    title: '网带炉连续渗碳的产量边界',
    description: '渗碳停留时间和有效长度需要单独校核，不能直接套用调质线产量。',
    href: '/zh/news/mesh-belt-carburizing-throughput-process-limits',
  },
  meshBeltQuotation: { kind: '指南', title: '网带炉报价前的九项边界', description: '按同一工件、工艺、配套和供货范围比较报价。', href: '/zh/news/shuju-news-22' },
  meshBeltAnnealing: { kind: '产品', title: '网带式退火回火生产线', description: '核对工件铺料、温度时间、带速与冷却要求。', href: '/zh/products/detail/roller-mesh-belt-line' },
  meshBeltCarburizingLine: { kind: '产品', title: '网带式渗碳淬火生产线', description: '核对层深、心部性能、渗碳时间与后续淬火回火。', href: '/zh/products/detail/mesh-belt-carbonitriding-line' },
} satisfies Record<string, NewsRelatedLink>;

function unique(links: NewsRelatedLink[]) {
  return links.filter((link, index) => links.findIndex((item) => item.href === link.href) === index);
}

function getChineseNewsRelatedLinks(
  item: Pick<NewsApiItem, 'titleZh' | 'summaryZh' | 'contentZh'>,
) {
  // Use the article's subject so an incidental body mention does not replace its own topic.
  if (/网带/.test(item.titleZh)) {
    const carburizing = /渗碳|碳氮共渗/.test(item.titleZh);
    const product = carburizing ? LINKS.meshBeltCarburizingLine
      : /退火|回火/.test(item.titleZh) && !/淬火|调质/.test(item.titleZh)
        ? LINKS.meshBeltAnnealing : LINKS.meshBelt;
    return [product, carburizing ? LINKS.meshBeltCarburizing : LINKS.meshBeltOutput, LINKS.meshBeltQuotation];
  }

  const text = item.titleZh;
  const product = /台车/.test(text) ? LINKS.trolley
    : /箱式/.test(text) ? LINKS.box
    : /井式/.test(text) ? LINKS.pit
    : /辊棒|辊底/.test(text) ? LINKS.roller : null;
  if (product) {
    const topic = /温度|均匀|测温|控温/.test(text) ? LINKS.uniformity
      : /改造|大修|维修|炉衬|燃烧|电控|漏火|密封|故障/.test(text) ? LINKS.renovation : null;
    return unique([product, ...(topic ? [topic] : []), LINKS.quote]);
  }
  const links: NewsRelatedLink[] = [];

  if (/改造|节能|大修|维修|炉衬|燃烧|电控|余热/.test(text)) {
    links.push(LINKS.renovation, LINKS.risk, LINKS.repair);
  }

  // The published Henan record is a metal-strip line, not evidence for copper
  // wire, semiconductor annealing or every continuous production line.
  if (/带材|钢带|不锈钢连续退火|连续退洗/.test(text)) {
    links.push(LINKS.continuous, LINKS.annealingProduct, LINKS.lineCase);
  } else if (/生产线|整线|交钥匙|集成商/.test(text)) {
    links.push(LINKS.continuous);
  }

  if (/台车炉|台车式/.test(text)) {
    links.push(LINKS.trolley);
  }

  links.push(LINKS.quote);
  const candidates = unique(links);
  const priority: NewsRelatedLink['kind'][] = ['服务', '方案', '产品', '案例', '指南'];
  const diverse = priority
    .map((kind) => candidates.find((link) => link.kind === kind))
    .filter((link): link is NewsRelatedLink => Boolean(link));

  return diverse.slice(0, 4);
}

// English destinations are explicit and only point to existing public pages.
const ENGLISH_LINKS: Record<string, Omit<NewsRelatedLink, 'kind'>> = {
  [LINKS.quote.href]: { title: 'Prepare a furnace enquiry', description: 'Send workpiece, process, loading, utilities and acceptance requirements.', href: '/en/contact' },
  [LINKS.repair.href]: { title: 'Furnace renovation and overhaul', description: 'Define the shutdown window, responsibilities and applicable acceptance checks.', href: '/en/service/furnace-renovation-overhaul' },
  [LINKS.renovation.href]: { title: 'Furnace renovation and overhaul', description: 'Define the shutdown window, responsibilities and applicable acceptance checks.', href: '/en/service/furnace-renovation-overhaul' },
  [LINKS.risk.href]: { title: 'Furnace renovation and overhaul', description: 'Define the shutdown window, responsibilities and applicable acceptance checks.', href: '/en/service/furnace-renovation-overhaul' },
  [LINKS.continuous.href]: { title: 'Equipment selection and project scope', description: 'Connect process stages, throughput, cooling, transfer and control interfaces.', href: '/en/service/selection-retrofit-guide' },
  [LINKS.annealingProduct.href]: { title: 'Annealing and solution treatment line', description: 'Review process zones, cooling and control boundaries.', href: '/en/products/detail/annealing-solution-line' },
  [LINKS.trolley.href]: { title: 'Trolley furnace', description: 'Review loading, working dimensions, heating and acceptance conditions.', href: '/en/products/detail/trolley-furnace' },
  [LINKS.box.href]: { title: 'Box furnace', description: 'Check workpieces, loading, working zone and temperature conditions.', href: '/en/products/detail/box-furnace' },
  [LINKS.pit.href]: { title: 'Pit furnace', description: 'Check workpiece length, effective depth, lifting and measurement conditions.', href: '/en/products/detail/pit-furnace' },
  [LINKS.roller.href]: { title: 'Roller-hearth furnace', description: 'Check workpiece support, transfer cycle and upstream/downstream interfaces.', href: '/en/products/detail/roller-hearth-furnace' },
  [LINKS.uniformity.href]: { title: 'Furnace assessment and renovation', description: 'Compare measurement, loading, heat transfer and applicable repeat-test evidence.', href: '/en/service/furnace-renovation-overhaul' },
  [LINKS.lineCase.href]: { title: 'Annealing and solution treatment project', description: 'Review the published project scope, design parameters and delivery boundaries.', href: '/en/case/henan-annealing-solution-line' },
  [LINKS.meshBeltOutput.href]: { title: 'Calculate mesh belt furnace hourly output', description: 'Check theoretical loading and belt speed against process time, bottlenecks and downtime.', href: '/en/news/shuju-news-23' },
  [LINKS.meshBeltCarburizing.href]: { title: 'Mesh belt carburizing throughput limits', description: 'Check carburizing time and effective length separately from quench-and-temper throughput.', href: '/en/news/mesh-belt-carburizing-throughput-process-limits' },
  [LINKS.meshBeltQuotation.href]: { title: 'Nine mesh belt quotation boundaries', description: 'Compare quotations using the same workpiece, process, auxiliaries and supply scope.', href: '/en/news/shuju-news-22' },
  [LINKS.meshBeltAnnealing.href]: { title: 'Mesh belt annealing and tempering line', description: 'Check workpiece loading, temperature, residence time, belt speed and cooling.', href: '/en/products/detail/roller-mesh-belt-line' },
  [LINKS.meshBeltCarburizingLine.href]: { title: 'Mesh belt carburizing and quenching line', description: 'Check case depth, core properties, carburizing time and subsequent quenching and tempering.', href: '/en/products/detail/mesh-belt-carbonitriding-line' },
  [LINKS.meshBelt.href]: { title: 'Mesh belt furnace', description: 'Match workpieces and loading with the required heat treatment process.', href: '/en/products/detail/mesh-belt-furnace' },
};

export function getNewsRelatedLinks(
  item: Pick<NewsApiItem, 'titleZh' | 'summaryZh' | 'contentZh'> & Partial<Pick<NewsApiItem, 'slug'>>,
  locale: 'zh' | 'en' = 'zh',
): NewsRelatedLink[] {
  const subjectLinks = getChineseNewsRelatedLinks(item);
  if (locale === 'zh') {
    const links = subjectLinks.filter((link) => !isWithdrawnTechnicalPath(link.href)
      && link.href !== `/${locale}/news/${item.slug}`);
    // Reserve the approved repair guide only for explicit Chinese repair topics.
    if (!/维修|大修|改造|换新/.test(item.titleZh) || isWithdrawnTechnicalPath(LINKS.repair.href)) {
      return links;
    }
    const candidates = links.filter((link) => link.href !== LINKS.repair.href);
    const quoteIndex = candidates.findIndex((link) => link.href === LINKS.quote.href || link.href === LINKS.meshBeltQuotation.href);
    const position = quoteIndex < 0 ? Math.min(3, candidates.length) : Math.min(3, quoteIndex);
    return unique([
      ...candidates.slice(0, position),
      LINKS.repair,
      ...candidates.slice(position),
    ]).slice(0, 4);
  }
  const localized = unique(subjectLinks.flatMap((link) => {
    const english = ENGLISH_LINKS[link.href];
    return english ? [{ ...link, ...english }] : [];
  }));
  return localized.filter((link) => !isWithdrawnTechnicalPath(link.href)
    && link.href !== `/${locale}/news/${item.slug}`);
}
