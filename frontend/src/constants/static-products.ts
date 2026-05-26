import { PRODUCT_CENTER_CATEGORIES } from '@/constants/product-categories';
import { ProductListCardItem, ProductSpecRow } from '@/types/product';
import { Locale, SidebarItem } from '@/types/site';

export type StaticProductFeature = {
  title: string;
  text: string;
};

export type StaticProductIndustry = {
  title: string;
  text: string;
};

export type StaticProductDetailReason = {
  title: string;
  text: string;
};

export type StaticProductConfiguration = {
  title: string;
  image: string;
  specs: string[];
};

export type StaticProductProcessStep = {
  title: string;
  text: string;
};

export type StaticProductDetail = {
  series: string;
  title: string;
  breadcrumbSeries: string;
  summary: string;
  sellingPoints: string[];
  quickTags: string[];
  ctaHighlights: string[];
  reasons: StaticProductDetailReason[];
  customSpecs: ProductSpecRow[];
  configurations: StaticProductConfiguration[];
  processSteps: StaticProductProcessStep[];
  processes: string[];
  industries: string[];
  leadBullets: string[];
};

export type StaticProduct = {
  id: number;
  slug: string;
  model: string;
  name: {
    zh: string;
    en: string;
  };
  category: {
    zh: string;
    en: string;
  };
  summary: {
    zh: string;
    en: string;
  };
  description: {
    zh: string[];
    en: string[];
  };
  image: string;
  gallery: string[];
  features: StaticProductFeature[];
  specs: ProductSpecRow[];
  structureImages: string[];
  industries: StaticProductIndustry[];
  detail?: StaticProductDetail;
};

const sellingPoints = ['定制化设计', '工艺稳定', '节能高效', '安全可靠'];

const ctaHighlights = ['源头工厂直供', '成立于 2006 年', '8 小时响应 / 24 小时答复'];

const leadBullets = ['免费方案定制', '按工艺需求精准匹配', '专业方案团队', '全流程跟踪售后保障'];

const defaultProcessSteps: StaticProductProcessStep[] = [
  { title: '需求沟通', text: '了解工艺及产能需求' },
  { title: '方案确认', text: '提供方案与配置清单' },
  { title: '方案设计', text: '确定结构与技术方案' },
  { title: '制造调试', text: '生产制造与出厂验收' },
  { title: '交付安装', text: '安装调试与售后跟踪' },
];

const commonFeatures: StaticProductFeature[] = [
  { title: '定制化设计', text: '根据工件尺寸、工艺温度、节拍与产线条件进行非标定制。' },
  { title: '工艺稳定', text: '通过炉体结构、控温系统与热循环设计提升工艺重复性。' },
  { title: '节能高效', text: '优化加热段与保温结构，降低长期运行能耗。' },
  { title: '安全可靠', text: '关键部件与联锁保护按工业连续生产要求配置。' },
];

const commonIndustries: StaticProductIndustry[] = [
  { title: '汽车零部件', text: '热处理工艺配套' },
  { title: '机械加工', text: '零件与结构件热处理' },
  { title: '模具制造', text: '模具、五金件热处理' },
  { title: '科研院所', text: '实验与工艺验证' },
];

const imagesBySlug: Record<string, { gallery: string[]; configs: string[] }> = {
  'box-furnace': {
    gallery: [
      '/images/products/box-furnace/gallery/box-01.png',
      '/images/products/box-furnace/gallery/box-02.png',
    ],
    configs: [
      '/images/products/box-furnace/configs/config-01.png',
      '/images/products/box-furnace/configs/config-02.png',
    ],
  },
  'trolley-furnace': {
    gallery: [
      '/images/products/trolley-furnace/gallery/trolley-01.png',
      '/images/products/trolley-furnace/gallery/trolley-02.png',
      '/images/products/trolley-furnace/gallery/trolley-03.png',
    ],
    configs: [
      '/images/products/trolley-furnace/configs/config-01.png',
      '/images/products/trolley-furnace/configs/config-02.png',
      '/images/products/trolley-furnace/configs/config-03.png',
    ],
  },
  'pit-furnace': {
    gallery: [
      '/images/products/pit-furnace/gallery/pit-01.png',
      '/images/products/pit-furnace/gallery/pit-02.png',
      '/images/products/pit-furnace/gallery/pit-03.png',
    ],
    configs: [
      '/images/products/pit-furnace/configs/config-01.png',
      '/images/products/pit-furnace/configs/config-02.png',
      '/images/products/pit-furnace/configs/config-03.png',
    ],
  },
  'bell-furnace': {
    gallery: [
      '/images/products/bell-furnace/gallery/bell-01.png',
      '/images/products/bell-furnace/gallery/bell-02.png',
    ],
    configs: [
      '/images/products/bell-furnace/configs/config-01.png',
      '/images/products/bell-furnace/configs/config-02.png',
    ],
  },
  'pusher-furnace': {
    gallery: [
      '/images/products/pusher-furnace/gallery/pusher-01.png',
      '/images/products/pusher-furnace/gallery/pusher-02.png',
      '/images/products/pusher-furnace/gallery/pusher-03.png',
    ],
    configs: [
      '/images/products/pusher-furnace/configs/config-01.png',
      '/images/products/pusher-furnace/configs/config-02.png',
    ],
  },
  'mesh-belt-furnace': {
    gallery: [
      '/images/products/mesh-belt-furnace/gallery/mesh-01.png',
      '/images/products/mesh-belt-furnace/gallery/mesh-02.png',
      '/images/products/mesh-belt-furnace/gallery/mesh-03.png',
    ],
    configs: [
      '/images/products/mesh-belt-furnace/configs/config-01.png',
      '/images/products/mesh-belt-furnace/configs/config-02.png',
    ],
  },
  'roller-hearth-furnace': {
    gallery: [
      '/images/products/roller-hearth-furnace/gallery/roller-01.png',
      '/images/products/roller-hearth-furnace/gallery/roller-02.png',
      '/images/products/roller-hearth-furnace/gallery/roller-03.png',
    ],
    configs: [
      '/images/products/roller-hearth-furnace/configs/config-01.png',
      '/images/products/roller-hearth-furnace/configs/config-02.png',
    ],
  },
  'rotary-hearth-furnace': {
    gallery: [
      '/images/products/rotary-hearth-furnace/gallery/rotary-01.png',
      '/images/products/rotary-hearth-furnace/gallery/rotary-02.png',
    ],
    configs: [
      '/images/products/rotary-hearth-furnace/configs/config-01.png',
      '/images/products/rotary-hearth-furnace/configs/config-02.png',
    ],
  },
  'roller-mesh-belt-line': {
    gallery: [
      '/images/products/roller-mesh-belt-line/gallery/line-01.jpg',
      '/images/products/roller-mesh-belt-line/gallery/line-02.png',
    ],
    configs: [
      '/images/products/roller-mesh-belt-line/configs/config-01.png',
      '/images/products/roller-mesh-belt-line/configs/config-02.png',
    ],
  },
  'copper-wire-annealing-line': {
    gallery: [
      '/images/products/copper-wire-annealing-line/gallery/line-01.jpg',
      '/images/products/copper-wire-annealing-line/gallery/line-02.png',
    ],
    configs: [
      '/images/products/copper-wire-annealing-line/configs/config-01.png',
      '/images/products/copper-wire-annealing-line/configs/config-02.png',
    ],
  },
  'annealing-solution-line': {
    gallery: [
      '/images/products/annealing-solution-line/gallery/line-01.jpg',
      '/images/products/annealing-solution-line/gallery/line-02.png',
    ],
    configs: [
      '/images/products/annealing-solution-line/configs/config-01.png',
      '/images/products/annealing-solution-line/configs/config-02.png',
    ],
  },
};

