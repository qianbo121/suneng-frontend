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

export type StaticProductGeoSection = {
  title: string;
  text?: string;
  items?: string[];
};

export type StaticProductFaqItem = {
  question: string;
  answer: string;
};

export type StaticProductRelatedLink = {
  title: string;
  description: string;
  href: string;
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
  parameterNote?: string;
  geoSections?: StaticProductGeoSection[];
  faq?: StaticProductFaqItem[];
  relatedLinks?: StaticProductRelatedLink[];
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

const commonParameterNote =
  '以上参数为常见配置范围，具体需结合工件尺寸、装炉量、工艺温度、温度均匀性要求、加热方式、生产节拍和现场条件确定，最终以双方确认的技术方案为准。';

function buildGeoSections(
  applicableText: string,
  processText: string,
  focusItems: string[],
): StaticProductGeoSection[] {
  return [
    { title: '适用工件', text: applicableText },
    { title: '典型工艺', text: processText },
    { title: '选型关注点', items: focusItems },
  ];
}

function buildRelatedLinks(serviceDescription: string, includeCase = false): StaticProductRelatedLink[] {
  const links: StaticProductRelatedLink[] = [
    {
      title: '工业炉节能改造与热处理炉大修服务',
      description: serviceDescription,
      href: '/zh/service/furnace-renovation-overhaul',
    },
    {
      title: '苏能实力',
      description: '查看苏能工业炉的企业基础、制造能力与资质边界说明。',
      href: '/zh/about/suneng-profile',
    },
    {
      title: '荣誉资质',
      description: '查看已公开展示的证书、资质与专利文件图库。',
      href: '/zh/strength/honors',
    },
  ];

  if (!includeCase) return links;

  return [
    ...links,
    {
      title: '工业炉节能改造案例参考',
      description: '查看连续热处理产线节能改造与大修项目的匿名案例参考。',
      href: '/zh/case/anonymous-tsingshan-1250-renovation',
    },
  ];
}

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
      '台车式热处理炉适用于大型铸件、锻件、模具、轴类工件及大型结构件的退火、回火、正火、淬火等热处理工艺。设备采用固定炉体与移动台车结构，便于大型工件装卸和整体加热处理。炉膛尺寸、台车承重、加热方式、炉门结构、控温系统及温度均匀性可根据工件尺寸、装炉量和工艺要求进行非标定制，适用于机械制造、模具制造、高端装备制造、能源装备、轨道交通、汽车零部件等领域。',
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
      { title: '高温合金台车炉', image: imagesBySlug['trolley-furnace'].configs[2], specs: ['工作温度：≤1350℃', '有效尺寸：按高温合金工件尺寸定制', '加热功率：1200kW~3000kW', '适用行业：高端装备制造、能源装备、高温合金热处理'] },
    ],
    processSteps: [
      { title: '需求沟通', text: '了解工件尺寸、装炉重量、热处理工艺、温度范围、产能节拍和现场条件。' },
      { title: '方案确认', text: '提供初步炉型方案、核心配置和设备布置建议，确认工艺目标与预算范围。' },
      { title: '方案设计', text: '完成炉体结构、台车承重、炉门形式、加热系统、控温系统和自动化配置设计。' },
      { title: '制造调试', text: '进行设备制造、系统装配、电气调试和出厂检验，确保设备满足设计要求。' },
      { title: '交付安装', text: '完成运输、安装、现场调试、操作培训和后续服务跟踪。' },
    ],
    processes: ['退火', '回火', '正火', '淬火', '固溶', '时效', '去应力处理等'],
    industries: ['汽车零部件', '机械加工', '模具制造', '轨道交通', '高端装备制造', '能源装备', '重工装备', '科研院所'],
    leadBullets,
    parameterNote:
      '以上参数为常见配置范围，具体需结合工件尺寸、装炉量、工艺温度、温度均匀性要求、加热方式、生产节拍和现场条件确定，最终以双方确认的技术方案为准。',
    geoSections: [
      {
        title: '适用工件',
        text:
          '台车炉适合处理大型铸件、锻件、焊接件、模具、结构件、机加工件等中大型工件，常用于单件重量较大、批量不固定、需要整炉装卸的热处理场景。具体炉膛尺寸、台车承载、炉门结构和装炉方式，应结合工件尺寸、重量和工艺节拍确定。',
      },
      {
        title: '典型工艺',
        text:
          '台车式热处理炉常用于退火、回火、正火、淬火前加热、时效、去应力处理等工艺。对于不同材质和不同工艺温度，需要分别确认炉衬结构、加热方式、控温分区、风机循环和温度均匀性要求。',
      },
      {
        title: '选型关注点',
        items: [
          '工件最大尺寸和单炉装炉量',
          '最高工作温度和常用工艺温度',
          '升温时间和保温时间',
          '温度均匀性要求',
          '台车承载和轨道基础',
          '炉门密封和炉衬结构',
          '电加热或燃气加热方式',
          '控制系统和数据记录要求',
          '是否需要后续节能改造或大修服务',
        ],
      },
    ],
    faq: [
      {
        question: '台车炉适合哪些工件？',
        answer:
          '台车炉适合大型铸件、锻件、焊接件、模具、结构件等中大型工件，尤其适合单件较重、需要整炉装卸或不适合连续输送的热处理场景。具体炉膛尺寸和台车承载需要结合工件尺寸、重量、装炉方式和工艺要求确定。',
      },
      {
        question: '台车炉和箱式炉有什么区别？',
        answer:
          '台车炉通常带有可移动台车，适合较重或体积较大的工件装卸；箱式炉结构更紧凑，适合中小型工件或小批量热处理。两者都可以做非标设计，选择时要看工件尺寸、装炉量、搬运方式和生产节拍。',
      },
      {
        question: '台车式热处理炉的炉膛尺寸可以定制吗？',
        answer:
          '可以。台车炉通常属于非标定制设备，炉膛尺寸、台车承载、炉门形式、加热方式、控温分区和控制系统都需要根据工件和工艺要求确定。最终参数应以双方确认的技术方案为准。',
      },
      {
        question: '台车炉如何判断功率和装炉量？',
        answer:
          '功率和装炉量需要结合工件材质、重量、炉膛尺寸、目标温度、升温时间、保温时间、炉衬结构和加热方式综合计算，不能只按炉膛体积简单判断。对于非标项目，建议由工业炉厂家根据工艺条件进行核算。',
      },
      {
        question: '老旧台车炉可以做节能改造吗？',
        answer:
          '可以评估。苏能可对自制设备及部分非苏能品牌台车炉提供评估，进口炉或资料不完整的设备需结合设备资料、控制系统、备件条件和现场状态综合判断。老旧台车炉常见改造方向包括炉衬翻新、炉门密封修复、加热系统更换、控制系统升级、风机或燃烧系统优化等。是否值得改造，需要结合炉体状态、使用年限、能耗数据、生产负荷和停产窗口判断。',
      },
    ],
    relatedLinks: [
      {
        title: '工业炉节能改造与热处理炉大修服务',
        description: '了解老旧台车炉、热处理炉的炉衬、密封、加热和控制系统评估思路。',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: '苏能实力',
        description: '查看苏能工业炉的企业基础、制造能力与资质边界说明。',
        href: '/zh/about/suneng-profile',
      },
      {
        title: '荣誉资质',
        description: '查看已公开展示的证书、资质与专利文件图库。',
        href: '/zh/strength/honors',
      },
    ],
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
      { title: '大型工业井式炉', image: imagesBySlug['pit-furnace'].configs[2], specs: ['工作温度：≤1250℃', '有效尺寸：按大型长轴、筒类或杆类工件定制', '加热功率：500kW~1200kW', '适用行业：大型零件、轨道交通、能源装备、重工装备'] },
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
      '辊底炉适用于板材、棒材、管材、锻件、钢材条料及较重工件的连续式退火、正火、回火、固溶和热处理加热工艺。设备通过炉辊输送工件连续进出炉膛，适合中大型工件、连续生产线和对生产节拍要求较高的热处理场景。炉膛长度、辊道结构、加热分区、输送速度、控温系统和气氛保护可根据产线要求进行非标定制，适用于钢材加工、大型板材、机械制造、能源装备、高端装备零部件等领域。',
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
      { title: '大型辊底炉', image: imagesBySlug['roller-hearth-furnace'].configs[1], specs: ['工作温度：≤1250℃', '有效尺寸：按大型板材、棒材、管材或较重工件定制', '加热功率：500kW~1500kW', '适用行业：大型板材、能源装备、高端装备零部件、连续热处理产线'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['正火', '退火', '淬火', '回火', '固溶', '连续式热处理'],
    industries: ['钢材加工', '大型板材', '棒材管材', '机械制造', '能源装备', '高端装备零部件'],
    leadBullets,
  },
  'rotary-hearth-furnace': {
    series: '转底炉系列',
    title: '转底炉（非标定制）',
    breadcrumbSeries: '转底炉系列',
    summary:
      '转底炉通过旋转炉底带动工件在炉膛内按节拍运行，适用于锻件、盘类工件、环形工件、模具、五金零件及部分高端装备零件的热处理加热、锻造加热、退火、正火、回火等工艺。设备适合工件连续加热、节拍式生产和自动化上下料配套场景。炉底直径、旋转速度、加热分区、装出料方式、控温系统和气氛保护可根据工件规格、产能节拍和工艺制度进行非标定制，适用于锻造、机械制造、模具制造、五金加工、高端装备零部件等领域。',
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
      { title: '大型转底炉', image: imagesBySlug['rotary-hearth-furnace'].configs[1], specs: ['工作温度：≤1250℃', '有效尺寸：按模具、锻件、高端装备零件或批量加热工件定制', '加热功率：300kW~1200kW', '适用行业：模具、锻造、高端装备零部件、机械制造'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['正火', '退火', '淬火', '回火', '锻造加热', '热处理加热'],
    industries: ['模具制造', '五金零件', '高端装备零部件', '锻造', '机械制造', '热处理加工'],
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
      { key: '加热方式', value: '电加热 / 热风循环辅助加热 / 按工艺方案配置' },
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

const productGeoEnhancements: Partial<
  Record<string, Pick<StaticProductDetail, 'parameterNote' | 'geoSections' | 'faq' | 'relatedLinks'>>
> = {
  'roller-mesh-belt-line': {
    parameterNote: commonParameterNote,
    geoSections: buildGeoSections(
      '托辊型网带式电阻炉生产线适合小型零件、紧固件、标准件、冲压件、粉末冶金件和批量连续热处理件。工件尺寸、单件重量、堆放方式和批量节拍会影响网带宽度、托辊结构、炉膛长度和上下料方式，需要结合现场产线条件确认。',
      '该类生产线常用于连续淬火、回火、正火、退火和批量连续热处理。是否配置淬火槽、回火段、清洗烘干或保护气氛，需要结合材料牌号、热处理曲线、冷却方式和表面质量要求评估。',
      ['网带宽度与有效装料宽度', '网带材质和托辊支撑结构', '运行速度和保温时间', '加热区长度和控温分区', '冷却方式和前后段衔接', '连续生产节拍和上下料方式'],
    ),
    faq: [
      {
        question: '托辊型网带炉适合哪些零件？',
        answer:
          '托辊型网带炉适合小型零件、紧固件、标准件、冲压件、粉末冶金件及其他批量连续热处理件。选型时需要确认工件尺寸、单件重量、堆放厚度、热处理工艺和产能节拍，再确定网带宽度、炉膛长度和上下料方式。',
      },
      {
        question: '托辊型网带炉和普通网带炉有什么区别？',
        answer:
          '托辊型结构会通过托辊对网带形成支撑和导向，更适合中长炉膛、连续运行时间较长或装料相对稳定的生产线。具体是否需要托辊结构，要结合网带宽度、工件重量、运行速度、炉膛温度和维护方式综合判断。',
      },
      {
        question: '网带宽度和运行速度怎么确定？',
        answer:
          '网带宽度通常由工件外形、摆放方式和有效装料宽度决定，运行速度则与加热时间、保温时间、冷却方式和产能节拍相关。两者需要与加热区长度、温区数量和前后工序联动核算，最终以确认的技术方案为准。',
      },
      {
        question: '托辊型网带炉可以连续淬火回火吗？',
        answer:
          '可以按项目评估连续淬火、回火或淬回火配套生产线，但需要确认工件材质、淬火介质、冷却强度、回火温度、节拍和现场布置。涉及淬火槽、清洗、烘干、回火炉等配置时，应按完整工艺路线设计。',
      },
      {
        question: '老旧网带生产线可以改造吗？',
        answer:
          '可以先做现场评估，重点查看炉衬状态、网带和托辊磨损、加热元件、传动系统、温控系统、保温密封和能耗数据。是否适合改造，需要结合设备年限、停产窗口、备件条件和改造后工艺目标判断。',
      },
    ],
    relatedLinks: buildRelatedLinks('了解老旧网带炉、连续热处理生产线的炉衬、传动、加热和控制系统评估思路。', true),
  },
  'copper-wire-annealing-line': {
    parameterNote: commonParameterNote,
    geoSections: buildGeoSections(
      '铜丝自动化退火生产线适合铜丝、铜线、铜合金线材和部分有色金属线材的连续退火或软化处理。线径范围、线材材质、表面状态、放线收线方式和张力控制要求，会直接影响炉体长度、速度联动和保护气氛配置。',
      '常见工艺包括连续退火、软化处理和去应力处理；光亮退火需要按项目评估保护气氛、密封结构、露点控制和冷却方式。不同线径和材质对应的退火温度、停留时间和表面质量要求应单独确认。',
      ['线径范围和材质牌号', '放线收线方式与张力控制', '运行速度和退火停留时间', '温区长度与控温分区', '气氛保护和密封需求', '表面质量、冷却和烘干要求'],
    ),
    faq: [
      {
        question: '铜丝退火生产线适合哪些线材？',
        answer:
          '铜丝退火生产线适合紫铜丝、黄铜丝、铜合金线、镀锡前后相关线材及部分有色金属线材。实际方案需要结合线径范围、线材状态、目标软化程度、表面质量要求和收放线方式确定，不同材料不宜直接套用同一配置。',
      },
      {
        question: '铜丝退火温度和线径有什么关系？',
        answer:
          '退火温度、线径和运行速度需要联动考虑。线径越大，热透时间通常越长；线径较细时，还要关注张力、表面氧化和断线风险。最终温度曲线应结合材料牌号、退火目标、炉体长度和生产速度确认。',
      },
      {
        question: '连续退火生产线速度怎么确定？',
        answer:
          '生产线速度由线径、材料、退火温度、炉内有效加热长度、冷却方式和收放线能力共同决定。设计时需要核算线材在炉内的停留时间，并与张力控制、表面质量和后续收卷节拍匹配。',
      },
      {
        question: '铜丝退火生产线是否需要保护气氛？',
        answer:
          '是否配置保护气氛取决于线材表面质量、氧化控制、光亮退火目标和生产成本。普通软化退火与光亮退火的密封、气体、冷却和安全配置不同，需要按工艺目标和现场条件单独评估。',
      },
      {
        question: '老旧铜丝退火线可以节能改造吗？',
        answer:
          '可以评估炉体保温、加热元件、温控系统、传动张力、密封结构、冷却烘干和余热利用等方向。是否改造需要看现有设备状态、产能瓶颈、能耗数据、产品表面质量和停机窗口，不能只按设备年限判断。',
      },
    ],
    relatedLinks: buildRelatedLinks('了解老旧退火炉、线材退火生产线的保温、加热、传动和控制系统评估思路。'),
  },
  'annealing-solution-line': {
    parameterNote: commonParameterNote,
    geoSections: buildGeoSections(
      '退火固溶生产线适合不锈钢带材、有色金属带材、合金带材以及需要连续退火或固溶处理的卷带类材料。带宽、厚度、卷重、材料牌号、表面质量和张力控制要求，会影响炉长、温区、冷却段和整线布置。',
      '常见工艺包括连续退火、固溶处理、去应力处理和连续热处理；光亮退火或特殊气氛工艺需要按项目评估。固溶温度、保温时间、冷却速度和张力控制应结合材料牌号与产品标准确认。',
      ['带宽、厚度和卷重范围', '运行速度与炉内停留时间', '温区长度和炉温均匀性', '冷却段形式和冷却能力', '张力控制、纠偏和活套配置', '现有产线节能改造空间'],
    ),
    faq: [
      {
        question: '退火固溶生产线适合哪些材料？',
        answer:
          '退火固溶生产线适合不锈钢带材、有色金属带材、合金带材和需要连续热处理的卷带类材料。具体能否采用同一生产线，需要结合材料牌号、带宽厚度、卷重、表面质量要求和退火或固溶工艺曲线评估。',
      },
      {
        question: '连续退火生产线和单台退火炉有什么区别？',
        answer:
          '连续退火生产线通常包含放卷、清洗、加热、冷却、张力控制、纠偏和收卷等环节，适合稳定批量生产；单台退火炉更适合离散装炉或批量不固定场景。选择时要看产能、材料形态和现场流程。',
      },
      {
        question: '生产线速度如何确定？',
        answer:
          '生产线速度需要结合材料厚度、目标温度、炉内有效长度、保温时间、冷却速度、张力控制和前后工序能力确定。速度不是单独参数，应与温区数量、冷却段和整线自动化配置一起核算。',
      },
      {
        question: '固溶温度和材料牌号有什么关系？',
        answer:
          '不同材料牌号对应的固溶温度、保温时间和冷却要求不同，不能只按设备最高温度判断。方案设计应由材料工艺要求出发，结合带材厚度、运行速度、冷却方式和炉温均匀性确定。',
      },
      {
        question: '退火固溶生产线能否做节能改造？',
        answer:
          '可以评估炉体保温、加热系统、热风循环、冷却段、排烟余热、传动系统和控制逻辑等方向。是否值得改造，需要结合现有炉况、能耗数据、产能目标、产品质量问题和停产窗口综合判断。',
      },
    ],
    relatedLinks: buildRelatedLinks('了解退火固溶生产线、连续热处理炉的炉衬、加热、冷却和自动化系统评估思路。', true),
  },
  'box-furnace': {
    parameterNote: commonParameterNote,
    geoSections: buildGeoSections(
      '箱式炉适合中小型零件、模具件、试制件、小批量工件和多品种热处理任务。工件尺寸、装炉方式、批量频次、炉门开启方式和实验或生产用途，会影响炉膛尺寸、加热元件布置和控制系统配置。',
      '常见工艺包括退火、回火、正火、淬火前加热、时效和去应力处理。不同工艺对应的温度范围、升温速度、保温时间和气氛需求不同，炉膛结构和加热方式应按具体工艺条件确认。',
      ['炉膛尺寸和有效工作区', '单炉装炉量与工装方式', '最高温度和常用工艺温度', '加热元件形式和维护便利性', '控温精度与温度均匀性', '炉门开启方式和操作空间'],
    ),
    faq: [
      {
        question: '箱式炉适合哪些工件？',
        answer:
          '箱式炉适合中小型零件、模具件、工装件、试制件和小批量多品种工件，常用于退火、回火、正火、时效和去应力处理等场景。具体炉膛尺寸和加热方式需要结合工件尺寸、装炉量和使用频率确定。',
      },
      {
        question: '箱式炉和台车炉有什么区别？',
        answer:
          '箱式炉结构更紧凑，适合中小型工件、小批量或实验试制；台车炉通常适合较大、较重或需要整炉装卸的工件。两者选择要看工件尺寸重量、搬运方式、单炉装炉量和现场操作空间。',
      },
      {
        question: '箱式炉炉膛尺寸怎么确定？',
        answer:
          '炉膛尺寸需要根据工件最大外形、工装夹具、装炉间距、有效加热区和操作方式确定，不能只按单件尺寸放大。还要考虑温度均匀性、炉门开启空间、装卸方式和后续可能增加的产品规格。',
      },
      {
        question: '箱式电阻炉功率怎么估算？',
        answer:
          '功率需要结合炉膛容积、炉衬结构、目标温度、升温时间、装炉量、工件材质和热处理节拍计算。初步范围可以参考常见配置，但项目报价和制造参数应以确认后的技术方案为准。',
      },
      {
        question: '箱式炉可以非标定制吗？',
        answer:
          '可以。箱式炉可围绕炉膛尺寸、温度等级、加热方式、炉门结构、控温系统、气氛保护和安全联锁做非标设计。定制前需要明确工件、工艺、装炉方式、现场能源条件和验收口径。',
      },
    ],
    relatedLinks: buildRelatedLinks('了解老旧箱式炉、热处理炉的炉衬、炉门密封、加热元件和控制系统评估思路。'),
  },
  'pit-furnace': {
    parameterNote: commonParameterNote,
    geoSections: buildGeoSections(
      '井式炉适合轴类、杆类、套筒类、长轴件和需要竖向装炉的工件。工件长度、直径、吊装方式、装炉重量和变形控制要求，会影响井深、有效直径、炉盖结构、吊具和安全操作配置。',
      '常见工艺包括淬火、回火、退火、时效和去应力处理。是否配置气氛保护、热风循环或特殊吊装结构，需要结合材料、工件长径比、温度均匀性要求和现场操作方式评估。',
      ['井深、有效直径和有效加热区', '工件长度、重量与吊装方式', '炉盖结构和密封形式', '温度均匀性和控温分区', '装出炉安全操作和现场空间', '控制系统、联锁和数据记录要求'],
    ),
    faq: [
      {
        question: '井式炉适合哪些工件？',
        answer:
          '井式炉适合轴类、杆类、套筒类、长轴件和需要竖向装炉的工件，适用于对垂直装炉、受热一致性或变形控制有要求的热处理场景。具体井深、直径和吊装方式需要按工件尺寸与重量确定。',
      },
      {
        question: '井式炉和台车炉怎么选？',
        answer:
          '井式炉更适合长轴、杆类或竖向装炉工件，台车炉更适合大型、较重或需要水平整炉装卸的工件。选择时要比较工件形态、装卸方式、炉膛利用率、温度均匀性要求和车间空间。',
      },
      {
        question: '井式炉可以做淬火和回火吗？',
        answer:
          '井式炉可以按项目配置用于淬火前加热、回火、退火、时效和去应力处理等工艺。具体配置需要结合材料牌号、工件尺寸、淬火介质、转移方式和温度均匀性要求确定。',
      },
      {
        question: '井式炉直径和深度如何确定？',
        answer:
          '井式炉直径和深度要根据工件最大长度、直径、吊具、装炉间距、有效加热区和炉盖结构确定。设计时还要考虑装卸空间、吊装安全、炉口操作高度和后续产品规格变化。',
      },
      {
        question: '老旧井式炉可以升级控制系统吗？',
        answer:
          '可以评估控制柜、温控仪表、热电偶、加热回路、联锁保护、数据记录和安全报警等升级内容。是否适合改造，还需要结合炉体状态、加热元件、炉衬寿命和现场电气条件判断。',
      },
    ],
    relatedLinks: buildRelatedLinks('了解老旧井式炉、热处理炉的炉衬、加热、炉盖密封和控制系统升级评估思路。'),
  },
  'bell-furnace': {
    parameterNote: commonParameterNote,
    geoSections: buildGeoSections(
      '罩式炉适合卷材、小型零件、批量装框零件以及需要罩式加热或整体保温的工件。装料高度、炉罩尺寸、炉台结构、密封条件和冷却方式，会影响炉体结构、气氛配置和生产节拍。',
      '常见工艺包括退火、回火和保温处理；保护气氛热处理需要按项目评估炉罩密封、气体系统、安全联锁和冷却方式。不同装料方式下的温度均匀性和升温时间应单独核算。',
      ['炉罩尺寸、炉台尺寸和装料高度', '装料方式、料框或工装结构', '密封结构和气氛条件', '冷却方式和出炉节拍', '温度均匀性与热循环配置', '炉罩升降、吊装和现场空间'],
    ),
    faq: [
      {
        question: '罩式炉适合哪些热处理场景？',
        answer:
          '罩式炉适合卷材、小型零件、批量装框零件、线材盘卷和需要整体罩式加热的工件，可用于退火、回火、保温等工艺。方案需要结合装料高度、炉罩尺寸、密封要求和冷却方式确定。',
      },
      {
        question: '罩式炉和箱式炉有什么区别？',
        answer:
          '罩式炉通常由炉罩与炉台组合，适合批量装框、盘卷或需要罩式加热的场景；箱式炉结构更固定，适合中小型零件和小批量多品种任务。选择时要看装料方式、操作空间和气氛需求。',
      },
      {
        question: '罩式炉是否可以配置保护气氛？',
        answer:
          '可以按项目评估保护气氛配置，但需要确认工艺目标、密封结构、气体种类、安全联锁、排气方式和冷却条件。保护气氛系统与普通空气炉配置差异较大，应按现场条件和工艺要求设计。',
      },
      {
        question: '罩式炉装料方式如何确定？',
        answer:
          '装料方式通常由工件形态、料框结构、单炉装料量、吊装条件和生产节拍决定。设计时要同时考虑有效加热区、热循环通道、装出炉效率、炉台承载和后续维护便利性。',
      },
      {
        question: '老旧罩式炉可以大修吗？',
        answer:
          '可以评估炉罩、炉台、密封结构、炉衬、加热元件、风机循环、气氛系统和控制系统的状态。是否大修需要结合设备年限、备件条件、现有故障、能耗数据和未来产能需求判断。',
      },
    ],
    relatedLinks: buildRelatedLinks('了解老旧罩式炉、热处理炉的炉罩、密封、炉衬、气氛和控制系统评估思路。'),
  },
  'pusher-furnace': {
    parameterNote: commonParameterNote,
    geoSections: buildGeoSections(
      '推杆炉适合批量连续热处理工件、棒材、坯料、结构件以及使用料盘或料框承载的生产场景。工件形态、料盘尺寸、推料节拍、温区数量和出料方式，会影响推杆机构、炉膛长度和整线布置。',
      '常见工艺包括连续加热、正火、退火和淬火前加热。是否配套冷却、回火或保护气氛，需要结合工件材质、装料方式、工艺曲线、节拍要求和现场前后工序确定。',
      ['推料机构和推力裕量', '料盘、料框和工装尺寸', '生产节拍与炉内停留时间', '温区数量和加热区长度', '进出料方式和前后工序衔接', '炉底结构、密封和维护便利性'],
    ),
    faq: [
      {
        question: '推杆炉适合哪些连续热处理工件？',
        answer:
          '推杆炉适合批量稳定、可用料盘或料框承载的连续热处理工件，如棒材、坯料、结构件和部分批量零件。具体能否采用推杆方式，需要看工件重量、摆放方式、节拍和出料衔接。',
      },
      {
        question: '推杆炉和网带炉有什么区别？',
        answer:
          '推杆炉通常通过料盘、料框或工装承载工件，适合较重或对装料位置有要求的连续处理；网带炉适合小件和标准件连续输送。选择时要看工件尺寸重量、节拍、温度和维护方式。',
      },
      {
        question: '推杆炉节拍如何确定？',
        answer:
          '推杆炉节拍由装料量、炉内有效长度、温区数量、保温时间、加热速度和后续出料能力共同决定。设计时需要把推料周期、料盘间距、升温曲线和冷却或转运节奏一起核算。',
      },
      {
        question: '推杆炉的推料机构需要关注什么？',
        answer:
          '推料机构需要关注推力裕量、料盘摩擦、导轨耐热、定位精度、卡料处理、联锁保护和维护空间。工件重量、炉温、炉底结构和连续运行时间都会影响机构选型。',
      },
      {
        question: '老旧推杆炉可以做节能改造吗？',
        answer:
          '可以评估炉衬保温、炉门密封、加热系统、推料机构、温控分区、传动系统和自动化控制。是否改造需要结合炉体状态、节拍瓶颈、能耗数据、备件条件和停产窗口综合判断。',
      },
    ],
    relatedLinks: buildRelatedLinks('了解老旧推杆炉、连续热处理炉的炉衬、推料机构、加热和控制系统评估思路。', true),
  },
  'mesh-belt-furnace': {
    parameterNote: commonParameterNote,
    geoSections: buildGeoSections(
      '网带炉适合紧固件、小型零件、冲压件、标准件和批量连续热处理件。工件尺寸、单件重量、装料厚度、网带宽度、运行速度和冷却方式，会影响炉膛长度、温区配置和连续生产稳定性。',
      '常见工艺包括淬火、回火、退火和正火。需要连续淬火回火或气氛保护时，应结合材料牌号、热处理曲线、冷却介质、清洗烘干和回火段配置进行整线评估。',
      ['网带宽度和承载能力', '运行速度与保温时间', '加热区长度和控温分区', '冷却方式与淬火配套', '气氛需求和密封结构', '连续生产稳定性和维护周期'],
    ),
    faq: [
      {
        question: '网带炉适合哪些零件？',
        answer:
          '网带炉适合紧固件、小型零件、冲压件、标准件和其他批量连续热处理件，尤其适合尺寸较小、批量稳定、可连续铺料输送的工件。选型时需要结合单件重量、装料厚度和工艺节拍确认。',
      },
      {
        question: '网带炉和箱式炉有什么区别？',
        answer:
          '网带炉强调连续进出料和批量稳定生产，适合节拍固定的小件热处理；箱式炉更适合离散装炉、多品种小批量或试制任务。选择时要看产能需求、工件形态和现场前后工序。',
      },
      {
        question: '网带炉适合连续热处理吗？',
        answer:
          '网带炉本身就是常见连续热处理炉型，可按项目配置加热、冷却、回火、清洗或烘干等环节。具体工艺路线需要结合材料、目标硬度、温度曲线、冷却方式和产线节拍确定。',
      },
      {
        question: '网带炉如何选择网带宽度和速度？',
        answer:
          '网带宽度由工件尺寸、铺料方式和有效装料宽度决定，速度由炉内停留时间、加热区长度、保温时间和产能节拍决定。两项参数需要联合计算，最终以确认的技术方案为准。',
      },
      {
        question: '网带炉可以配套淬火和回火吗？',
        answer:
          '可以按项目配置淬火槽、回火炉、清洗、烘干和输送衔接，但需要确认工件材质、冷却介质、转运时间、回火温度和现场布置。完整生产线应按工艺路线和验收要求整体设计。',
      },
    ],
    relatedLinks: buildRelatedLinks('了解老旧网带炉、连续热处理炉的炉衬、网带传动、加热和控制系统评估思路。', true),
  },
  'roller-hearth-furnace': {
    parameterNote: commonParameterNote,
    geoSections: buildGeoSections(
      '辊底炉适合板材、管材、棒材以及中大型连续热处理工件。工件重量、长度、直线度、辊道接触方式、运行速度和炉膛密封要求，会影响辊道材质、传动结构、温区控制和整线布置。',
      '常见工艺包括退火、正火、回火和连续热处理；固溶处理需要按项目评估材料牌号、温度制度、冷却速度和辊道耐热条件。不同工件截面和重量对应的输送方式应单独确认。',
      ['辊道材质、直径和耐热等级', '工件重量、长度和支撑方式', '运行速度与炉内停留时间', '温区控制和炉温均匀性', '辊底传动、密封和维护空间', '冷却段、上下料和前后工序衔接'],
    ),
    faq: [
      {
        question: '辊底炉适合哪些工件？',
        answer:
          '辊底炉适合板材、管材、棒材和中大型连续热处理工件，尤其适合需要连续输送、工件相对较重或长度较大的场景。具体方案需要结合工件重量、长度、支撑方式和热处理工艺确定。',
      },
      {
        question: '辊底炉和推杆炉有什么区别？',
        answer:
          '辊底炉通过炉辊直接或间接输送工件，适合板材、棒材、管材等连续输送；推杆炉通常通过料盘或料框按节拍推进。两者选择取决于工件形态、重量、节拍和维护方式。',
      },
      {
        question: '辊底炉运行速度怎么确定？',
        answer:
          '运行速度由工件规格、目标温度、炉膛有效长度、保温时间、温区数量、冷却方式和上下料能力决定。设计时需要确保工件在各温区有足够停留时间，并与前后工序节拍匹配。',
      },
      {
        question: '辊底炉对辊道材质有什么要求？',
        answer:
          '辊道材质需要根据工作温度、工件重量、炉内气氛、运行频率和维护周期选择。高温或重载工况下，还要关注辊道变形、氧化、轴承密封、传动同步和备件更换便利性。',
      },
      {
        question: '老旧辊底炉可以改造吗？',
        answer:
          '可以评估炉衬保温、炉辊磨损、传动系统、加热系统、温控分区、密封结构和自动化控制。是否改造需要结合炉体状态、辊道寿命、能耗数据、产能瓶颈和停产窗口判断。',
      },
    ],
    relatedLinks: buildRelatedLinks('了解老旧辊底炉、连续热处理炉的炉辊、传动、炉衬、加热和控制系统评估思路。', true),
  },
  'rotary-hearth-furnace': {
    parameterNote: commonParameterNote,
    geoSections: buildGeoSections(
      '转底炉适合环形布料、模具、锻件、小中型批量工件和需要节拍式连续加热的工件。炉底直径、旋转机构、装料方式、工件重量和进出料节拍，会影响炉膛分区、炉底承载和上下料布置。',
      '常见工艺包括加热、退火、正火、回火和时效处理。涉及锻造加热或节拍式连续生产时，需要确认工件摆放、加热均匀性、出料温度、旋转速度和现场自动化衔接。',
      ['炉底直径和有效布料区域', '旋转机构、承载和定位方式', '装料方式与工件重量', '加热均匀性和温区分布', '进出料节拍和自动化衔接', '炉底密封、维护和安全联锁'],
    ),
    faq: [
      {
        question: '转底炉适合哪些工件？',
        answer:
          '转底炉适合环形布料、模具、锻件、小中型批量工件和需要节拍式连续加热的工件。是否适合采用转底结构，需要结合工件重量、摆放方式、加热节拍、进出料方式和现场空间判断。',
      },
      {
        question: '转底炉和台车炉有什么区别？',
        answer:
          '转底炉通过旋转炉底实现节拍式加热和连续进出料，适合批量节拍较稳定的场景；台车炉更适合大型或较重工件整炉装卸。选择时要看工件尺寸、装料方式和生产节拍。',
      },
      {
        question: '转底炉加热均匀性如何控制？',
        answer:
          '转底炉加热均匀性需要从温区布置、炉底转速、工件摆放、燃烧或电加热布置、炉膛循环和测温点配置等方面控制。具体均匀性指标应结合有效工作区和工艺要求确认。',
      },
      {
        question: '转底炉装料方式如何确定？',
        answer:
          '装料方式由工件形态、单件重量、加热节拍、自动化程度和进出料位置决定。设计时需要考虑有效布料区域、工件间距、转底承载、定位方式和操作维护空间。',
      },
      {
        question: '老旧转底炉可以做大修或控制系统升级吗？',
        answer:
          '可以评估炉底旋转机构、密封结构、炉衬、加热系统、温控分区、安全联锁和电控系统。是否大修或升级，需要结合炉体状态、故障记录、备件条件、生产负荷和停产窗口判断。',
      },
    ],
    relatedLinks: buildRelatedLinks('了解老旧转底炉、热处理炉的旋转机构、炉衬、加热、密封和控制系统评估思路。'),
  },
};

export const STATIC_PRODUCTS: StaticProduct[] = PRODUCT_CENTER_CATEGORIES.map((category) => {
  const imageSet = imagesBySlug[category.slug];
  const baseDetail = productDetails[category.slug];
  const enhancement = productGeoEnhancements[category.slug];
  const detail = enhancement ? { ...baseDetail, ...enhancement } : baseDetail;
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
