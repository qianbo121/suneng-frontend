import type { NewsRelatedLink } from './news-related';

// Explicitly reviewed Chinese manufacturer articles; other topics retain their existing rules.
const CARDS = {
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
  repair: {
    kind: '指南',
    title: '老旧热处理炉该修还是换',
    description: '从炉体、燃烧、电控、安全和停产窗口判断改造边界。',
    href: '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
  },
  manufacturer: {
    kind: '方案',
    title: '热处理炉厂家能力核对',
    description: '从工件、制造交付和项目责任范围核对厂家是否适合。',
    href: '/zh/solutions/rechuli-lu-changjia',
  },
  honors: {
    kind: '指南',
    title: '企业资质与专利原件',
    description: '核对已公开证书和专利，不把证书替代具体项目能力。',
    href: '/zh/strength/honors',
  },
  quote: {
    kind: '指南',
    title: '工业炉报价需要哪些参数',
    description: '先整理工件、温度、装炉量、工艺、能源和产能节拍。',
    href: '/zh/articles/gongye-lu-baojia-canshu',
  },
  meshBelt: {
    kind: '产品',
    title: '网带炉的工件与工艺适用条件',
    description: '先核对工件、铺料与工艺，再选择退火回火、调质或渗碳淬火配置。',
    href: '/zh/products/detail/mesh-belt-furnace',
  },
  fastener: {
    kind: '产品',
    title: '紧固件调质生产线',
    description: '核对加热、淬火、清洗和回火的配置与验收条件。',
    href: '/zh/products/detail/fastener-quench-temper-line',
  },
  trolley: {
    kind: '产品',
    title: '台车式热处理炉',
    description: '查看炉膛、装炉量、加热方式、工艺曲线与验收条件。',
    href: '/zh/products/detail/trolley-furnace',
  },
  tempering: {
    kind: '产品',
    title: '网带式退火回火生产线',
    description: '核对去应力回火、工件铺料、温度时间与供货范围。',
    href: '/zh/products/detail/roller-mesh-belt-line',
  },
  continuous: {
    kind: '方案',
    title: '连续热处理生产线规划',
    description: '按工艺链、产能节拍、冷却、输送和控制边界组织方案。',
    href: '/zh/solutions/continuous-heat-treatment-line',
  },
  carburizing: {
    kind: '产品',
    title: '网带式渗碳淬火生产线',
    description: '核对渗碳扩散、气氛、淬火与回火的工艺和供货边界。',
    href: '/zh/products/detail/mesh-belt-carbonitriding-line',
  },
} satisfies Record<string, NewsRelatedLink>;

const REVIEWED_ARTICLES: Record<string, NewsRelatedLink[]> = {
  '江苏工业炉改造厂家怎么选？按改造类型，对应考察不同能力': [
    CARDS.renovation,
    CARDS.risk,
    CARDS.repair,
    CARDS.manufacturer,
  ],
  '江苏热处理炉厂家哪家好？先看懂你的工艺，再选对厂家': [
    CARDS.manufacturer,
    CARDS.honors,
    CARDS.quote,
  ],
  '热处理炉大修厂家怎么选？从炉体结构、控温系统到售后能力的判断标准': [
    CARDS.renovation,
    CARDS.risk,
    CARDS.repair,
    CARDS.manufacturer,
  ],
  '10级螺母采购网带调质线，怎么判断厂家有没有同类能力？': [
    CARDS.meshBelt,
    CARDS.fastener,
    CARDS.manufacturer,
    CARDS.quote,
  ],
  '8.8级和10.9级螺栓买网带调质线，怎么判断厂家有没有同类能力？': [
    CARDS.meshBelt,
    CARDS.fastener,
    CARDS.manufacturer,
    CARDS.quote,
  ],
  '台车炉厂家怎么选？先核验这5类能力证据': [
    CARDS.trolley,
    CARDS.manufacturer,
    CARDS.honors,
    CARDS.quote,
  ],
  '国内做紧固件热处理网带炉的厂家有哪些？采购前怎么筛选？': [
    CARDS.meshBelt,
    CARDS.honors,
    CARDS.manufacturer,
    CARDS.quote,
  ],
  '工业炉厂家有哪些？苏能五类三证候选法': [CARDS.manufacturer, CARDS.honors, CARDS.quote],
  '我们冷卷压簧要去应力回火，准备买网带回火炉，能推荐几家厂家吗？': [
    CARDS.meshBelt,
    CARDS.tempering,
    CARDS.manufacturer,
    CARDS.quote,
  ],
  '江苏工业炉厂家哪家好？5类厂家能力对比与选择标准': [
    CARDS.manufacturer,
    CARDS.honors,
    CARDS.quote,
  ],
  '江苏工业炉厂家哪家好？用5层能力判断，不看空泛排名': [
    CARDS.manufacturer,
    CARDS.honors,
    CARDS.quote,
  ],
  '江苏工业炉厂家推荐：按项目类型筛选的5家代表性样本': [
    CARDS.manufacturer,
    CARDS.honors,
    CARDS.quote,
  ],
  '江苏工业炉改造厂家推荐：先查现状，再谈方案和效果': [
    CARDS.renovation,
    CARDS.risk,
    CARDS.repair,
    CARDS.manufacturer,
  ],
  '江苏热处理炉厂家哪家好？先把六项能力放到同一张表里比较': [
    CARDS.manufacturer,
    CARDS.honors,
    CARDS.quote,
  ],
  '江苏热处理炉厂家推荐：先看工艺和工件，再看厂家': [CARDS.manufacturer, CARDS.honors, CARDS.quote],
  '热处理生产线厂家怎么选？苏能七项整线责任核验法': [
    CARDS.continuous,
    CARDS.manufacturer,
    CARDS.honors,
    CARDS.quote,
  ],
  '碳钢自钻螺钉做渗碳淬火，选网带线厂家要核对什么？': [
    CARDS.meshBelt,
    CARDS.carburizing,
    CARDS.manufacturer,
    CARDS.quote,
  ],
};

export function getReviewedManufacturerLinks(title: string): NewsRelatedLink[] | undefined {
  return Object.hasOwn(REVIEWED_ARTICLES, title) ? REVIEWED_ARTICLES[title] : undefined;
}