const productDetails: Record<string, StaticProductDetail> = {
  'box-furnace': {
    series: '箱式炉系列',
    title: '箱式炉（非标定制）',
    breadcrumbSeries: '箱式炉系列',
    summary:
      '箱式炉适用于科研实验、小批量零件、模具、工装件及中小型金属件的退火、回火、正火、淬火、预热等热处理工艺。设备结构紧凑，操作方便，适合多品种、小批量或实验试制场景。炉膛尺寸、工作温度、加热方式、炉门结构和控温系统可根据工件尺寸、工艺温度和使用频率进行非标定制，适用于科研院所、模具制造、机械加工、热处理加工等领域。',
    sellingPoints,
    quickTags: sellingPoints,
    ctaHighlights,
    reasons: [
      { title: '满足工艺需求', text: '根据工件尺寸、温度范围和热处理工艺，定制炉膛尺寸、加热区布置和控温方案。' },
      { title: '贴合设备需求', text: '适配实验、小批量生产和多品种工件热处理需求，提高设备使用灵活性。' },
      { title: '提升热处理质量', text: '通过合理的加热元件布置和控温系统配置，提高炉温稳定性和工件处理一致性。' },
      { title: '降低能耗', text: '根据炉膛尺寸、保温结构和加热功率进行匹配，减少不必要的热损失。' },
      { title: '保障可靠性', text: '炉体结构、炉门密封、炉衬材料和控制系统按使用频率和温度等级配置，提升长期运行稳定性。' },
    ],
    customSpecs: [
      { key: '炉膛尺寸', value: '按工件尺寸和装炉方式定制' },
      { key: '最高工作温度', value: '≤1100℃ / ≤1250℃，可按工艺要求定制' },
      { key: '控温精度', value: '±3℃~±5℃，按控制系统配置确定' },
      { key: '加热功率', value: '50kW~1000kW，按炉膛尺寸和升温要求配置' },
      { key: '炉门形式', value: '前开门 / 上开门 / 电动炉门，可按操作方式定制' },
      { key: '加热方式', value: '电阻加热 / 燃气加热，可按能源条件配置' },
      { key: '温度范围', value: '常温至最高工艺温度，按热处理工艺定制' },
      { key: '气氛保护', value: '空气 / 氮气 / 部分可控气氛，按工艺要求配置' },
      { key: '温度均匀性', value: '±5℃~±10℃，按有效工作区和工艺要求确定' },
      { key: '炉体材质', value: '碳钢 / 不锈钢 / 合金钢及耐热结构材料' },
    ],
    configurations: [
      { title: '实验箱式炉', image: imagesBySlug['box-furnace'].configs[0], specs: ['工作温度：≤1100℃', '有效尺寸：按实验样件尺寸定制', '加热功率：50kW~300kW', '适用行业：科研、实验、试制'] },
      { title: '生产箱式炉', image: imagesBySlug['box-furnace'].configs[1], specs: ['工作温度：≤1250℃', '有效尺寸：按零件尺寸和装炉量定制', '加热功率：200kW~1000kW', '适用行业：零件热处理、模具制造、机械加工'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['正火', '退火', '淬火', '回火', '预热', '去应力处理'],
    industries: ['科研院所', '小型生产', '模具制造', '机械加工', '热处理加工'],
    leadBullets,
  },
  'trolley-furnace': {
    series: 'CMP 系列',
    title: '台车式热处理炉（非标定制）',
    breadcrumbSeries: '台车炉系列',
    summary:
      '台车式热处理炉适用于大型铸件、锻件、模具、轴类工件及大型结构件的退火、回火、正火、淬火等热处理工艺。设备采用固定炉体与移动台车结构，便于大型工件装卸和整体加热处理。炉膛尺寸、台车承重、加热方式、炉门结构、控温系统及温度均匀性可根据工件尺寸、装炉量和工艺要求进行非标定制，适用于机械制造、模具制造、能源装备、重工装备、航空航天等领域。',
    sellingPoints,
    quickTags: sellingPoints,
    ctaHighlights,
    reasons: [
      { title: '满足工艺需求', text: '根据工件尺寸、装炉重量、热处理温度和保温时间，定制炉膛有效尺寸、加热分区和控温方案。' },
      { title: '贴合设备需求', text: '根据车间布局、装卸方式和产线节拍，匹配台车结构、炉门形式、轨道布置和自动化程度。' },
      { title: '提升热处理质量', text: '通过炉体结构、加热元件布置和热风循环系统优化，提高炉温均匀性和工件热处理一致性。' },
      { title: '降低使用与能耗', text: '根据工艺温度、升温曲线和保温要求优化加热段配置，减少无效能耗，提高设备运行效率。' },
      { title: '保障可靠性', text: '关键部件、炉衬结构、台车传动、炉门密封和控温系统按工况配置，提升设备稳定性和使用寿命。' },
    ],
    customSpecs: [
      { key: '炉膛尺寸', value: '按工件尺寸、装炉方式和装载重量定制' },
      { key: '最高工作温度', value: '常见 660℃~1250℃，可按工艺要求定制至更高温区' },
      { key: '控温精度', value: '±3℃~±5℃，按控制系统配置确定' },
      { key: '加热功率', value: '30kW~3000kW，按炉膛尺寸、升温速度和装炉量配置' },
      { key: '炉门形式', value: '电动升降炉门 / 侧开炉门 / 内升炉门 / 翻转炉门等' },
      { key: '加热方式', value: '电阻加热 / 燃气加热 / 热风循环加热等' },
      { key: '温度范围', value: '常温至工艺设定温度，按退火、回火、正火、淬火等工艺定制' },
      { key: '气氛保护', value: '空气 / 氮气 / 氩气 / 混合气 / 可控气氛，按工艺要求配置' },
      { key: '温度均匀性', value: '±5℃~±10℃，按炉型结构、有效加热区和工艺要求确定' },
      { key: '炉体材质', value: '碳钢 / 不锈钢 / 合金钢及耐热结构材料，按使用温度和工况配置' },
    ],
    configurations: [
      { title: '大型模具台车炉', image: imagesBySlug['trolley-furnace'].configs[0], specs: ['工作温度：≤1250℃', '有效尺寸：按模具尺寸和装炉方式定制', '加热功率：800kW~1500kW', '适用行业：模具热处理、大型结构件热处理'] },
      { title: '中高温台车炉', image: imagesBySlug['trolley-furnace'].configs[1], specs: ['工作温度：≤1100℃', '有效尺寸：按工件尺寸定制', '加热功率：300kW~800kW', '适用行业：五金零件、机械零部件、锻件热处理'] },
      { title: '高温合金台车炉', image: imagesBySlug['trolley-furnace'].configs[2], specs: ['工作温度：≤1350℃', '有效尺寸：按高温合金工件尺寸定制', '加热功率：1200kW~3000kW', '适用行业：航空航天、能源装备、高温合金热处理'] },
    ],
    processSteps: [
      { title: '需求沟通', text: '了解工件尺寸、装炉重量、热处理工艺、温度范围、产能节拍和现场条件。' },
      { title: '方案确认', text: '提供初步炉型方案、核心配置和设备布置建议，确认工艺目标与预算范围。' },
      { title: '方案设计', text: '完成炉体结构、台车承重、炉门形式、加热系统、控温系统和自动化配置设计。' },
      { title: '制造调试', text: '进行设备制造、系统装配、电气调试和出厂检验，确保设备满足设计要求。' },
      { title: '交付安装', text: '完成运输、安装、现场调试、操作培训和后续服务跟踪。' },
    ],
    processes: ['退火', '回火', '正火', '淬火', '固溶', '时效', '去应力处理等'],
    industries: ['汽车零部件', '机械加工', '模具制造', '轨道交通', '航空航天', '能源装备', '重工装备', '科研院所'],
    leadBullets,
  },
  'pit-furnace': {
    series: '井式炉系列',
    title: '井式炉（非标定制）',
    breadcrumbSeries: '井式炉系列',
    summary:
      '井式炉适用于轴类、杆类、长筒类、套筒类及竖直装炉工件的退火、回火、正火、淬火、渗氮等热处理工艺。设备采用立式炉膛结构，适合对工件垂直装炉、受热均匀性和变形控制有要求的生产场景。炉膛深度、有效直径、加热方式、炉盖结构、气氛保护和控温系统可根据工件长度、装炉方式及工艺要求进行非标定制，适用于机械制造、模具加工、五金加工、轨道交通、能源装备等领域。',
    sellingPoints,
    quickTags: sellingPoints,
    ctaHighlights,
    reasons: [
      { title: '满足工艺需求', text: '根据轴类、杆类、筒类工件的长度、直径和热处理工艺，定制炉膛深度、有效工作区和温度均匀性。' },
      { title: '贴合设备需求', text: '根据装卸方式、车间空间和自动化程度，匹配炉盖结构、吊装方式和控制系统。' },
      { title: '提升热处理质量', text: '通过立式加热结构和合理控温分区，改善长杆类工件受热一致性，降低变形风险。' },
      { title: '降低使用与能耗', text: '根据装炉量、工艺温度和保温时间优化加热功率与保温结构，提高运行效率。' },
      { title: '保障可靠性', text: '关键部件、炉衬材料、炉盖密封、加热元件和控温系统按工况配置，提升设备寿命和运行稳定性。' },
    ],
    customSpecs: [
      { key: '炉膛尺寸', value: '按工件长度、直径和装炉方式定制' },
      { key: '最高工作温度', value: '小型炉 ≤1100℃ / 中型炉 ≤1200℃ / 大型炉 ≤1250℃，可按工艺要求定制' },
      { key: '控温精度', value: '±3℃~±5℃，按控制系统配置确定' },
      { key: '加热功率', value: '小型 50kW~300kW / 中型 200kW~800kW / 大型 500kW~1200kW' },
      { key: '炉门形式', value: '炉盖开启 / 电动升降炉盖 / 侧开辅助结构，可按装卸方式定制' },
      { key: '加热方式', value: '电阻加热 / 燃气加热 / 热风循环' },
      { key: '温度范围', value: '常温至最高工艺温度，按退火、回火、正火、淬火等工艺定制' },
      { key: '气氛保护', value: '空气 / 氮气 / 氩气 / 混合气 / 部分可控气氛' },
      { key: '温度均匀性', value: '±5℃~±10℃，按有效工作区和工艺要求确定' },
      { key: '炉体材质', value: '碳钢 / 不锈钢 / 合金钢及耐热结构材料' },
    ],
    configurations: [
      { title: '小型实验井式炉', image: imagesBySlug['pit-furnace'].configs[0], specs: ['工作温度：≤1100℃', '有效尺寸：按实验样件尺寸定制', '加热功率：50kW~300kW', '适用行业：科研、实验、试制'] },
      { title: '中型生产井式炉', image: imagesBySlug['pit-furnace'].configs[1], specs: ['工作温度：≤1200℃', '有效尺寸：按轴类、杆类工件尺寸定制', '加热功率：200kW~800kW', '适用行业：模具、五金、机械加工'] },
      { title: '大型工业井式炉', image: imagesBySlug['pit-furnace'].configs[2], specs: ['工作温度：≤1250℃', '有效尺寸：按大型长轴、筒类或杆类工件定制', '加热功率：500kW~1200kW', '适用行业：大型零件、轨道交通、能源装备、航空航天'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['正火', '退火', '淬火', '回火', '固溶', '渗氮', '去应力处理'],
    industries: ['科研院所', '模具制造', '五金加工', '轨道交通', '机械制造', '能源装备'],
    leadBullets,
  },
  'bell-furnace': {
    series: '罩式炉系列',
    title: '罩式炉（非标定制）',
    breadcrumbSeries: '罩式炉系列',
    summary:
      '罩式炉适用于金属零件、模具、五金件、盘卷、线材及批量工件的退火、回火、正火、保温及气氛保护热处理。设备采用炉罩与炉台组合结构，可根据工件装炉方式、温度范围、气氛保护要求和生产节拍进行非标定制。炉体结构紧凑，适合小批量生产、实验试制及部分连续化配套场景，广泛应用于五金加工、模具制造、金属材料处理和热处理加工等领域。',
    sellingPoints,
    quickTags: sellingPoints,
    ctaHighlights,
    reasons: [
      { title: '满足工艺需求', text: '根据工件类型、装炉高度、气氛保护和温度均匀性要求，定制炉罩结构、炉台尺寸和控温方案。' },
      { title: '贴合设备需求', text: '适配小型零件、盘卷、线材、模具或批量工件的装炉方式，提高使用灵活性。' },
      { title: '提升热处理质量', text: '通过炉罩结构、热循环系统和控温配置优化，提高工件受热一致性。' },
      { title: '降低能耗', text: '根据有效加热区、保温结构和热循环方式优化加热段配置，降低运行热损失。' },
      { title: '保障可靠性', text: '炉罩、炉台、密封结构、加热系统和控制系统按工况配置，保证设备长期稳定运行。' },
    ],
    customSpecs: [
      { key: '炉膛尺寸', value: '按工件尺寸、装炉高度和炉台结构定制' },
      { key: '最高工作温度', value: '≤950℃~1150℃，可按工艺要求定制' },
      { key: '控温精度', value: '±3℃~±5℃，按控制系统配置确定' },
      { key: '加热功率', value: '50kW~800kW，按炉体规格和升温要求配置' },
      { key: '炉门形式', value: '罩式结构 / 炉罩升降 / 炉台固定或移动结构' },
      { key: '加热方式', value: '电阻加热 / 燃气加热 / 热风循环' },
      { key: '温度范围', value: '常温至工艺设定温度，按退火、回火、保温等工艺定制' },
      { key: '气氛保护', value: '空气 / 氮气 / 部分可控气氛，按工艺要求配置' },
      { key: '温度均匀性', value: '±5℃~±10℃，按炉罩结构和有效工作区确定' },
      { key: '炉体材质', value: '碳钢 / 不锈钢 / 合金钢及耐热结构材料' },
    ],
    configurations: [
      { title: '小型罩式炉', image: imagesBySlug['bell-furnace'].configs[0], specs: ['工作温度：≤950℃', '有效尺寸：按小型工件或实验样件定制', '加热功率：50kW~200kW', '适用行业：小件、实验、试制'] },
      { title: '中型罩式炉', image: imagesBySlug['bell-furnace'].configs[1], specs: ['工作温度：≤1150℃', '有效尺寸：按五金件、模具或批量工件定制', '加热功率：200kW~800kW', '适用行业：五金、模具、金属材料处理'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['正火', '退火', '淬火', '回火', '保温', '气氛保护热处理'],
    industries: ['五金加工', '小批量生产', '模具制造', '金属材料处理', '热处理加工'],
    leadBullets,
  },
  'pusher-furnace': {
    series: '推杆炉系列',
    title: '推杆炉（非标定制）',
    breadcrumbSeries: '推杆炉系列',
    summary:
      '推杆炉适用于托盘、料筐或工装承载工件的连续式退火、正火、淬火加热、回火等热处理工艺。设备通过推杆机构实现工件按节拍连续进入炉膛，适合批量生产、节拍稳定和工艺流程固定的热处理场景。炉膛尺寸、推杆节拍、加热分区、装料方式、控温系统和气氛保护可根据工件类型、产能要求和热处理工艺进行非标定制，适用于五金加工、模具制造、标准件、汽车零部件、轨道交通等领域。',
    sellingPoints,
    quickTags: sellingPoints,
    ctaHighlights,
    reasons: [
      { title: '满足工艺需求', text: '根据工件批量、热处理温度和保温时间，定制炉膛尺寸、推料节拍和加热分区。' },
      { title: '贴合设备需求', text: '根据生产线布局、上下料方式和工装形式，匹配推杆机构、进出料结构和自动化配置。' },
      { title: '提升热处理质量', text: '通过稳定的推料节拍、分区控温和炉体结构优化，提高批量工件处理一致性。' },
      { title: '降低能耗', text: '根据连续生产工况优化加热段、保温结构和热循环配置，减少能耗浪费。' },
      { title: '保障可靠性', text: '推杆机构、传动系统、炉衬结构、加热元件和控制系统按连续运行工况配置，保证设备稳定运行。' },
    ],
    customSpecs: [
      { key: '炉膛尺寸', value: '按工装、料筐、托盘尺寸和产能要求定制' },
      { key: '最高工作温度', value: '小型 ≤1100℃ / 中高温 ≤1200℃~1300℃，可按工艺要求定制' },
      { key: '控温精度', value: '±3℃~±5℃，按控制系统配置确定' },
      { key: '加热功率', value: '小型 100kW~400kW / 高温炉 300kW~1000kW' },
      { key: '炉门形式', value: '推杆进出料 / 侧开 / 升降炉门，可按工艺布置定制' },
      { key: '加热方式', value: '电阻加热 / 燃气加热 / 热风循环' },
      { key: '温度范围', value: '常温至最高 1300℃，按工艺要求定制' },
      { key: '气氛保护', value: '空气 / 氮气 / 部分可氩气 / 可控气氛' },
      { key: '温度均匀性', value: '±5℃~±10℃，按有效工作区和工艺要求确定' },
      { key: '炉体材质', value: '碳钢 / 不锈钢 / 合金钢及耐热结构材料' },
    ],
    configurations: [
      { title: '标准推杆炉', image: imagesBySlug['pusher-furnace'].configs[0], specs: ['工作温度：≤1100℃', '有效尺寸：按托盘、料筐或工装尺寸定制', '加热功率：100kW~400kW', '适用行业：小件零件、五金件、标准件'] },
      { title: '高温推杆炉', image: imagesBySlug['pusher-furnace'].configs[1], specs: ['工作温度：≤1300℃', '有效尺寸：按批量工件和生产节拍定制', '加热功率：300kW~1000kW', '适用行业：五金、钢材、模具、批量热处理'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['正火', '退火', '淬火加热', '回火', '渗氮', '连续式热处理'],
    industries: ['五金加工', '模具制造', '轨道交通', '标准件制造', '汽车零部件', '热处理加工'],
    leadBullets,
  },
  'mesh-belt-furnace': {
    series: '网带炉系列',
    title: '网带炉（非标定制）',
    breadcrumbSeries: '网带炉系列',
    summary:
      '网带炉适用于标准件、五金件、冲压件、小型机械零件等批量工件的连续式退火、回火、正火、淬火等热处理工艺。设备通过网带输送实现连续进出料，适合生产节拍稳定、批量较大、对处理一致性要求较高的热处理场景。网带宽度、炉膛长度、加热分区、输送速度、气氛保护和控温系统可根据工件类型、产能要求和工艺曲线进行非标定制，适用于五金加工、标准件制造、汽车零部件和小件批量生产等领域。',
    sellingPoints,
    quickTags: sellingPoints,
    ctaHighlights,
    reasons: [
      { title: '满足工艺需求', text: '根据工件材质、热处理工艺和连续生产节拍，定制炉膛长度、加热分区和温度曲线。' },
      { title: '贴合设备需求', text: '根据产能、工件尺寸和输送方式，匹配网带宽度、输送速度和进出料结构。' },
      { title: '提升热处理质量', text: '通过稳定的连续输送、控温系统和热循环配置，提高批量产品的一致性。' },
      { title: '降低能耗', text: '根据加热段、保温段和冷却配套需求优化系统配置，减少连续生产中的能耗浪费。' },
      { title: '保障可靠性', text: '网带、传动系统、加热元件、炉衬结构和控温系统按长期连续运行工况配置，提升设备稳定性。' },
    ],
    customSpecs: [
      { key: '炉膛尺寸', value: '按网带宽度、炉膛长度和产能节拍定制' },
      { key: '最高工作温度', value: '≤1000℃~1150℃，可按工艺要求定制' },
      { key: '控温精度', value: '±3℃~±5℃，按控制系统配置确定' },
      { key: '加热功率', value: '200kW~1200kW，按炉膛规格和产能要求配置' },
      { key: '炉门形式', value: '连续进出料开口 / 推入式辅助结构' },
      { key: '加热方式', value: '电阻加热 / 燃气加热 / 热风循环' },
      { key: '温度范围', value: '常温至最高 1150℃，按工艺要求定制' },
      { key: '气氛保护', value: '空气 / 氮气 / 部分可控气氛' },
      { key: '温度均匀性', value: '±5℃~±10℃，按有效工作区和工艺要求确定' },
      { key: '炉体材质', value: '碳钢 / 不锈钢 / 合金钢及耐热结构材料' },
    ],
    configurations: [
      { title: '小型连续网带炉', image: imagesBySlug['mesh-belt-furnace'].configs[0], specs: ['工作温度：≤1000℃', '有效尺寸：按网带宽度和产线节拍定制', '加热功率：200kW~600kW', '适用行业：小件零件、标准件、五金件'] },
      { title: '中型网带炉', image: imagesBySlug['mesh-belt-furnace'].configs[1], specs: ['工作温度：≤1150℃', '有效尺寸：按连续生产节拍定制', '加热功率：400kW~1200kW', '适用行业：五金件生产、汽车零部件、小件批量热处理'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['正火', '退火', '淬火', '回火', '连续式热处理'],
    industries: ['五金加工', '小件零件批量生产', '标准件制造', '汽车零部件', '热处理加工'],
    leadBullets,
  },
  'roller-hearth-furnace': {
    series: '辊底炉系列',
    title: '辊底炉（非标定制）',
    breadcrumbSeries: '辊底炉系列',
    summary:
      '辊底炉适用于板材、棒材、管材、锻件、钢材条料及较重工件的连续式退火、正火、回火、固溶和热处理加热工艺。设备通过炉辊输送工件连续进出炉膛，适合中大型工件、连续生产线和对生产节拍要求较高的热处理场景。炉膛长度、辊道结构、加热分区、输送速度、控温系统和气氛保护可根据产线要求进行非标定制，适用于钢材加工、大型板材、机械制造、能源装备、航空零部件等领域。',
    sellingPoints,
    quickTags: sellingPoints,
    ctaHighlights,
    reasons: [
      { title: '满足工艺需求', text: '根据工件规格、热处理温度、保温时间和连续输送要求，定制炉膛长度、加热分区和控温曲线。' },
      { title: '贴合设备需求', text: '根据产线节拍、上下料方式和工件重量，匹配辊道结构、输送速度和自动化程度。' },
      { title: '提升热处理质量', text: '通过分区控温、炉辊输送和热循环优化，提高工件受热均匀性和处理一致性。' },
      { title: '降低能耗', text: '优化加热段、保温段和炉体保温结构，降低连续运行过程中的热损失。' },
      { title: '保障可靠性', text: '炉辊、传动系统、炉衬结构、加热系统和控温系统按连续运行工况配置，提升设备寿命和稳定性。' },
    ],
    customSpecs: [
      { key: '炉膛尺寸', value: '按板材、条材、棒材、管材规格和产线节拍定制' },
      { key: '最高工作温度', value: '≤1050℃~1250℃，可按工艺要求定制' },
      { key: '控温精度', value: '±3℃~±5℃，按控制系统配置确定' },
      { key: '加热功率', value: '200kW~1500kW，按炉膛尺寸、产能和升温要求配置' },
      { key: '炉门形式', value: '辊底连续进出料结构，可按产线布置定制' },
      { key: '加热方式', value: '电阻加热 / 燃气加热 / 热风循环' },
      { key: '温度范围', value: '常温至最高 1250℃，按退火、正火、回火、固溶等工艺定制' },
      { key: '气氛保护', value: '空气 / 氮气 / 部分可控气氛' },
      { key: '温度均匀性', value: '±5℃~±10℃，按有效工作区和工艺要求确定' },
      { key: '炉体材质', value: '碳钢 / 不锈钢 / 合金钢及耐热结构材料' },
    ],
    configurations: [
      { title: '小型辊底炉', image: imagesBySlug['roller-hearth-furnace'].configs[0], specs: ['工作温度：≤1050℃', '有效尺寸：按板材、条材规格定制', '加热功率：200kW~500kW', '适用行业：钢材、板材、中型零件热处理'] },
      { title: '大型辊底炉', image: imagesBySlug['roller-hearth-furnace'].configs[1], specs: ['工作温度：≤1250℃', '有效尺寸：按大型板材、棒材、管材或较重工件定制', '加热功率：500kW~1500kW', '适用行业：大型板材、能源装备、航空零件、连续热处理产线'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['正火', '退火', '淬火', '回火', '固溶', '连续式热处理'],
    industries: ['钢材加工', '大型板材', '棒材管材', '机械制造', '能源装备', '航空零件'],
    leadBullets,
  },
  'rotary-hearth-furnace': {
    series: '转底炉系列',
    title: '转底炉（非标定制）',
    breadcrumbSeries: '转底炉系列',
    summary:
      '转底炉通过旋转炉底带动工件在炉膛内按节拍运行，适用于锻件、盘类工件、环形工件、模具、五金零件及部分航空零件的热处理加热、锻造加热、退火、正火、回火等工艺。设备适合工件连续加热、节拍式生产和自动化上下料配套场景。炉底直径、旋转速度、加热分区、装出料方式、控温系统和气氛保护可根据工件规格、产能节拍和工艺制度进行非标定制，适用于锻造、机械制造、模具制造、五金加工、航空零部件等领域。',
    sellingPoints,
    quickTags: sellingPoints,
    ctaHighlights,
    reasons: [
      { title: '满足工艺需求', text: '根据工件规格、加热温度、保温时间和生产节拍，定制炉底直径、旋转速度和加热分区。' },
      { title: '贴合设备需求', text: '根据车间布局、上下料方式和自动化需求，匹配转底结构、进出料方式和控制系统。' },
      { title: '提升热处理质量', text: '通过炉底旋转、分区加热和控温系统优化，提高工件受热均匀性和批量处理一致性。' },
      { title: '降低能耗', text: '根据加热段、保温段和炉体保温结构进行配置优化，降低连续运行能耗。' },
      { title: '保障可靠性', text: '旋转炉底、传动系统、加热元件、炉衬结构和控温系统按生产工况配置，确保设备稳定运行。' },
    ],
    customSpecs: [
      { key: '炉膛尺寸', value: '按工件尺寸、炉底直径和装出料方式定制' },
      { key: '最高工作温度', value: '小型 ≤1100℃ / 大型 ≤1250℃，可按工艺要求定制' },
      { key: '控温精度', value: '±3℃~±5℃，按控制系统配置确定' },
      { key: '加热功率', value: '小型 100kW~400kW / 大型 300kW~1200kW' },
      { key: '炉门形式', value: '转底式结构，进出料口可按产线布置定制' },
      { key: '加热方式', value: '电阻加热 / 燃气加热 / 热风循环' },
      { key: '温度范围', value: '常温至最高 1250℃，按工艺要求定制' },
      { key: '气氛保护', value: '空气 / 氮气 / 部分可控气氛' },
      { key: '温度均匀性', value: '±5℃~±10℃，按有效工作区和工艺要求确定' },
      { key: '炉体材质', value: '碳钢 / 不锈钢 / 合金钢及耐热结构材料' },
    ],
    configurations: [
      { title: '小型转底炉', image: imagesBySlug['rotary-hearth-furnace'].configs[0], specs: ['工作温度：≤1100℃', '有效尺寸：按小型零件、盘类工件或环形工件定制', '加热功率：100kW~400kW', '适用行业：小型零件、五金件、节拍式加热'] },
      { title: '大型转底炉', image: imagesBySlug['rotary-hearth-furnace'].configs[1], specs: ['工作温度：≤1250℃', '有效尺寸：按模具、锻件、航空零件或批量加热工件定制', '加热功率：300kW~1200kW', '适用行业：模具、锻造、航空零件、机械制造'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['正火', '退火', '淬火', '回火', '锻造加热', '热处理加热'],
    industries: ['模具制造', '五金零件', '航空零件', '锻造', '机械制造', '热处理加工'],
    leadBullets,
  },
  'roller-mesh-belt-line': {
    series: '网带式热处理炉系列',
    title: '托辊型网带式电阻炉生产线',
    breadcrumbSeries: '热处理生产线',
    summary:
      '托辊型网带式电阻炉生产线是一种适用于连续化热处理作业的工业电阻加热设备，主要用于各类金属零件、标准件、五金件、轴承零件、冲压件、粉末冶金件及中小型工件的连续式淬火、回火、退火、正火、固溶、预热及烘干等工艺。设备采用网带连续输送结构，并通过托辊对网带进行支撑和导向，可提高网带运行稳定性，适合长时间连续生产和批量化热处理场景。',
    sellingPoints: ['定制化设计', '连续化生产', '运行稳定', '节能高效', '安全可靠'],
    quickTags: ['定制化设计', '连续化生产', '运行稳定', '节能高效', '安全可靠'],
    ctaHighlights,
    reasons: [
      { title: '满足工艺需求', text: '根据工件材质、热处理工艺、加热温度、保温时间和冷却要求，定制炉膛长度、加热分区、控温曲线和工艺节拍。' },
      { title: '贴合产线需求', text: '根据工件尺寸、单件重量、批量产能、上下料方式和现场布局，匹配网带宽度、托辊结构、输送速度和自动化程度。' },
      { title: '提升运行稳定性', text: '托辊结构可对网带形成连续支撑，减少网带下垂和跑偏风险，适合连续输送、批量生产和中长炉膛热处理产线。' },
      { title: '提高热处理一致性', text: '通过多区控温、稳定输送、热风循环和炉膛温度均匀性设计，提高工件受热一致性。' },
      { title: '降低综合能耗', text: '通过炉体保温结构、加热元件布置、热循环系统和分区控温优化，降低连续运行过程中的热损失。' },
      { title: '保障设备可靠性', text: '网带、托辊、传动系统、加热系统、炉衬结构和电控系统均按连续生产工况配置。' },
    ],
    customSpecs: [
      { key: '炉膛尺寸', value: '按工件尺寸、网带宽度、产能节拍和保温时间定制' },
      { key: '网带宽度', value: '300mm~1500mm，可按产线需求定制' },
      { key: '工作温度', value: '常见 650℃~950℃，高温配置可定制至 1050℃左右' },
      { key: '控温精度', value: '±3℃~±5℃，按控温系统配置确定' },
      { key: '温度均匀性', value: '±5℃~±10℃，按有效加热区和工艺要求确定' },
      { key: '加热方式', value: '电阻丝加热 / 电阻带加热 / 辐射管加热' },
      { key: '加热功率', value: '80kW~800kW，按炉膛尺寸、温度范围和产能要求配置' },
      { key: '输送方式', value: '网带连续输送，托辊支撑运行' },
      { key: '输送速度', value: '变频调速，按工艺节拍和保温时间设定' },
      { key: '控制系统', value: 'PLC控制 / 触摸屏操作 / 多区温控 / 变频输送控制' },
    ],
    configurations: [
      { title: '小型托辊型网带式电阻炉生产线', image: imagesBySlug['roller-mesh-belt-line'].configs[0], specs: ['工作温度：≤950℃', '网带宽度：300mm~600mm', '加热功率：80kW~200kW', '适用工件：小型五金件、标准件、冲压件、小型机械零件'] },
      { title: '中型托辊型网带式电阻炉生产线', image: imagesBySlug['roller-mesh-belt-line'].configs[1], specs: ['工作温度：≤950℃~1050℃', '网带宽度：600mm~1000mm', '加热功率：200kW~500kW', '适用工件：轴承零件、汽车零部件、粉末冶金件'] },
      { title: '大型托辊型网带式电阻炉生产线', image: imagesBySlug['roller-mesh-belt-line'].configs[0], specs: ['工作温度：按工艺要求定制', '网带宽度：1000mm~1500mm 或更大规格定制', '加热功率：500kW~800kW 及以上', '适用行业：热处理加工厂、汽车零部件、机械制造'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['淬火', '回火', '退火', '正火', '固溶', '预热', '烘干', '连续式热处理', '批量化热处理'],
    industries: ['机械制造', '汽车零部件', '五金制品', '紧固件', '轴承配件', '粉末冶金', '冲压件加工', '金属热处理加工', '标准件生产'],
    leadBullets,
  },
  'copper-wire-annealing-line': {
    series: '铜丝退火生产线系列',
    title: '铜丝自动化退火生产线',
    breadcrumbSeries: '热处理生产线',
    summary:
      '铜丝自动化退火生产线主要适用于铜丝、铜合金丝、铜线材及相关金属线材的连续式退火、软化退火、光亮退火和去应力处理工艺。设备可与放线、清洗、退火、冷却、烘干、收线及自动张力控制系统配套使用，实现铜丝从进线到退火、冷却、收卷的连续化生产。',
    sellingPoints: ['自动化连续生产', '退火均匀稳定', '张力控制精准', '节能高效', '安全可靠'],
    quickTags: ['自动化连续生产', '退火均匀稳定', '张力控制精准', '节能高效', '安全可靠'],
    ctaHighlights,
    reasons: [
      { title: '满足线材工艺需求', text: '根据铜丝材质、线径范围、退火温度、软化程度和表面质量要求，定制退火炉长度、加热功率、控温分区和工艺曲线。' },
      { title: '贴合生产节拍需求', text: '根据客户产能、线速度、收放线方式和现场布局，匹配自动放线、连续退火、冷却烘干、自动收线及张力控制系统。' },
      { title: '提升退火一致性', text: '通过稳定加热、连续输送、精准控温和恒张力控制，提高铜丝退火均匀性。' },
      { title: '改善铜丝表面质量', text: '可根据工艺要求配置保护气氛、冷却清洗、烘干和表面防氧化结构，提升表面光洁度。' },
      { title: '降低人工操作强度', text: '可配置自动放线、自动收线、张力控制、速度联动和集中电控系统，减少人工干预。' },
      { title: '保障长期运行稳定', text: '加热系统、传动系统、张力系统、冷却系统和电控系统均按连续生产工况配置。' },
    ],
    customSpecs: [
      { key: '适用材料', value: '紫铜丝 / 黄铜丝 / 铜合金丝 / 镀锡铜丝 / 其他金属线材' },
      { key: '线径范围', value: '0.1mm~8mm，可按实际线材规格定制' },
      { key: '退火温度', value: '300℃~750℃，按铜丝材质和工艺要求配置' },
      { key: '最高工作温度', value: '≤850℃，特殊工艺可定制' },
      { key: '生产速度', value: '5m/min~300m/min，按线径、退火时间和产能要求设定' },
      { key: '加热方式', value: '电阻加热 / 感应辅助加热 / 热风循环加热' },
      { key: '加热功率', value: '50kW~500kW，按炉体长度、线径范围和生产速度配置' },
      { key: '保护气氛', value: '氮气 / 氢氮混合气 / 惰性气体 / 按工艺要求配置' },
      { key: '张力控制', value: '恒张力控制 / 变频控制 / 伺服控制' },
      { key: '控制系统', value: 'PLC控制 / 触摸屏操作 / 温度速度联动 / 自动报警保护' },
    ],
    configurations: [
      { title: '小型铜丝自动化退火生产线', image: imagesBySlug['copper-wire-annealing-line'].configs[0], specs: ['适用线径：0.1mm~1.5mm', '退火温度：300℃~650℃', '生产速度：20m/min~150m/min', '适用产品：细铜丝、电子导线、精密铜线'] },
      { title: '中型铜丝自动化退火生产线', image: imagesBySlug['copper-wire-annealing-line'].configs[1], specs: ['适用线径：1.5mm~4mm', '退火温度：400℃~750℃', '生产速度：10m/min~100m/min', '适用产品：铜线、铜合金线、电缆导体'] },
      { title: '大型铜丝自动化退火生产线', image: imagesBySlug['copper-wire-annealing-line'].configs[0], specs: ['适用线径：4mm~8mm 或更大规格定制', '退火温度：按工艺要求定制', '生产速度：5m/min~60m/min', '适用产品：大规格铜线、重型线材连续退火'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['连续退火', '软化退火', '光亮退火', '去应力退火', '铜丝退火', '铜线退火', '保护气氛退火', '线材连续热处理'],
    industries: ['电线电缆', '铜材加工', '电子导线', '漆包线前处理', '新能源线束', '铜合金线材', '精密金属线材', '线缆导体制造'],
    leadBullets: ['免费方案定制', '按线径与退火工艺精准匹配', '专业方案团队', '全流程跟踪售后保障'],
  },
  'annealing-solution-line': {
    series: '连续式热处理生产线系列',
    title: '退火固溶生产线',
    breadcrumbSeries: '热处理生产线',
    summary:
      '退火固溶生产线主要适用于不锈钢带材、不锈钢卷材、奥氏体不锈钢、合金钢带材及相关金属材料的连续式退火、固溶处理、光亮退火、去应力处理和热处理加热工艺。设备可根据材料规格、板带宽度、厚度范围、卷重、工艺温度、生产速度和现场产线布局进行非标定制。',
    sellingPoints: ['连续化生产', '退火固溶稳定', '温度均匀性好', '自动化程度高', '节能高效', '安全可靠'],
    quickTags: ['连续化生产', '退火固溶稳定', '温度均匀性好', '自动化程度高', '节能高效', '安全可靠'],
    ctaHighlights,
    reasons: [
      { title: '满足材料工艺需求', text: '根据材料牌号、板带宽度、厚度范围、退火温度、固溶温度、保温时间和冷却速度要求，定制炉膛长度和工艺曲线。' },
      { title: '贴合连续产线需求', text: '根据产线节拍、卷材重量、开卷收卷方式、入口出口速度和现场空间布局，匹配整线系统。' },
      { title: '提升热处理质量', text: '通过多区控温、稳定输送、热循环优化和冷却段设计，改善退火固溶后的组织状态和表面质量。' },
      { title: '提高生产连续性', text: '可配置入口活套、出口活套、自动纠偏、张力控制和联动控制系统，减少停机等待。' },
      { title: '降低综合能耗', text: '通过炉体保温结构、加热分区控制、余热利用、热风循环和冷却系统优化降低能耗。' },
      { title: '保障长期运行稳定', text: '炉体结构、传动系统、辊道系统、加热系统、冷却系统和电控系统均按连续生产工况配置。' },
    ],
    customSpecs: [
      { key: '适用材料', value: '奥氏体不锈钢 / 不锈钢带材 / 合金钢带材 / 精密金属带材' },
      { key: '带材宽度', value: '600mm~1600mm，可按实际需求定制' },
      { key: '带材厚度', value: '0.2mm~6mm，可按材料与工艺要求定制' },
      { key: '最大卷重', value: '5吨~30吨，可按产线配置定制' },
      { key: '退火温度', value: '650℃~950℃，按材料工艺要求确定' },
      { key: '固溶温度', value: '1000℃~1150℃，特殊材料可按工艺定制' },
      { key: '最高工作温度', value: '≤1200℃，按炉型结构和加热系统配置确定' },
      { key: '生产速度', value: '5m/min~60m/min，按材料厚度和工艺要求设定' },
      { key: '冷却方式', value: '风冷 / 水冷 / 气雾冷却 / 分段冷却' },
      { key: '产线配置', value: '放卷、清洗、入口活套、退火固溶炉、冷却段、出口活套、收卷系统' },
    ],
    configurations: [
      { title: '中小型退火固溶生产线', image: imagesBySlug['annealing-solution-line'].configs[0], specs: ['适用材料：不锈钢带材、合金带材、精密金属带材', '适用宽度：600mm~1000mm', '工作温度：≤1100℃', '生产速度：5m/min~30m/min'] },
      { title: '标准型退火固溶生产线', image: imagesBySlug['annealing-solution-line'].configs[1], specs: ['适用材料：奥氏体不锈钢、不锈钢卷材、冷轧带材', '适用宽度：1000mm~1300mm', '工作温度：1050℃~1150℃', '生产速度：10m/min~45m/min'] },
      { title: '大型退火固溶生产线', image: imagesBySlug['annealing-solution-line'].configs[0], specs: ['适用材料：宽幅不锈钢带材、合金钢带材、高端金属卷材', '适用宽度：1250mm~1600mm 或更大规格定制', '最大卷重：≤20吨~30吨', '工作温度：按退火固溶工艺要求定制'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['连续退火', '固溶处理', '光亮退火', '去应力退火', '不锈钢退火', '不锈钢固溶', '钢带热处理', '卷材连续热处理'],
    industries: ['不锈钢加工', '金属带材加工', '钢带热处理', '冷轧带材生产', '精密合金材料', '新能源材料', '汽车零部件材料', '能源装备材料'],
    leadBullets: ['免费方案定制', '按材料规格与退火固溶工艺精准匹配', '专业方案团队', '全流程跟踪售后保障'],
  },
};

export const STATIC_PRODUCTS: StaticProduct[] = PRODUCT_CENTER_CATEGORIES.map((category) => {
  const imageSet = imagesBySlug[category.slug];
  const detail = productDetails[category.slug];
  const gallery = imageSet?.gallery.length ? imageSet.gallery : [category.image];

  return {
    id: category.id,
    slug: category.slug,
    model: category.model,
    name: category.name,
    category: category.name,
    summary: category.showcaseDescription,
    description: {
      zh: [detail.summary],
      en: [category.showcaseDescription.en],
    },
    image: gallery[0],
    gallery,
    features: commonFeatures,
    specs: detail.customSpecs,
    structureImages: imageSet?.configs.length ? imageSet.configs : gallery,
    industries: commonIndustries,
    detail,
  };
});

export function getStaticProductBySlug(slug: string) {
  return STATIC_PRODUCTS.find((product) => product.slug === slug) || null;
}

export function getStaticProductCards(locale: Locale, products = STATIC_PRODUCTS): ProductListCardItem[] {
  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    model: product.model,
    name: product.name,
    summary: product.summary,
    image: product.image,
  }));
}

export function getStaticProductSidebarItems(locale: Locale): SidebarItem[] {
  return STATIC_PRODUCTS.map((product) => ({
    label: product.name[locale],
    href: `/${locale}/products/detail/${product.slug}`,
    matchHrefs: [`/${locale}/products/detail/${product.slug}`],
  }));
}

export function getRelatedStaticProducts(slug: string, locale: Locale) {
  return getStaticProductCards(locale, STATIC_PRODUCTS.filter((product) => product.slug !== slug).slice(0, 4));
}
