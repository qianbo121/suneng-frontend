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
  meshBeltThroughput: {
    kind: '方案',
    title: '调质网带整线产量：历史方案参考',
    description: '核对淬火、清洗与回火的能力匹配；方案产量不等于实测或渗碳产量。',
    href: '/zh/case/belt-quench-wash-temper-line-throughput-balance-proposal',
  },
  rollerBeltThroughput: {
    kind: '方案',
    title: '网带退火带速与排料：历史方案参考',
    description: '把带速、实际铺料与热处理要求一起核对，区分方案条件和实际产出。',
    href: '/zh/case/roller-belt-speed-loading-throughput-proposal',
  },
} satisfies Record<string, NewsRelatedLink>;

function unique(links: NewsRelatedLink[]) {
  return links.filter((link, index) => links.findIndex((item) => item.href === link.href) === index);
}

function getChineseNewsRelatedLinks(
  item: Pick<NewsApiItem, 'titleZh' | 'summaryZh' | 'contentZh'>,
) {
  // Use the article's subject so an incidental body mention does not replace its own topic.
  if (/网带/.test(item.titleZh)) {
    return [LINKS.meshBelt, LINKS.meshBeltThroughput, LINKS.rollerBeltThroughput, LINKS.quote];
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

  if (/连续|退火|固溶|生产线/.test(text)) {
    links.push(LINKS.continuous, LINKS.annealingProduct, LINKS.lineCase);
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

// English destinations are explicit: some Chinese service pages have no English route.
const ENGLISH_LINKS: Record<string, Omit<NewsRelatedLink, 'kind'>> = {
  [LINKS.quote.href]: { title: 'Prepare a furnace enquiry', description: 'Gather workpiece, process, loading, utilities and acceptance requirements.', href: '/en/solutions/rechuli-lu-changjia' },
  [LINKS.repair.href]: { title: 'Retrofit risks and downtime', description: 'Define the shutdown window, responsibilities and acceptance evidence.', href: '/en/solutions/rechuli-lu-gaizao-fengxian-zhouqi' },
  [LINKS.renovation.href]: { title: 'Retrofit risks and downtime', description: 'Define the shutdown window, responsibilities and acceptance evidence.', href: '/en/solutions/rechuli-lu-gaizao-fengxian-zhouqi' },
  [LINKS.risk.href]: { title: 'Retrofit risks and downtime', description: 'Define the shutdown window, responsibilities and acceptance evidence.', href: '/en/solutions/rechuli-lu-gaizao-fengxian-zhouqi' },
  [LINKS.continuous.href]: { title: 'Continuous heat treatment lines', description: 'Connect process stages, throughput, cooling, transfer and control interfaces.', href: '/en/solutions/continuous-heat-treatment-line' },
  [LINKS.annealingProduct.href]: { title: 'Annealing and solution treatment line', description: 'Review process zones, cooling and control boundaries.', href: '/en/products/detail/annealing-solution-line' },
  [LINKS.trolley.href]: { title: 'Trolley furnace', description: 'Review loading, working dimensions, heating and acceptance conditions.', href: '/en/products/detail/trolley-furnace' },
  [LINKS.box.href]: { title: 'Box furnace', description: 'Check workpieces, loading, working zone and temperature conditions.', href: '/en/products/detail/box-furnace' },
  [LINKS.pit.href]: { title: 'Pit furnace', description: 'Check workpiece length, effective depth, lifting and measurement conditions.', href: '/en/products/detail/pit-furnace' },
  [LINKS.roller.href]: { title: 'Roller-hearth furnace', description: 'Check workpiece support, transfer cycle and upstream/downstream interfaces.', href: '/en/products/detail/roller-hearth-furnace' },
  [LINKS.uniformity.href]: { title: 'Investigate temperature non-uniformity', description: 'Compare measurement, loading, heat transfer and repeat-test evidence.', href: '/en/solutions/rechuli-lu-wendu-bujun-zhenggai' },
  [LINKS.lineCase.href]: { title: 'Annealing and solution treatment project', description: 'Review the published project scope, design parameters and delivery boundaries.', href: '/en/case/henan-annealing-solution-line' },
  [LINKS.meshBeltThroughput.href]: { title: 'Mesh belt line throughput proposal', description: 'Compare quenching, washing and tempering capacities; proposed output is not a measured result.', href: '/en/case/belt-quench-wash-temper-line-throughput-balance-proposal' },
  [LINKS.rollerBeltThroughput.href]: { title: 'Belt speed and loading proposal', description: 'Compare proposed belt speed and loading with process requirements and actual output.', href: '/en/case/roller-belt-speed-loading-throughput-proposal' },
  [LINKS.meshBelt.href]: { title: 'Mesh belt furnace', description: 'Match workpieces and loading with the required heat treatment process.', href: '/en/products/detail/mesh-belt-furnace' },
};

export function getNewsRelatedLinks(
  item: Pick<NewsApiItem, 'titleZh' | 'summaryZh' | 'contentZh'>,
  locale: 'zh' | 'en' = 'zh',
): NewsRelatedLink[] {
  const links = getChineseNewsRelatedLinks(item).filter((link) => !isWithdrawnTechnicalPath(link.href));
  if (locale === 'zh') return links;
  return unique(links.flatMap((link) => {
    const english = ENGLISH_LINKS[link.href];
    return english && !isWithdrawnTechnicalPath(english.href) ? [{ ...link, ...english }] : [];
  }));
}
