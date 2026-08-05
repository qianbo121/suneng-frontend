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
} satisfies Record<string, NewsRelatedLink>;

function unique(links: NewsRelatedLink[]) {
  return links.filter((link, index) => links.findIndex((item) => item.href === link.href) === index);
}

export function getNewsRelatedLinks(
  item: Pick<NewsApiItem, 'titleZh' | 'summaryZh' | 'contentZh'>,
) {
  const text = `${item.titleZh} ${item.summaryZh || ''} ${item.contentZh || ''}`;
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
