import type { NewsApiItem, NewsListCardItem } from '@/types/news';

export const NEWS_PAGE_SIZE = 6;
export const NEWS_LIST_HERO_IMAGE = '/images/news/news-hero.png';
export const NEWS_FALLBACK_IMAGE = '/images/news/news-delivery.png';

export const NEWS_LABEL = {
  zh: '新闻中心',
  en: 'News Center',
} as const;

export const NEWS_DETAIL_LABEL = {
  zh: '新闻详情',
  en: 'News Detail',
} as const;

export const NEWS_SUBTITLE = {
  zh: '了解苏能工业炉最新动态与企业资讯',
  en: 'Learn about Suneng updates and corporate information',
} as const;

export const FALLBACK_NEWS_ITEMS: NewsListCardItem[] = [
  {
    id: 1,
    slug: 'large-trolley-furnace-delivery',
    image: NEWS_FALLBACK_IMAGE,
    title: {
      zh: '苏能工业炉顺利完成大型台车炉项目交付',
      en: 'Suneng Completes Large Trolley Furnace Delivery',
    },
    summary: {
      zh: '近日，江苏苏能工业炉有限公司成功完成某大型台车炉项目的设计、制造与交付工作，设备已顺利发运并投入客户现场运行。',
      en: 'Jiangsu Suneng has completed the design, manufacturing and delivery of a large trolley furnace project.',
    },
    date: '2025-05-18',
    category: NEWS_LABEL,
  },
  {
    id: 2,
    slug: 'industry-technology-exchange',
    image: '/images/news/news-exchange.png',
    title: {
      zh: '苏能工业炉参加行业技术交流活动',
      en: 'Suneng Joins Industry Technology Exchange',
    },
    summary: {
      zh: '公司受邀参加行业技术交流活动，与业内专家围绕工业炉节能智能化技术展开深入交流，共探行业高质量发展方向。',
      en: 'The company joined an industry technology exchange to discuss energy-saving and intelligent furnace technologies.',
    },
    date: '2025-05-13',
    category: NEWS_LABEL,
  },
  {
    id: 3,
    slug: 'intelligent-control-system-upgrade',
    image: '/images/news/news-control.png',
    title: {
      zh: '新一代智能控制系统助力热处理升级',
      en: 'New Intelligent Control System Supports Heat Treatment Upgrade',
    },
    summary: {
      zh: '苏能工业炉新一代智能控制系统正式上线，实现多炉型设备精准控制与远程运维，有效提升生产效率与能源利用率。',
      en: 'The new control system enables precise control and remote operation across multiple furnace types.',
    },
    date: '2025-05-07',
    category: NEWS_LABEL,
  },
  {
    id: 4,
    slug: 'equipment-upgrade-production-stability',
    image: '/images/news/news-upgrade.png',
    title: {
      zh: '设备升级改造提升生产稳定性',
      en: 'Equipment Upgrade Improves Production Stability',
    },
    summary: {
      zh: '公司完成多条生产线设备升级改造，优化工艺流程与自动化控制系统，显著提升设备稳定性与产品合格率。',
      en: 'Multiple production lines were upgraded to improve process control, stability and product qualification rate.',
    },
    date: '2025-04-28',
    category: NEWS_LABEL,
  },
  {
    id: 5,
    slug: 'international-heat-treatment-expo',
    image: '/images/news/news-expo.png',
    title: {
      zh: '苏能工业炉亮相国际热处理展览会',
      en: 'Suneng Presents at International Heat Treatment Expo',
    },
    summary: {
      zh: '公司携多款创新产品及解决方案亮相国际热处理展览会，吸引众多客户与合作伙伴关注，进一步提升品牌影响力。',
      en: 'Suneng presented innovative products and solutions at an international heat treatment exhibition.',
    },
    date: '2025-04-21',
    category: NEWS_LABEL,
  },
  {
    id: 6,
    slug: 'industrial-furnace-maintenance-sharing',
    image: '/images/news/news-maintenance.png',
    title: {
      zh: '工业炉日常维护保养知识分享',
      en: 'Industrial Furnace Maintenance Knowledge Sharing',
    },
    summary: {
      zh: '分享工业炉日常维护与保养要点，帮助用户延长设备使用寿命，保障生产安全稳定运行。',
      en: 'Maintenance tips are shared to help users extend equipment life and ensure safe, stable production.',
    },
    date: '2025-04-15',
    category: NEWS_LABEL,
  },
];

export const FALLBACK_NEWS_DETAIL: NewsApiItem = {
  id: 1,
  categoryId: 1,
  slug: 'large-trolley-furnace-delivery',
  titleZh: FALLBACK_NEWS_ITEMS[0].title.zh,
  titleEn: FALLBACK_NEWS_ITEMS[0].title.en,
  summaryZh:
    '近日，江苏苏能工业炉有限公司顺利完成某大型台车炉项目的设计、制造与交付工作。该项目设备已顺利通过客户验收，正式投入生产运行。',
  summaryEn:
    'Jiangsu Suneng Industrial Furnace has completed the design, manufacturing and delivery of a large trolley furnace project.',
  contentZh: `
    <p>近日，江苏苏能工业炉有限公司顺利完成某大型台车炉项目的设计、制造与交付工作。该项目设备已顺利通过客户验收，正式投入生产运行，标志着我司在大型热处理装备领域的技术实力与项目交付能力再上新台阶。</p>
    <h2>一、项目背景</h2>
    <p>本项目为某大型热处理生产线的核心设备，主要用于大型结构件的正火、退火工艺处理。设备有效加热区尺寸达18m × 6m × 3.2m，载重大，对炉内均温性与稳定性要求极高，整线对效率、能耗、稳定性与智能化控制均有要求。</p>
    <h2>二、实施亮点</h2>
    <p>1. 结构设计：根据客户生产工艺与产能需求，优化炉体结构与热场布局，确保温度均匀性与工艺稳定性。</p>
    <p>2. 节能设计：采用全纤维炉衬与燃烧系统优化，配合烟气余热回收技术，降低能耗水平。</p>
    <p>3. 智能控制：集成先进的PLC控制系统与远程监控平台，实现工艺参数精准控制与设备运行状态的可追溯。</p>
    <p>4. 质量达标保障：严格执行质量管理体系，关键部件精密加工与装配，保障设备长期稳定运行。</p>
    <h2>三、应用价值</h2>
    <p>该设备的成功交付，不仅提升了客户大型工件热处理产能与产品质量，也进一步增强了苏能工业炉在大型台车炉领域的品牌影响力。未来，我们将继续以技术创新和高品质服务，助力更多客户实现生产升级与价值提升。</p>
  `,
  contentEn:
    '<p>Jiangsu Suneng Industrial Furnace has completed the design, manufacturing and delivery of a large trolley furnace project.</p>',
  coverImage: NEWS_FALLBACK_IMAGE,
  publishDate: FALLBACK_NEWS_ITEMS[0].date,
};

export const FALLBACK_NEWS_SLUGS = new Set([
  'company-delivery-batch-1',
  ...FALLBACK_NEWS_ITEMS.map((item) => item.slug),
]);
