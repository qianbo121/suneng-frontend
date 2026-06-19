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

export type StaticProductInfoCard = {
  title: string;
  text: string;
};

export type StaticProductComparisonRow = {
  left?: string;
  middle?: string;
  right?: string;
  trolley?: string;
  box?: string;
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

export type StaticProductLeadForm = {
  title: string;
  description: string;
  submitLabel: string;
  contactHref: string;
  contactLabel: string;
  phone: string;
  email: string;
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
  heroCtas?: StaticProductRelatedLink[];
  workpieceCards?: StaticProductInfoCard[];
  processCards?: StaticProductInfoCard[];
  structureComponents?: StaticProductInfoCard[];
  priceFactors?: string[];
  comparisonRows?: StaticProductComparisonRow[];
  industryCards?: StaticProductInfoCard[];
  scenarioCards?: StaticProductInfoCard[];
  workpieceTitle?: string;
  processCardsTitle?: string;
  scenarioIntro?: string;
  parameterTitle?: string;
  parameterLink?: StaticProductRelatedLink;
  structureTitle?: string;
  priceFactorsTitle?: string;
  priceFactorsIntro?: string;
  comparisonTitle?: string;
  comparisonHeaders?: string[];
  processStepsTitle?: string;
  leadForm?: StaticProductLeadForm;
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

export const imagesBySlug: Record<string, { gallery: string[]; configs: string[] }> = {
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
    title: '箱式炉｜箱式热处理炉定制',
    breadcrumbSeries: '箱式炉系列',
    summary:
      '箱式炉适用于中小型工件、模具、机械零件、试制件、小批量工件等周期式热处理场景。苏能可根据工件尺寸、单件重量、装炉量、最高温度、工艺曲线和现场条件，提供箱式热处理炉非标定制方案。',
    sellingPoints: ['中小型工件热处理', '炉膛尺寸定制', '温度等级可选', '箱式电阻炉定制'],
    quickTags: ['中小型工件热处理', '退火 / 回火 / 正火', '箱式电阻炉定制', '温度等级可选', '炉膛尺寸定制', 'PLC 控制系统'],
    ctaHighlights: ['成立于 2006 年', '14700㎡生产基地', '非标箱式炉定制'],
    heroCtas: [
      {
        title: '获取报价方案',
        description: '滚动到询价表单，提交箱式炉参数。',
        href: '#product-lead-form',
      },
      {
        title: '查看报价需要哪些参数',
        description: '了解工业炉报价前建议准备的资料。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
    ],
    reasons: [
      { title: '按工件定制炉膛', text: '根据工件最大外形、装炉间隙、料框或工装方式，确定炉膛有效尺寸。' },
      { title: '按温度配置材料', text: '结合最高温度、常用工作温度和升降温制度，匹配炉衬与加热元件。' },
      { title: '按批量匹配承载', text: '围绕单件重量、每炉装炉量和装料方式，设计炉底板、料框和支撑结构。' },
      { title: '按工艺配置控制', text: '可根据退火、回火、正火、时效等工艺配置多区控温、记录和报警保护。' },
      { title: '按现场明确交付', text: '结合车间空间、电源、吊装和安装边界，明确制造、调试和售后服务范围。' },
    ],
    workpieceCards: [
      { title: '中小型机械零件', text: '适合机加工件、结构小件和常规金属零件的退火、回火或去应力处理。' },
      { title: '模具', text: '适合中小型模具、工装和厚壁件热处理，需关注支撑方式和温度均匀性。' },
      { title: '试制件', text: '适合新品试制、材料验证和工艺摸索阶段的小批量热处理任务。' },
      { title: '小批量工件', text: '适合批量不大、规格变化较多、装卸相对简单的周期式热处理。' },
      { title: '铸锻件', text: '可用于部分中小型铸件、锻件的退火、正火或去应力处理。' },
      { title: '焊接件', text: '常用于中小型焊接件的焊后去应力或回火处理，需确认变形控制。' },
      { title: '结构件', text: '适合可人工或简易工装装卸的中小型结构件整体加热。' },
      { title: '实验或工艺验证件', text: '适合热处理参数验证、材料对比和小批次试验生产。' },
    ],
    workpieceTitle: '箱式炉适合哪些工件？',
    processCards: [
      { title: '退火', text: '适用于中小型零件、模具和铸锻件软化或组织调整，需确认材质、退火温度、保温时间和冷却方式。' },
      { title: '回火', text: '适用于淬火后零件、模具和机械件回火，需确认回火温度、装炉量、保温时间和记录要求。' },
      { title: '正火', text: '适用于部分钢件和铸锻件组织改善，需确认最高温度、出炉方式、冷却条件和装料间距。' },
      { title: '淬火加热', text: '可用于淬火前加热工序，需确认加热温度、转移方式、后续冷却介质和安全联锁。' },
      { title: '时效', text: '适用于部分合金件或试制件时效处理，需确认温度区间、保温时间和批次稳定性要求。' },
      { title: '去应力处理', text: '常用于焊接件、机加工件和结构小件，需确认升降温速率、装炉支撑和变形控制要求。' },
    ],
    processCardsTitle: '箱式炉可覆盖哪些热处理工艺？',
    customSpecs: [
      { key: '工件材质', value: '提供材料牌号、热处理目标和表面质量要求' },
      { key: '工件尺寸', value: '提供最大外形尺寸、常见规格和装夹方式' },
      { key: '单件重量', value: '提供单件重量、最大重量和支撑接触方式' },
      { key: '每炉装炉量', value: '说明每炉件数、总重量、堆放方式和生产节拍' },
      { key: '炉膛有效尺寸', value: '按工件尺寸、装炉间隙、料框和操作空间综合确定' },
      { key: '最高温度', value: '提供设计最高温度和工艺要求的最高温度' },
      { key: '常用工作温度', value: '提供日常工艺温度区间，便于炉衬和加热元件选型' },
      { key: '热处理工艺', value: '退火、回火、正火、淬火加热、时效、去应力处理等' },
      { key: '温度均匀性要求', value: '按工艺和有效工作区确定，具体指标需在技术方案中明确' },
      { key: '加热方式', value: '电阻加热 / 燃气加热，可结合能源条件和工艺要求选择' },
      { key: '炉门结构', value: '侧开门、升降门、密封结构和安全联锁按项目确认' },
      { key: '加热元件类型', value: '电阻丝、辐射管、硅碳棒、硅钼棒等需结合温度等级选择' },
      { key: '控制系统要求', value: '普通温控、PLC、触摸屏、记录仪、多区控温、数据追溯等' },
      { key: '现场空间与安装条件', value: '提供车间空间、电源容量、吊装条件、排烟和安装边界' },
    ],
    configurations: [
      { title: '试制与工艺验证箱式炉', image: imagesBySlug['box-furnace'].configs[0], specs: ['炉膛尺寸：按试制件、样件和工装方式定制', '温度等级：按材料和工艺要求确认', '控制系统：可配置温控仪、记录仪或 PLC', '适用场景：试制件、实验件、小批量验证'] },
      { title: '生产型箱式热处理炉', image: imagesBySlug['box-furnace'].configs[1], specs: ['装炉量：按单件重量、每炉件数和料框设计', '加热系统：按温度等级选择加热元件', '炉门结构：按装卸方式和密封要求确认', '适用场景：机械零件、模具、小批量工件热处理'] },
    ],
    processSteps: [
      { title: '提交参数', text: '提供工件材质、尺寸、重量、装炉量、温度和工艺要求。' },
      { title: '判断炉膛', text: '结合工件外形、料框、装炉间隙和操作空间确定有效尺寸。' },
      { title: '确认配置', text: '明确加热元件、炉衬结构、炉门形式和控制系统要求。' },
      { title: '方案报价', text: '形成技术方案、主要配置、报价范围和交付边界。' },
      { title: '制造检查', text: '完成炉体、炉衬、加热元件、炉门和电控系统检查。' },
      { title: '安装售后', text: '到场完成安装调试、操作培训和后续服务支持。' },
    ],
    processes: ['退火', '回火', '正火', '淬火加热', '时效', '去应力处理'],
    industries: ['机械加工', '模具制造', '铸锻件', '汽车零部件', '科研试制', '热处理外协厂', '能源装备'],
    leadBullets: ['按工件尺寸判断炉膛', '按温度等级匹配炉衬与加热元件', '按装炉量设计承载结构', '按现场条件明确交付边界'],
    parameterTitle: '箱式炉定制需要确认哪些参数？',
    parameterLink: {
      title: '查看报价需要哪些参数',
      description: '查看报价参数说明页。',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    parameterNote:
      '箱式炉报价不能只按炉型名称估算，具体需结合工件材质、尺寸、装炉量、最高温度、温度均匀性要求、加热元件类型、控制系统和现场条件确定，最终以双方确认的技术方案为准。',
    structureTitle: '箱式炉主要结构组成',
    structureComponents: [
      { title: '炉体结构', text: '包括炉壳、炉膛、保温层和钢结构，需按炉膛尺寸、温度等级和使用频率设计。' },
      { title: '炉衬系统', text: '耐火材料、陶瓷纤维、浇注料或复合保温结构需按温度、升降温制度和维护要求选型。' },
      { title: '加热系统', text: '电阻丝、辐射管、硅碳棒、硅钼棒等加热元件需结合温度等级和工艺要求选择。' },
      { title: '炉门系统', text: '侧开门、升降门、密封结构和安全联锁需结合装卸方式、操作空间和漏热控制确认。' },
      { title: '炉内承载系统', text: '炉底板、料框、支撑结构和装料方式需按工件重量、装炉量和高温强度设计。' },
      { title: '控制系统', text: '可配置温控仪、PLC、触摸屏、记录仪、多区控温和报警保护，具体指标按方案确认。' },
    ],
    priceFactorsTitle: '箱式炉价格受哪些因素影响？',
    priceFactorsIntro:
      '箱式炉通常为非标定制设备，不能脱离工件、温度和配置直接给出固定价格。以下因素会明显影响炉体结构、材料配置、控制系统和交付范围。',
    priceFactors: [
      '炉膛尺寸',
      '最高温度',
      '炉衬材料',
      '加热元件类型',
      '装炉重量',
      '温度均匀性要求',
      '控制系统配置',
      '炉门结构',
      '是否需要风循环',
      '是否涉及安装调试',
      '是否为旧炉改造或大修',
    ],
    comparisonTitle: '箱式炉和台车炉怎么选？',
    comparisonHeaders: ['箱式炉适合', '台车炉适合'],
    comparisonRows: [
      { left: '中小型工件，装卸相对简单', right: '大型工件或单件较重的工件' },
      { left: '小批量处理或多品种试制', right: '需要台车承载和进出料' },
      { left: '试制、工艺验证和实验任务', right: '需要行车吊装或工装装卸' },
      { left: '炉体更紧凑，现场空间相对可控', right: '炉膛尺寸较大，需预留轨道和基础' },
      { left: '投资预算相对可控，配置按工艺定制', right: '适合大型铸锻件、模具、焊接结构件等周期式热处理' },
    ],
    processStepsTitle: '箱式炉定制流程',
    industryCards: [
      { title: '机械加工', text: '常用于中小型机加工件、结构小件的退火、回火、正火和去应力处理。' },
      { title: '模具制造', text: '适合中小型模具、工装和厚壁件热处理，重点关注支撑方式和温度均匀性。' },
      { title: '铸锻件', text: '可用于部分中小型铸件、锻件的组织调整、退火或去应力处理。' },
      { title: '汽车零部件', text: '适用于小批量零部件、试制件和多规格零件的周期式热处理。' },
      { title: '科研试制', text: '适合材料试验、工艺验证和新品开发阶段的小批量热处理任务。' },
      { title: '热处理外协厂', text: '适合多品种、小批量工件处理，需关注换产效率和工艺覆盖范围。' },
      { title: '能源装备', text: '可用于部分中小型装备零件、配套件的退火、回火或去应力处理。' },
    ],
    scenarioCards: [
      { title: '中小型机械件回火', text: '围绕回火温度、装炉量、保温时间和记录要求确定炉膛、加热和控制配置。' },
      { title: '模具去应力处理', text: '重点确认模具尺寸、支撑方式、升降温曲线和温度均匀性要求。' },
      { title: '试制件热处理', text: '适合小批量材料验证或工艺摸索，需明确温度区间、记录方式和换产需求。' },
      { title: '小批量零件退火', text: '根据材质、装炉间距、退火温度和冷却方式评估炉膛尺寸与加热系统。' },
    ],
    scenarioIntro:
      '当前页面不虚构客户案例。以下仅作为箱式炉常见应用场景说明，具体项目可在商务沟通中结合授权资料进一步确认。',
    leadForm: {
      title: '需要定制箱式炉？',
      description:
        '把工件尺寸、单件重量、装炉量、最高温度、热处理工艺、温度均匀性要求和现场条件发给苏能，技术人员可先判断炉膛尺寸、温度等级、加热元件和控制系统方案。',
      submitLabel: '提交需求',
      contactHref: '/zh/contact',
      contactLabel: '联系苏能工业炉',
      phone: '+86-130-5298-6814',
      email: 'jssngyl@outlook.com',
    },
  },
  'trolley-furnace': {
    series: '台车炉系列',
    title: '台车炉｜台车式热处理炉定制',
    breadcrumbSeries: '台车炉系列',
    summary:
      '台车炉适用于大型工件、铸件、焊接件、模具、结构件等周期式热处理场景。苏能可根据工件尺寸、单件重量、装炉量、最高温度、工艺曲线和现场条件，提供台车式热处理炉非标定制方案。',
    sellingPoints: ['大型工件热处理', '台车承重定制', '炉衬结构设计', '电阻 / 燃气可选'],
    quickTags: ['大型工件热处理', '退火 / 回火 / 正火', '台车承重定制', '炉衬结构设计', '电阻 / 燃气可选', 'PLC 控制系统'],
    ctaHighlights: ['成立于 2006 年', '14700㎡生产基地', '非标台车炉定制'],
    heroCtas: [
      {
        title: '获取报价方案',
        description: '滚动到询价表单，提交台车炉参数。',
        href: '#product-lead-form',
      },
      {
        title: '查看报价需要哪些参数',
        description: '了解工业炉报价前建议准备的资料。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
    ],
    reasons: [
      { title: '按工件定制炉膛', text: '根据最大外形尺寸、装炉方式和吊装条件，确定有效工作区和炉体结构。' },
      { title: '按重量设计台车', text: '结合单件重量、每炉装炉量和支撑方式，评估台车承重、轨道和基础要求。' },
      { title: '按工艺配置加热', text: '围绕退火、回火、正火、淬火加热等工艺，匹配电阻或燃气加热方案。' },
      { title: '按要求配置控制', text: '可根据项目要求配置 PLC、触摸屏、记录仪、多区控温和报警保护。' },
      { title: '按现场条件交付', text: '结合车间空间、吊装条件、停产窗口和安装边界，明确制造与调试方案。' },
    ],
    workpieceCards: [
      { title: '大型铸件', text: '适合单件尺寸较大、需要整炉装卸和缓慢升降温的铸件热处理。' },
      { title: '焊接结构件', text: '常用于焊后去应力、回火和整体加热，需确认变形控制和装炉方式。' },
      { title: '模具', text: '适合大型模具、工装和厚壁件热处理，重点关注温度均匀性和支撑方式。' },
      { title: '机械加工件', text: '适用于机加工后的退火、回火、正火或去应力处理。' },
      { title: '轴类 / 杆件', text: '可根据长度、直径、装夹方式和吊装条件评估台车炉或井式炉方案。' },
      { title: '钢结构件', text: '适合尺寸较大、形状不规则、需要台车进出料的结构件加热。' },
      { title: '热处理外协件', text: '适合多规格、多批次周期式处理，需关注装炉效率和炉膛利用率。' },
      { title: '周期式装炉工件', text: '适合不适合连续输送、需要集中装炉和集中出炉的批量工件。' },
    ],
    processCards: [
      { title: '退火', text: '适用于铸件、锻件、结构件和模具的组织改善或软化处理，需确认材质、升温曲线、保温时间和冷却方式。' },
      { title: '回火', text: '适用于淬火后的零件、模具和结构件，需确认回火温度、装炉量、保温时间和温度均匀性要求。' },
      { title: '正火', text: '适用于部分钢件和铸锻件的组织调整，需确认最高温度、出炉方式、冷却条件和工件堆放方式。' },
      { title: '淬火加热', text: '可用于淬火前加热工序，需确认加热温度、转移时间、后续冷却方式和安全联锁要求。' },
      { title: '时效', text: '适用于部分合金件或结构件的时效处理，需确认温度区间、保温时间和批次稳定性要求。' },
      { title: '去应力处理', text: '常用于焊接件、铸件和机加工件，需确认工件尺寸、残余应力来源、升降温速率和装炉支撑方式。' },
    ],
    customSpecs: [
      { key: '工件尺寸', value: '提供最大外形尺寸、常见批次尺寸和装夹方式' },
      { key: '单件重量', value: '提供单件重量、最大重量和支撑接触方式' },
      { key: '每炉装炉量', value: '说明每炉件数、总重量、堆放方式和生产节拍' },
      { key: '炉膛有效尺寸', value: '按工件尺寸、装炉间隙和操作空间综合确定' },
      { key: '最高温度', value: '提供设计最高温度和工艺要求的最高温度' },
      { key: '常用工作温度', value: '提供日常工艺温度区间，便于炉衬和加热系统选型' },
      { key: '热处理工艺', value: '退火、回火、正火、淬火加热、时效、去应力处理等' },
      { key: '温度均匀性要求', value: '按工艺和有效工作区确定，具体指标需在技术方案中明确' },
      { key: '加热方式', value: '电阻加热 / 燃气加热，可结合能源条件和工艺要求选择' },
      { key: '台车承重', value: '按单件重量、装炉总重、耐热垫块和台车结构确定' },
      { key: '炉门结构', value: '升降炉门、密封结构、炉门传动和安全联锁按现场确认' },
      { key: '轨道与基础条件', value: '需确认车间地坪、轨道布置、基础承载和台车行程' },
      { key: '控制系统要求', value: '普通温控、PLC、触摸屏、记录仪、多区控温、数据追溯等' },
      { key: '现场空间与吊装条件', value: '提供车间尺寸、吊装能力、进出料方向和安装边界' },
    ],
    configurations: [
      { title: '大型工件台车炉', image: imagesBySlug['trolley-furnace'].configs[0], specs: ['炉膛尺寸：按最大工件外形和装炉方式定制', '台车承重：按单件重量和总装炉量设计', '加热方式：电阻或燃气方案按项目选择', '适用场景：大型铸件、结构件、模具热处理'] },
      { title: '周期式热处理台车炉', image: imagesBySlug['trolley-furnace'].configs[1], specs: ['工艺范围：退火、回火、正火、去应力处理等', '控制系统：可配置多区控温和记录仪', '炉门结构：按装卸方式和密封要求设计', '适用场景：机械加工件、焊接件、热处理外协件'] },
      { title: '改造替换型台车炉', image: imagesBySlug['trolley-furnace'].configs[2], specs: ['项目边界：可评估新炉定制、旧炉改造或大修', '现场条件：结合轨道、基础、吊装和停产窗口确认', '能源类型：电、天然气等按现场条件匹配', '适用场景：老旧台车炉更新、产能升级和工艺调整'] },
    ],
    processSteps: [
      { title: '提交参数', text: '提供工件尺寸、重量、装炉量、温度和工艺要求。' },
      { title: '判断炉膛', text: '依据工件外形、承重、轨道基础和装卸方式确定有效尺寸。' },
      { title: '确认配置', text: '明确温度等级、加热方式、控制系统和炉门结构。' },
      { title: '方案报价', text: '形成技术方案、主要配置、报价范围和交付边界。' },
      { title: '制造检查', text: '完成炉体、台车、炉衬、加热和电控系统检查。' },
      { title: '安装售后', text: '到场完成安装调试、操作培训和后续服务支持。' },
    ],
    processes: ['退火', '回火', '正火', '淬火加热', '时效', '去应力处理'],
    industries: ['机械加工', '铸锻件', '模具制造', '钢结构', '汽车零部件', '能源装备', '热处理外协厂'],
    leadBullets: ['按工件尺寸判断炉膛', '按装炉重量设计台车', '按工艺曲线匹配加热与控制', '按现场条件明确交付边界'],
    parameterTitle: '台车炉定制需要确认哪些参数？',
    parameterLink: {
      title: '查看报价需要哪些参数',
      description: '查看报价参数说明页。',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    parameterNote:
      '台车炉报价不能只按炉型名称估算，具体需结合工件尺寸、装炉量、工艺温度、温度均匀性要求、加热方式、台车承重、生产节拍和现场条件确定，最终以双方确认的技术方案为准。',
    structureComponents: [
      { title: '炉体结构', text: '包括炉壳、炉膛、保温层和钢结构，需按炉膛尺寸、温度等级和长期运行工况设计。' },
      { title: '炉衬系统', text: '耐火材料、陶瓷纤维和复合保温结构需结合温度、升降温制度和维护要求选型。' },
      { title: '台车系统', text: '台车承重、行走机构、轨道基础和装料方式需按单件重量、总装炉量和现场轨道确定。' },
      { title: '炉门系统', text: '可配置升降炉门、密封结构和炉门传动，重点关注漏热、操作安全和维护便利性。' },
      { title: '加热系统', text: '可选电阻加热或燃气加热，具体需结合能源条件、温度范围、升温要求和现场安全要求。' },
      { title: '控制系统', text: '可配置温控仪、PLC、触摸屏、记录仪、多区控温和报警保护，具体指标按方案确认。' },
    ],
    priceFactors: [
      '炉膛尺寸',
      '台车承重',
      '最高温度',
      '炉衬材料',
      '加热方式',
      '温度均匀性',
      '控制系统配置',
      '是否需要风循环',
      '是否涉及安装调试',
      '是否为旧炉改造或大修',
    ],
    comparisonRows: [
      { trolley: '工件较大，需要整炉装卸', box: '中小型工件，装卸相对简单' },
      { trolley: '单件较重，需要台车承载', box: '单件较轻或批量不大' },
      { trolley: '需要行车配合装卸', box: '人工或简易工装可完成装卸' },
      { trolley: '炉膛尺寸较大，现场需预留轨道和基础', box: '炉体更紧凑，安装空间相对可控' },
      { trolley: '适合大型结构件、模具、铸锻件等周期式热处理', box: '适合小批量零件、试制件和中小型工件' },
    ],
    processStepsTitle: '台车炉定制流程',
    industryCards: [
      { title: '机械加工', text: '常用于机加工件、结构件和大型零件的退火、回火、正火及去应力处理。' },
      { title: '铸锻件', text: '适合大型铸件、锻件和厚壁件的周期式热处理，需关注装炉重量和升降温曲线。' },
      { title: '模具制造', text: '常用于大型模具、工装和复杂截面件热处理，重点关注支撑方式和温度均匀性。' },
      { title: '钢结构', text: '适合焊接结构件、框架件和大型钢构件的去应力或回火处理。' },
      { title: '汽车零部件', text: '适用于批量不连续、尺寸较大或需要台车装卸的零部件热处理场景。' },
      { title: '能源装备', text: '适用于大型结构件、耐热部件和装备制造配套热处理项目。' },
      { title: '热处理外协厂', text: '适合多品种、多批次工件处理，需综合炉膛利用率、装卸效率和工艺覆盖范围。' },
    ],
    scenarioCards: [
      { title: '大型铸锻件退火', text: '围绕工件尺寸、单件重量、保温时间和冷却方式确定炉膛、台车和炉衬配置。' },
      { title: '焊接结构件去应力', text: '重点确认升降温速率、工件支撑、炉门密封和现场吊装条件。' },
      { title: '模具与机械件回火', text: '根据模具尺寸、装炉量、温度均匀性和记录要求配置加热与控制系统。' },
    ],
    faq: [
      {
        question: 'Q1：台车炉适合哪些工件？',
        answer:
          '台车炉适合大型铸件、焊接结构件、模具、机械加工件、钢结构件等尺寸较大或单件较重的工件。它采用台车进出料方式，便于行车吊装和整炉装卸。具体是否适合，需要结合工件尺寸、重量、装炉方式和热处理工艺判断。',
      },
      {
        question: 'Q2：台车炉可以做退火、回火、正火吗？',
        answer:
          '可以。台车炉常用于退火、回火、正火、淬火加热、时效和去应力处理等周期式热处理工艺。不同工艺对最高温度、升降温曲线、保温时间、装炉方式和温度均匀性要求不同，应在方案阶段逐项确认。',
      },
      {
        question: 'Q3：台车炉价格主要看哪些参数？',
        answer:
          '台车炉价格主要受炉膛尺寸、台车承重、最高温度、炉衬材料、加热方式、控制系统、温度均匀性、是否需要风循环和安装调试范围影响。台车炉多为非标设备，通常需要先提交参数，再判断方案和报价范围。',
      },
      {
        question: 'Q4：台车炉和箱式炉有什么区别？',
        answer:
          '台车炉带有可移动台车，适合大型、较重或需要行车吊装的工件；箱式炉结构更紧凑，适合中小型工件、小批量或试制场景。两者都可非标定制，选择时应比较工件尺寸、重量、装炉量和现场空间。',
      },
      {
        question: 'Q5：台车炉可以做燃气加热吗？',
        answer:
          '可以根据项目条件评估电阻加热或燃气加热方案。燃气台车炉需要考虑燃烧系统、燃气管路、安全联锁、排烟和当地排放要求；电阻台车炉则更关注电源容量、加热元件和控温分区。具体应按能源条件和工艺要求确定。',
      },
      {
        question: 'Q6：台车炉温度均匀性怎么保证？',
        answer:
          '温度均匀性与炉膛尺寸、加热元件布置、燃烧系统、炉衬结构、炉门密封、风循环和控温分区有关。方案阶段应结合有效工作区、工艺温度和验收口径确定目标指标，不能脱离炉型和工件状态直接承诺固定数值。',
      },
      {
        question: 'Q7：旧台车炉可以改造或大修吗？',
        answer:
          '可以先评估。旧台车炉常见改造方向包括炉衬翻新、炉门密封修复、加热系统升级、台车和轨道检修、控制系统改造等。是否适合改造，需要结合炉体状态、安全风险、能耗数据、停产窗口和改造费用综合判断。',
      },
      {
        question: 'Q8：台车炉询价前需要准备哪些资料？',
        answer:
          '建议准备工件尺寸、单件重量、每炉装炉量、最高温度、常用工作温度、热处理工艺、温度均匀性要求、加热方式、台车承重、现场照片、吊装条件和车间空间。资料不完整也可以先沟通，由技术人员判断需补充内容。',
      },
    ],
    relatedLinks: [
      {
        title: '工业炉报价需要哪些参数',
        description: '整理炉型、尺寸、温度、装炉量、工艺曲线和现场条件，提高询价效率。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title: '工业炉节能改造与热处理炉大修服务',
        description: '了解老旧台车炉、热处理炉的炉衬、密封、加热和控制系统评估思路。',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: '热处理炉厂家页面',
        description: '了解苏能作为热处理炉厂家的产品范围、制造能力和定制流程。',
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: '箱式炉页面',
        description: '对比中小型工件、小批量和试制场景下的箱式炉方案。',
        href: '/zh/products/detail/box-furnace',
      },
      {
        title: '网带炉页面',
        description: '了解小件、标准件和连续式批量热处理的网带炉方案。',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
      {
        title: '产品中心',
        description: '查看苏能已公开的热处理炉、工业炉和热处理生产线产品。',
        href: '/zh/products',
      },
      {
        title: '联系我们',
        description: '提交台车炉参数、咨询方案或预约进一步技术沟通。',
        href: '/zh/contact',
      },
    ],
    leadForm: {
      title: '需要定制台车炉？',
      description:
        '把工件尺寸、单件重量、装炉量、最高温度、热处理工艺、台车承重和现场条件发给苏能，技术人员可先判断炉膛尺寸、加热方式和台车结构方案。',
      submitLabel: '提交需求',
      contactHref: '/zh/contact',
      contactLabel: '联系苏能工业炉',
      phone: '+86-130-5298-6814',
      email: 'jssngyl@outlook.com',
    },
  },
  'pit-furnace': {
    series: '井式炉系列',
    title: '井式炉｜井式热处理炉定制',
    breadcrumbSeries: '井式炉系列',
    summary:
      '井式炉适用于轴类、杆件、长件、套筒件、竖直装炉工件等周期式热处理场景。苏能可根据工件长度、直径、单件重量、装炉量、最高温度、热处理工艺、吊装方式和现场条件，提供井式热处理炉非标定制方案。',
    sellingPoints: ['轴类长件热处理', '有效深度定制', '炉盖结构按项目确认', '电阻 / 燃气可选'],
    quickTags: ['轴类 / 杆件热处理', '回火 / 退火 / 淬火加热', '井式电阻炉定制', '有效深度定制', '气氛保护可评估', 'PLC 控制系统'],
    ctaHighlights: ['成立于 2006 年', '14700㎡生产基地', '非标井式炉定制'],
    heroCtas: [
      {
        title: '获取报价方案',
        description: '滚动到询价表单，提交井式炉参数。',
        href: '#product-lead-form',
      },
      {
        title: '查看报价需要哪些参数',
        description: '了解工业炉报价前建议准备的资料。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
    ],
    reasons: [
      { title: '按长件确定炉型', text: '根据轴类、杆件、套筒件的长度、直径和装炉方式，判断有效直径、有效深度和炉口空间。' },
      { title: '按吊装确认结构', text: '结合行车能力、吊具形式、炉盖开启方式和现场高度，匹配装出炉操作方案。' },
      { title: '按工艺配置加热', text: '围绕回火、退火、淬火加热、时效等工艺，匹配加热方式、炉衬结构和控温分区。' },
      { title: '按现场明确边界', text: '结合车间空间、基础条件、电源或气源、安装边界和安全要求，明确交付范围。' },
      { title: '按验收口径约定指标', text: '温度均匀性、记录方式和联锁保护等指标，应在技术方案和合同附件中确认。' },
    ],
    customSpecs: [
      { key: '工件材质', value: '提供材料牌号、热处理目标和表面质量要求' },
      { key: '工件长度', value: '提供最大长度、常见长度、吊具和装夹余量' },
      { key: '工件直径', value: '提供最大外径、常见规格和炉内操作间隙要求' },
      { key: '单件重量', value: '提供单件重量、最大重量、重心位置和吊装方式' },
      { key: '每炉装炉量', value: '说明每炉件数、总重量、工件间距和批次节拍' },
      { key: '有效工作区直径', value: '按工件外径、吊具、装炉间隙和热循环空间综合确定' },
      { key: '有效工作区深度', value: '按工件长度、吊具、炉盖结构和有效加热区确定' },
      { key: '最高温度', value: '提供设计最高温度和工艺要求的最高温度' },
      { key: '常用工作温度', value: '提供日常工艺温度区间，便于炉衬和加热系统选型' },
      { key: '热处理工艺', value: '回火、退火、淬火加热、时效、去应力处理等；渗碳、渗氮可按项目评估' },
      { key: '温度均匀性要求', value: '需结合有效工作区、装炉方式、控温分区和验收口径确认' },
      { key: '装炉方式', value: '竖直吊装、料筐、吊具或工装夹具按工件确认' },
      { key: '吊装方式', value: '提供行车能力、吊具形式、炉口操作空间和安全边界' },
      { key: '炉盖结构', value: '升降炉盖、旋转炉盖、密封结构和安全联锁按项目确认' },
      { key: '加热方式', value: '电阻加热 / 燃气加热，可结合能源条件和工艺要求选择' },
      { key: '是否需要气氛保护', value: '按材料、表面质量和工艺目标评估，不同气氛需明确安全要求' },
      { key: '控制系统要求', value: '普通温控、PLC、触摸屏、记录仪、多区控温、数据追溯等' },
      { key: '现场空间与吊装条件', value: '提供车间高度、吊装能力、炉坑或基础、供电供气和安装边界' },
    ],
    configurations: [
      { title: '试制与小批量井式炉', image: imagesBySlug['pit-furnace'].configs[0], specs: ['有效尺寸：按实验样件、长件和吊具方式定制', '温度等级：按材料和工艺要求确认', '控制系统：可配置温控仪、记录仪或 PLC', '适用场景：科研、实验、试制和小批量处理'] },
      { title: '生产型井式热处理炉', image: imagesBySlug['pit-furnace'].configs[1], specs: ['有效尺寸：按轴类、杆件长度和直径定制', '炉盖结构：按吊装和密封要求确认', '加热系统：按炉膛尺寸和升温要求核算', '适用场景：模具、五金、机械加工和长件热处理'] },
      { title: '大型工业井式炉', image: imagesBySlug['pit-furnace'].configs[2], specs: ['有效尺寸：按大型长轴、套筒或杆件定制', '吊装条件：结合行车能力、炉口空间和安全边界确认', '能源类型：电、天然气等按现场条件匹配', '适用场景：大型零件、轨道交通、能源装备配套'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['回火', '退火', '淬火加热', '时效', '去应力处理', '气氛保护可评估'],
    industries: ['科研院所', '模具制造', '五金加工', '轨道交通', '机械制造', '能源装备'],
    leadBullets: ['按工件长度判断有效深度', '按直径和吊具确认有效工作区', '按吊装方式确定炉盖结构', '按工艺要求配置控制系统'],
    parameterTitle: '井式炉定制需要确认哪些参数？',
    parameterLink: {
      title: '查看报价需要哪些参数',
      description: '查看报价参数说明页。',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    comparisonTitle: '井式炉、箱式炉、台车炉怎么选？',
    comparisonHeaders: ['井式炉适合', '箱式炉适合', '台车炉适合'],
    comparisonRows: [
      { left: '轴类、杆件、长件', middle: '中小型工件', right: '大型工件' },
      { left: '竖直装炉更合适的工件', middle: '装卸相对简单', right: '单件较重' },
      { left: '有效深度要求较高', middle: '小批量或试制任务', right: '需要台车承载' },
      { left: '需要吊装进出炉', middle: '炉体更紧凑', right: '需要行车吊装' },
      { left: '适合长轴、套筒、杆件等热处理', middle: '工件高度不大的周期式热处理', right: '炉膛尺寸较大的周期式热处理' },
    ],
    leadForm: {
      title: '需要定制井式炉？',
      description:
        '把工件长度、直径、单件重量、装炉量、最高温度、热处理工艺、吊装方式和现场条件发给苏能，技术人员可先判断井式炉有效直径、有效深度、炉盖结构和控制系统方案。',
      submitLabel: '提交需求',
      contactHref: '/zh/contact',
      contactLabel: '联系苏能工业炉',
      phone: '+86-130-5298-6814',
      email: 'jssngyl@outlook.com',
    },
  },
  'bell-furnace': {
    series: '罩式炉系列',
    title: '罩式炉｜罩式热处理炉定制',
    breadcrumbSeries: '罩式炉系列',
    summary:
      '罩式炉适用于卷材、线材、盘卷、小型零件、批量装框工件的退火、回火、保温及气氛保护热处理场景。苏能可根据工件形态、装炉量、炉罩尺寸、炉台尺寸、最高温度、气氛要求和现场条件，提供罩式热处理炉非标定制方案。',
    sellingPoints: ['气氛保护可评估', '炉罩尺寸定制', '炉台结构按项目确认', '罩式电阻炉定制'],
    quickTags: ['卷材 / 线材 / 盘卷', '退火 / 回火 / 保温', '气氛保护罩式炉', '炉罩尺寸定制', '炉台结构定制', 'PLC 控制系统'],
    ctaHighlights: ['成立于 2006 年', '14700㎡生产基地', '响应时间按项目约定'],
    heroCtas: [
      {
        title: '获取报价方案',
        description: '滚动到询价表单，提交罩式炉参数。',
        href: '#product-lead-form',
      },
      {
        title: '查看报价需要哪些参数',
        description: '了解工业炉报价前建议准备的资料。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
    ],
    reasons: [
      { title: '满足工艺需求', text: '根据工件类型、装炉高度、气氛保护和温度均匀性要求，定制炉罩结构、炉台尺寸和控温方案。' },
      { title: '贴合设备需求', text: '适配小型零件、盘卷、线材、装框件或批量工件的装炉方式，按现场条件优化操作便利性。' },
      { title: '优化热处理一致性', text: '通过炉罩结构、热循环系统和控温配置优化，具备改善工件受热一致性的空间。' },
      { title: '优化运行能耗', text: '根据有效加热区、保温结构和热循环方式优化加热段配置，具备改善运行能耗的空间。' },
      { title: '按项目配置稳定性', text: '炉罩、炉台、密封结构、加热系统和控制系统按工况配置，以提升运行稳定性。' },
    ],
    customSpecs: [
      { key: '工件材质', value: '提供材料牌号、热处理目标和表面质量要求' },
      { key: '工件形态', value: '卷材、线材、盘卷、小件、装框件等需说明装料方式' },
      { key: '单件重量 / 单框重量', value: '提供单件重量、料框重量、总装炉重量和支撑方式' },
      { key: '每炉装炉量', value: '说明每炉件数、盘卷数量、料框数量、总重量和批次节拍' },
      { key: '炉罩有效尺寸', value: '按装料外形、热循环空间、炉罩结构和维护空间综合确定' },
      { key: '炉台尺寸', value: '按装料宽度、炉台承载、密封结构和吊装方式确认' },
      { key: '装料高度', value: '提供最大装料高度、常见高度和炉罩预留空间' },
      { key: '最高温度', value: '提供设计最高温度和工艺要求的最高温度' },
      { key: '常用工作温度', value: '提供日常工艺温度区间，便于炉衬、加热和气氛系统选型' },
      { key: '热处理工艺', value: '退火、回火、保温、气氛保护热处理等' },
      { key: '是否需要保护气氛', value: '按材料、表面质量、氧化控制和安全要求评估' },
      { key: '气氛类型', value: '氮气、氩气、混合气或其他气氛需结合工艺和安全要求确认' },
      { key: '密封要求', value: '需结合炉罩、炉台、气氛系统、冷却方式和验收口径确认' },
      { key: '冷却方式', value: '炉冷、风冷、气氛冷却或配套冷却方式按工艺确认' },
      { key: '炉罩升降方式', value: '行车吊装、机械升降或其他方式按现场条件确定' },
      { key: '加热方式', value: '电阻加热 / 燃气加热，可结合能源条件和工艺要求选择' },
      { key: '控制系统要求', value: '普通温控、PLC、触摸屏、记录仪、多区控温、数据追溯等' },
      { key: '现场吊装与安装条件', value: '提供车间高度、行车能力、基础条件、供电供气和安装边界' },
    ],
    configurations: [
      { title: '小件装框罩式炉', image: imagesBySlug['bell-furnace'].configs[0], specs: ['有效尺寸：按料框、装料高度和炉罩结构定制', '温度等级：按材料和工艺要求确认', '气氛配置：按表面质量、密封和安全要求评估', '适用场景：小件、实验、试制和批量装框处理'] },
      { title: '气氛保护罩式退火炉', image: imagesBySlug['bell-furnace'].configs[1], specs: ['炉罩尺寸：按盘卷、线材或装框工件外形确认', '炉台结构：按承载、密封和装卸方式设计', '加热系统：按炉罩尺寸和升温要求核算', '适用场景：盘卷、线材、批量工件退火或保温'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['退火', '回火', '保温', '气氛保护热处理', '装框批量处理', '盘卷热处理'],
    industries: ['五金加工', '小批量生产', '模具制造', '金属材料处理', '热处理加工'],
    leadBullets: ['按工件形态判断炉罩结构', '按装炉量确认炉台承载', '按气氛要求评估密封方式', '按现场条件明确交付边界'],
    parameterTitle: '罩式炉定制需要确认哪些参数？',
    parameterLink: {
      title: '查看报价需要哪些参数',
      description: '查看报价参数说明页。',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    comparisonTitle: '罩式炉、箱式炉、井式炉怎么选？',
    comparisonHeaders: ['罩式炉适合', '箱式炉适合', '井式炉适合'],
    comparisonRows: [
      { left: '卷材、线材、盘卷或装框批量工件', middle: '中小型工件', right: '轴类、杆件、长件' },
      { left: '需要炉罩与炉台组合结构', middle: '小批量或试制任务', right: '竖直装炉更合适的工件' },
      { left: '需要保护气氛或整体罩式加热', middle: '装卸相对简单', right: '有效深度要求较高' },
      { left: '装料高度和炉罩尺寸需要定制', middle: '炉体更紧凑', right: '需要吊装进出炉' },
      { left: '适合批量装框、盘卷退火或气氛保护热处理', middle: '适合普通周期式热处理', right: '适合长轴、套筒、杆件等热处理' },
    ],
    leadForm: {
      title: '需要定制罩式炉？',
      description:
        '把工件形态、装炉量、炉罩尺寸、炉台尺寸、最高温度、热处理工艺、气氛要求和现场条件发给苏能，技术人员可先判断罩式炉结构、密封方式、气氛系统和控制方案。',
      submitLabel: '提交需求',
      contactHref: '/zh/contact',
      contactLabel: '联系苏能工业炉',
      phone: '+86-130-5298-6814',
      email: 'jssngyl@outlook.com',
    },
  },
  'pusher-furnace': {
    series: '推杆炉系列',
    title: '推杆炉｜推杆式热处理炉定制',
    breadcrumbSeries: '推杆炉系列',
    summary:
      '推杆炉适用于批量稳定、节拍明确的工件连续退火、回火、正火、加热等热处理工艺。苏能可根据工件材质、尺寸、重量、产能节拍、最高温度、推料方式、上下料条件和现场空间，提供推杆式热处理炉非标定制方案。',
    sellingPoints: ['连续式热处理', '推料节拍定制', '温区配置按项目确认', '上下游联动可评估'],
    quickTags: ['连续式热处理', '推料方式定制', '料盘 / 料框承载', '多温区控温', '退火 / 回火 / 加热', 'PLC 控制系统'],
    ctaHighlights: ['成立于 2006 年', '14700㎡生产基地', '非标推杆炉定制'],
    heroCtas: [
      {
        title: '获取报价方案',
        description: '滚动到询价表单，提交推杆炉参数。',
        href: '#product-lead-form',
      },
      {
        title: '查看报价需要哪些参数',
        description: '了解工业炉报价前建议准备的资料。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
    ],
    reasons: [
      { title: '满足工艺需求', text: '根据工件批量、热处理温度和保温时间，定制炉膛尺寸、推料节拍和加热分区。' },
      { title: '贴合设备需求', text: '根据生产线布局、上下料方式和工装形式，匹配推杆机构、进出料结构和自动化配置。' },
      { title: '优化处理一致性', text: '通过推料节拍、分区控温和炉体结构优化，具备改善批量工件处理一致性的空间。' },
      { title: '优化运行能耗', text: '可根据连续生产工况优化加热段、保温结构和热循环配置，按工况评估能耗改善空间。' },
      { title: '按项目配置稳定性', text: '推杆机构、传动系统、炉衬结构、加热元件和控制系统按连续运行工况配置。' },
    ],
    customSpecs: [
      { key: '工件材质', value: '提供材料牌号、热处理目标和表面质量要求' },
      { key: '工件形态', value: '说明棒材、坯料、结构件、料盘件、料框件或其他装料形式' },
      { key: '工件尺寸', value: '提供长度、宽度、高度、最大外形和常见规格' },
      { key: '单件重量', value: '提供单件重量、最大重量、料盘或料框总重和支撑方式' },
      { key: '每小时产能', value: '说明每小时处理量、班次制度、连续运行节拍和节拍波动' },
      { key: '推料节拍', value: '按炉内停留时间、保温时间、料盘间距和上下料能力核算' },
      { key: '炉膛有效宽度', value: '按料盘、料框、工装或工件宽度及热循环空间确定' },
      { key: '炉膛有效长度', value: '按升温、保温、冷却时间和推料节拍综合核算' },
      { key: '炉内通道尺寸', value: '按工件高度、料盘高度、炉门通道和安全间隙确认' },
      { key: '承载方式', value: '料盘、料框、托盘、工装或炉底承载方式按工件确认' },
      { key: '推杆机构形式', value: '液压、机械、电动或其他推料方式需结合推力和节拍确认' },
      { key: '温区数量', value: '按升温、保温、冷却或工艺段配置需求确定' },
      { key: '最高温度', value: '提供设计最高温度和工艺要求的最高温度' },
      { key: '常用工作温度', value: '提供日常运行温度区间，便于炉衬、承载和加热系统选型' },
      { key: '热处理工艺', value: '连续退火、回火、正火、加热、淬火前加热等' },
      { key: '温度均匀性要求', value: '需结合有效工作区、装料方式、温区配置和验收口径确认' },
      { key: '气氛要求', value: '空气、氮气、保护气氛或其他气氛要求需按工艺确认' },
      { key: '冷却方式', value: '风冷、水冷、气氛冷却或配套冷却段按工艺确定' },
      { key: '上下料方式', value: '人工、机械上料、料盘回流、输送衔接或自动化联动按现场确认' },
      { key: '控制系统要求', value: 'PLC、触摸屏、温控仪、记录仪、多温区控制、报警保护等' },
      { key: '现场空间与上下游设备条件', value: '提供车间长度、电源、气源、排烟、冷却水、上下游设备和安装边界' },
    ],
    configurations: [
      { title: '料盘料框推杆炉', image: imagesBySlug['pusher-furnace'].configs[0], specs: ['通道尺寸：按料盘、料框或工装尺寸定制', '推料节拍：按炉内停留时间和上下料能力核算', '温区配置：按升温、保温和冷却节拍确认', '适用场景：批量稳定、节拍明确的连续热处理'] },
      { title: '连续式推杆热处理炉', image: imagesBySlug['pusher-furnace'].configs[1], specs: ['炉膛长度：按保温时间、推料节拍和产能节拍核算', '推杆机构：按推力、料盘摩擦和连续运行工况设计', '上下游衔接：按进出料、冷却段和现场布置评估', '适用场景：棒材、坯料、结构件和批量工件连续加热'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['退火', '回火', '正火', '连续加热', '淬火前加热', '连续式热处理'],
    industries: ['五金加工', '模具制造', '轨道交通', '标准件制造', '汽车零部件', '热处理加工'],
    leadBullets: ['按工件形态判断承载方式', '按产能节拍核算推料节拍', '按温区要求配置控制系统', '按上下游条件明确整线边界'],
    parameterTitle: '推杆炉定制需要确认哪些参数？',
    parameterLink: {
      title: '查看报价需要哪些参数',
      description: '查看报价参数说明页。',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    comparisonTitle: '推杆炉、辊底炉、网带炉怎么选？',
    comparisonHeaders: ['推杆炉适合', '辊底炉适合', '网带炉适合'],
    comparisonRows: [
      { left: '工件节拍稳定', middle: '板材、棒材、管材或规整工件', right: '小件、标准件、紧固件' },
      { left: '适合推料方式连续进出炉', middle: '工件更适合由辊道支撑和输送', right: '单件较轻，可铺放在网带上' },
      { left: '工件可按批次或料盘推进', middle: '对炉内输送稳定性要求较高', right: '批量稳定、连续进出料' },
      { left: '对生产节拍和炉内停留时间要求明确', middle: '适合连续热处理生产线', right: '适合小件连续热处理' },
      { left: '适合连续退火、回火、加热等生产场景', middle: '适合规整工件连续退火、固溶、回火', right: '适合标准件、紧固件等小件处理' },
    ],
    leadForm: {
      title: '需要定制推杆炉？',
      description:
        '把工件材质、尺寸、重量、产能节拍、最高温度、热处理工艺、推料方式、上下料条件和现场空间发给苏能，技术人员可先判断推杆炉结构、温区配置、推料机构和控制方案。',
      submitLabel: '提交需求',
      contactHref: '/zh/contact',
      contactLabel: '联系苏能工业炉',
      phone: '+86-130-5298-6814',
      email: 'jssngyl@outlook.com',
    },
  },
  'mesh-belt-furnace': {
    series: '网带炉系列',
    title: '网带炉｜网带式连续热处理炉定制',
    breadcrumbSeries: '网带炉系列',
    summary:
      '网带炉适用于标准件、小型零件、五金件、紧固件、金属件等连续式批量热处理场景。苏能可根据工件尺寸、材质、单件重量、产能节拍、最高温度、工艺曲线和现场条件，提供网带式热处理炉非标定制方案。',
    sellingPoints: ['连续式热处理', '网带宽度定制', '多温区控温', '上下料联动'],
    quickTags: ['连续式热处理', '标准件 / 小件批量处理', '网带宽度定制', '多温区控温', '退火 / 回火 / 淬火加热', 'PLC 控制系统'],
    ctaHighlights: ['成立于 2006 年', '14700㎡生产基地', '非标网带炉定制'],
    heroCtas: [
      {
        title: '获取报价方案',
        description: '滚动到询价表单，提交网带炉参数。',
        href: '#product-lead-form',
      },
      {
        title: '查看报价需要哪些参数',
        description: '了解工业炉报价前建议准备的资料。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
    ],
    reasons: [
      { title: '按产能设计节拍', text: '结合每小时产能、单件重量、铺料厚度和保温时间，判断网带速度与炉膛长度。' },
      { title: '按工艺配置温区', text: '围绕连续退火、回火、淬火加热、固溶等工艺，匹配温区数量、冷却方式和控制方案。' },
      { title: '按工件选择网带', text: '根据工件形态、温度、承载和连续运行时间，评估网带材质、宽度、张紧和传动结构。' },
      { title: '按现场衔接整线', text: '可结合上料、出料、清洗、淬火槽、回火炉等前后工序，明确设备联动边界。' },
      { title: '按验收明确指标', text: '温度均匀性、节拍、记录和联锁要求需在技术方案中明确，避免脱离工况承诺固定指标。' },
    ],
    workpieceCards: [
      { title: '标准件', text: '适合规格相对稳定、批量连续生产的螺栓、螺母等标准件热处理。' },
      { title: '紧固件', text: '常用于紧固件连续回火、退火或淬火加热，需关注铺料厚度和转运节拍。' },
      { title: '小型金属零件', text: '适合单件重量较轻、可连续摊铺输送的小型金属零件批量处理。' },
      { title: '五金件', text: '适合冲压五金、连接件和小型配件的连续式退火、回火或去应力处理。' },
      { title: '冲压件', text: '常见于批量冲压件的连续加热或稳定化处理，需确认变形控制和冷却方式。' },
      { title: '轴承类小件', text: '可评估用于部分轴承小件热处理，重点确认材质、尺寸和温度曲线。' },
      { title: '汽车零部件小件', text: '适用于小型批量零部件连续热处理，需关注节拍、追溯和上下料衔接。' },
      { title: '批量连续热处理工件', text: '适合产量稳定、工艺路线固定、需要连续进出料的热处理任务。' },
    ],
    workpieceTitle: '网带炉适合哪些工件？',
    processCards: [
      { title: '连续退火', text: '适用于小件、五金件和部分金属件软化或组织调整，需确认材质、退火温度、炉内停留时间和冷却方式。' },
      { title: '连续回火', text: '适用于淬火后小件、紧固件和标准件回火，需确认回火温度、网带速度、装料厚度和记录要求。' },
      { title: '淬火加热', text: '可用于连续淬火前加热段，需确认加热温度、转运时间、淬火介质、联锁保护和后续回火配置。' },
      { title: '固溶处理', text: '可根据不锈钢小件或合金件项目要求评估，需重点确认材料牌号、温度制度、冷却速度和气氛条件。' },
      { title: '时效处理', text: '适用于部分合金小件或金属件批量时效，需确认温度区间、保温时间、产能节拍和装料方式。' },
      { title: '去应力处理', text: '适用于小型焊接件、冲压件或机加工件，需确认残余应力来源、升降温要求和连续运行节拍。' },
    ],
    processCardsTitle: '网带炉可覆盖哪些热处理工艺？',
    customSpecs: [
      { key: '工件材质', value: '提供材料牌号、热处理目标和表面质量要求' },
      { key: '工件尺寸', value: '提供单件外形尺寸、最大尺寸和铺料方式' },
      { key: '单件重量', value: '提供单件重量、单位面积装料重量和堆料厚度' },
      { key: '每小时产能', value: '说明每小时处理量、班次制度和连续运行节拍' },
      { key: '网带宽度', value: '按工件铺料宽度、边距、产能和网带承载确定' },
      { key: '网带速度', value: '按炉内停留时间、保温时间和炉膛有效长度核算' },
      { key: '炉膛有效长度', value: '结合温区数量、升温保温时间和连续产能确定' },
      { key: '温区数量', value: '按升温、保温、冷却或回火段配置需求确定' },
      { key: '最高温度', value: '提供设计最高温度和工艺要求的最高温度' },
      { key: '常用工作温度', value: '提供日常运行温度区间，便于炉衬、网带和加热系统选型' },
      { key: '热处理工艺', value: '连续退火、连续回火、淬火加热、固溶、时效、去应力处理等' },
      { key: '气氛要求', value: '空气、氮气、保护气氛或其他气氛要求需按工艺确认' },
      { key: '冷却方式', value: '风冷、水冷、保护气氛冷却、淬火槽或配套冷却段按工艺确定' },
      { key: '上下料方式', value: '人工、料斗、振动上料、输送衔接或自动化联动按现场确认' },
      { key: '加热方式', value: '电阻加热 / 燃气加热，可结合能源条件和工艺要求选择' },
      { key: '控制系统要求', value: 'PLC、触摸屏、温控仪、记录仪、多温区控制、报警保护等' },
      { key: '连续运行时间', value: '说明日运行小时、班次、维护窗口和长期连续运行要求' },
      { key: '现场空间与配套条件', value: '提供车间长度、电源、气源、排烟、冷却水、上下游设备和安装边界' },
    ],
    configurations: [
      { title: '小件连续网带炉', image: imagesBySlug['mesh-belt-furnace'].configs[0], specs: ['网带宽度：按工件铺料和产能节拍定制', '温区配置：按连续退火、回火或淬火加热工艺确定', '冷却方式：风冷、水冷或配套冷却段按项目确认', '适用场景：标准件、紧固件、五金件连续热处理'] },
      { title: '网带式热处理生产线', image: imagesBySlug['mesh-belt-furnace'].configs[1], specs: ['炉膛长度：按保温时间和网带速度核算', '控制系统：可配置 PLC、触摸屏、多温区记录', '联动设备：可评估上料、清洗、淬火、回火和出料衔接', '适用场景：小型金属件、汽车小件、热处理外协连续产线'] },
    ],
    processSteps: [
      { title: '提交参数', text: '提供工件材质、尺寸、重量、产能、温度和工艺要求。' },
      { title: '判断结构', text: '核算网带宽度、运行速度、炉膛长度和装料方式。' },
      { title: '确认配置', text: '明确温区、温度、气氛、冷却方式和联动边界。' },
      { title: '方案报价', text: '形成技术方案、主要配置、报价范围和交付边界。' },
      { title: '制造检查', text: '完成炉体、网带、传动、炉衬、加热和电控系统检查。' },
      { title: '安装售后', text: '到场完成安装调试、操作培训和后续服务支持。' },
    ],
    processes: ['连续退火', '连续回火', '淬火加热', '固溶处理', '时效处理', '去应力处理'],
    industries: ['标准件', '五金件', '汽车零部件', '轴承小件', '机械小件', '不锈钢小件', '热处理外协厂'],
    leadBullets: ['按产能节拍判断炉膛长度', '按工件尺寸匹配网带宽度', '按工艺曲线配置温区和冷却', '按现场条件明确整线边界'],
    parameterTitle: '网带炉定制需要确认哪些参数？',
    parameterLink: {
      title: '查看报价需要哪些参数',
      description: '查看报价参数说明页。',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    parameterNote:
      '网带炉报价不能只按炉型名称估算，具体需结合工件材质、尺寸、单件重量、每小时产能、网带宽度、炉膛长度、温区数量、气氛和冷却方式确定，最终以双方确认的技术方案为准。',
    structureTitle: '网带炉主要结构组成',
    structureComponents: [
      { title: '炉体结构', text: '包括炉壳、炉膛、保温层、温区划分和检修结构，需按连续运行和维护要求设计。' },
      { title: '网带输送系统', text: '网带材质、宽度、速度、张紧结构和传动方式需结合工件重量、温度和运行节拍确定。' },
      { title: '加热系统', text: '可选电阻加热或燃气加热，具体需根据温度范围、能源条件、产能和现场安全要求选择。' },
      { title: '炉衬保温系统', text: '耐火材料、陶瓷纤维和复合保温结构需按温度等级、连续运行工况和维护周期选型。' },
      { title: '冷却系统', text: '风冷、水冷、保护气氛冷却或配套冷却段需结合材料、工艺目标和后续工序确认。' },
      { title: '控制系统', text: '可配置 PLC、触摸屏、温控仪、记录仪、多温区控制、变频输送和报警保护。' },
      { title: '上下料与联动', text: '可根据项目需求配置上料、出料、清洗、淬火槽、回火炉等联动设备。' },
    ],
    priceFactorsTitle: '网带炉价格受哪些因素影响？',
    priceFactorsIntro:
      '网带炉通常为连续式非标热处理设备，不能脱离工件、节拍和工艺直接给出固定价格。以下因素会明显影响炉体结构、输送系统、控制配置和交付范围。',
    priceFactors: [
      '网带宽度',
      '炉膛长度',
      '温区数量',
      '最高温度',
      '产能节拍',
      '网带材质',
      '加热方式',
      '气氛要求',
      '冷却方式',
      '控制系统配置',
      '是否需要上下料联动',
      '是否需要清洗、淬火、回火等配套设备',
      '是否涉及安装调试',
    ],
    comparisonTitle: '网带炉、台车炉、辊底炉怎么选？',
    comparisonHeaders: ['网带炉适合', '台车炉适合', '辊底炉适合'],
    comparisonRows: [
      { left: '小件、标准件、紧固件批量处理', middle: '大型工件或单件较重的周期式装炉', right: '板材、棒材或较规整工件连续输送' },
      { left: '产能稳定，需要连续生产', middle: '批次变化较多，需要整炉进出料', right: '产线节拍明确，对炉内输送稳定性要求高' },
      { left: '单件重量较轻，可摊铺在网带上', middle: '需要行车吊装或台车承载', right: '工件更适合辊道支撑和直线输送' },
      { left: '关注网带速度、铺料厚度和上下料衔接', middle: '关注炉膛尺寸、台车承重和轨道基础', right: '关注炉辊材质、承载、传动和辊道维护' },
      { left: '适合连续退火、回火、淬火加热等小件批量工艺', middle: '适合大型铸锻件、模具、结构件周期式热处理', right: '适合板材、棒材、管材等连续热处理生产线' },
    ],
    processStepsTitle: '网带炉定制流程',
    industryCards: [
      { title: '标准件', text: '常见于螺栓、螺母等标准件连续退火、回火或淬火加热处理。' },
      { title: '五金件', text: '适合冲压五金、小型连接件和批量配件的连续式热处理场景。' },
      { title: '汽车零部件', text: '常用于小型零部件的连续生产，需关注节拍、稳定性和数据记录要求。' },
      { title: '轴承小件', text: '可根据材质、尺寸和热处理目标评估连续加热、回火或稳定化处理方案。' },
      { title: '机械小件', text: '适合规格稳定、单件较轻、需要连续进出料的机械零件热处理。' },
      { title: '不锈钢小件', text: '可评估连续退火或固溶处理，需重点确认材料牌号、温度和冷却要求。' },
      { title: '热处理外协厂', text: '适合批量稳定、工艺路线清晰的小件连续加工，需综合工艺覆盖和换产效率。' },
    ],
    scenarioCards: [
      { title: '标准件连续回火', text: '围绕回火温度、装料厚度、网带速度和记录要求确定温区与控制配置。' },
      { title: '小型金属件连续退火', text: '根据材质、退火温度、保温时间和冷却方式评估炉膛长度和产能节拍。' },
      { title: '不锈钢小件固溶处理', text: '可作为项目方向初步评估，需结合材料牌号、固溶温度、冷却速度和气氛条件确认。' },
      { title: '热处理外协厂连续生产线', text: '重点关注多品种换产、上下料衔接、维护窗口和后续扩展空间。' },
    ],
    scenarioIntro:
      '当前页面不虚构客户案例。以下仅作为网带炉常见应用场景说明，具体项目可在商务沟通中结合授权资料进一步确认。',
    leadForm: {
      title: '需要定制网带炉？',
      description:
        '把工件材质、尺寸、单件重量、每小时产能、最高温度、热处理工艺、网带宽度、气氛要求和现场条件发给苏能，技术人员可先判断网带炉结构、温区配置、输送速度和控制方案。',
      submitLabel: '提交需求',
      contactHref: '/zh/contact',
      contactLabel: '联系苏能工业炉',
      phone: '+86-130-5298-6814',
      email: 'jssngyl@outlook.com',
    },
  },
  'roller-hearth-furnace': {
    series: '辊底炉系列',
    title: '辊底炉｜辊底式热处理炉定制',
    breadcrumbSeries: '辊底炉系列',
    summary:
      '辊底炉适用于板材、棒材、管材、规整工件和连续生产场景的退火、回火、固溶、正火等热处理工艺。苏能可根据工件材质、尺寸、重量、产能节拍、最高温度、辊道承载方式、上下料条件和现场空间，提供辊底式热处理炉非标定制方案。',
    sellingPoints: ['连续式热处理', '辊道输送定制', '温区配置按项目确认', '上下游联动可评估'],
    quickTags: ['板材 / 棒材 / 管材', '连续式热处理', '辊道宽度定制', '多温区控温', '退火 / 回火 / 固溶', 'PLC 控制系统'],
    ctaHighlights: ['成立于 2006 年', '14700㎡生产基地', '非标辊底炉定制'],
    heroCtas: [
      {
        title: '获取报价方案',
        description: '滚动到询价表单，提交辊底炉参数。',
        href: '#product-lead-form',
      },
      {
        title: '查看报价需要哪些参数',
        description: '了解工业炉报价前建议准备的资料。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
    ],
    reasons: [
      { title: '满足工艺需求', text: '根据工件规格、热处理温度、保温时间和连续输送要求，定制炉膛长度、加热分区和控温曲线。' },
      { title: '贴合设备需求', text: '根据产线节拍、上下料方式和工件重量，匹配辊道结构、输送速度和自动化程度。' },
      { title: '优化处理一致性', text: '通过分区控温、炉辊输送和热循环优化，具备改善工件受热一致性的空间。' },
      { title: '优化运行能耗', text: '可根据加热段、保温段和炉体保温结构进行配置优化，按工况评估能耗改善空间。' },
      { title: '按项目配置稳定性', text: '炉辊、传动系统、炉衬结构、加热系统和控制系统按连续运行工况配置。' },
    ],
    customSpecs: [
      { key: '工件材质', value: '提供材料牌号、热处理目标和表面质量要求' },
      { key: '工件形态', value: '板材、棒材、管材、规整工件等需说明承载和输送方式' },
      { key: '工件尺寸', value: '提供长度、宽度、厚度、直径、最大外形和常见规格' },
      { key: '单件重量', value: '提供单件重量、最大重量、重心位置和辊道接触方式' },
      { key: '每小时产能', value: '说明每小时处理量、班次制度、连续运行节拍和节拍波动' },
      { key: '炉膛有效宽度', value: '按工件宽度、输送间隙、热循环空间和辊道结构确定' },
      { key: '炉膛有效长度', value: '按升温、保温、冷却时间和输送速度综合核算' },
      { key: '辊道宽度', value: '按工件承载宽度、边距、跑偏控制和维护空间确认' },
      { key: '辊距', value: '按工件长度、重量、挠度控制和输送稳定性确定' },
      { key: '辊棒材质', value: '需结合工作温度、工件重量、炉内气氛、维护周期和备件条件选择' },
      { key: '输送速度', value: '按炉内停留时间、产能节拍、温区长度和上下料能力核算' },
      { key: '温区数量', value: '按升温、保温、冷却或工艺段配置需求确定' },
      { key: '最高温度', value: '提供设计最高温度和工艺要求的最高温度' },
      { key: '常用工作温度', value: '提供日常运行温度区间，便于炉衬、炉辊和加热系统选型' },
      { key: '热处理工艺', value: '退火、回火、固溶、正火、连续热处理等' },
      { key: '温度均匀性要求', value: '需结合有效工作区、装料方式、热循环结构和验收口径确认' },
      { key: '气氛要求', value: '空气、氮气、保护气氛或其他气氛要求需按工艺确认' },
      { key: '冷却方式', value: '风冷、水冷、气氛冷却或配套冷却段按工艺确定' },
      { key: '上下料方式', value: '人工、辊道衔接、机械上料或自动化联动按现场确认' },
      { key: '控制系统要求', value: 'PLC、触摸屏、温控仪、记录仪、多温区控制、报警保护等' },
      { key: '现场空间与上下游设备条件', value: '提供车间长度、电源、气源、排烟、冷却水、上下游设备和安装边界' },
    ],
    configurations: [
      { title: '板材棒材辊底炉', image: imagesBySlug['roller-hearth-furnace'].configs[0], specs: ['有效宽度：按板材、条材或棒材规格定制', '温区配置：按升温、保温和冷却节拍确认', '辊道系统：按工件重量和输送稳定性设计', '适用场景：板材、棒材、中型规整工件连续热处理'] },
      { title: '连续式辊底热处理炉', image: imagesBySlug['roller-hearth-furnace'].configs[1], specs: ['炉膛长度：按保温时间、输送速度和产能节拍核算', '控制系统：可配置 PLC、触摸屏、多温区记录', '上下游衔接：按进出料、冷却段和现场布置评估', '适用场景：管材、规整工件和连续热处理生产线'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['退火', '回火', '固溶', '正火', '连续式热处理', '气氛保护可评估'],
    industries: ['钢材加工', '大型板材', '棒材管材', '机械制造', '能源装备', '高端装备零部件'],
    leadBullets: ['按工件形态判断辊道结构', '按产能节拍核算炉膛长度', '按温区要求配置控制系统', '按上下游条件明确整线边界'],
    parameterTitle: '辊底炉定制需要确认哪些参数？',
    parameterLink: {
      title: '查看报价需要哪些参数',
      description: '查看报价参数说明页。',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    comparisonTitle: '辊底炉、网带炉、台车炉怎么选？',
    comparisonHeaders: ['辊底炉适合', '网带炉适合', '台车炉适合'],
    comparisonRows: [
      { left: '板材、棒材、管材或较规整工件', middle: '小件、标准件、紧固件', right: '大型工件' },
      { left: '工件可由辊道稳定承载和输送', middle: '单件较轻，可铺放在网带上', right: '单件较重或形状不规则' },
      { left: '连续式生产节拍明确', middle: '批量稳定、连续进出料', right: '周期式装炉' },
      { left: '对炉内输送稳定性要求较高', middle: '关注网带速度、铺料厚度和上下料衔接', right: '需要台车承载或行车吊装' },
      { left: '适合连续退火、固溶、回火等生产线', middle: '适合小件连续热处理', right: '适合大型铸锻件、模具、结构件热处理' },
    ],
    leadForm: {
      title: '需要定制辊底炉？',
      description:
        '把工件材质、尺寸、重量、产能节拍、最高温度、热处理工艺、辊道承载方式、上下料条件和现场空间发给苏能，技术人员可先判断辊底炉结构、温区配置、输送系统和控制方案。',
      submitLabel: '提交需求',
      contactHref: '/zh/contact',
      contactLabel: '联系苏能工业炉',
      phone: '+86-130-5298-6814',
      email: 'jssngyl@outlook.com',
    },
  },
  'rotary-hearth-furnace': {
    series: '转底炉系列',
    title: '转底炉｜转底式热处理炉定制',
    breadcrumbSeries: '转底炉系列',
    summary:
      '转底炉适用于锻件、盘类工件、环形工件、模具、五金零件及节拍式连续加热、退火、正火、回火等工艺。苏能可根据工件材质、尺寸、重量、产能节拍、炉底直径、进出料方式和现场空间，提供转底式热处理炉非标定制方案。',
    sellingPoints: ['环形炉底连续加热', '节拍式生产', '炉底转速按项目确认', '上下料方式可评估'],
    quickTags: ['转底式热处理炉', '环形炉底连续加热', '退火 / 正火 / 回火', '炉底直径定制', '进出料节拍确认', 'PLC 控制系统'],
    ctaHighlights: ['成立于 2006 年', '14700㎡生产基地', '非标转底炉定制'],
    heroCtas: [
      {
        title: '获取报价方案',
        description: '滚动到询价表单，提交转底炉参数。',
        href: '#product-lead-form',
      },
      {
        title: '查看报价需要哪些参数',
        description: '了解工业炉报价前建议准备的资料。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
    ],
    reasons: [
      { title: '满足工艺需求', text: '根据工件规格、加热温度、保温时间和生产节拍，定制炉底直径、旋转速度和加热分区。' },
      { title: '贴合设备需求', text: '根据车间布局、上下料方式和自动化需求，匹配转底结构、进出料方式和控制系统。' },
      { title: '优化处理一致性', text: '通过炉底转速、温区布置和控温系统优化，具备改善工件受热一致性的空间。' },
      { title: '能耗优化评估', text: '可根据炉体保温、加热分区和运行制度进行能耗优化评估。' },
      { title: '按工况配置稳定性', text: '按生产工况配置旋转炉底、传动系统、炉衬结构和控温系统，提升运行稳定性。' },
    ],
    customSpecs: [
      { key: '工件材质', value: '提供材料牌号、热处理目标和表面质量要求' },
      { key: '工件形态', value: '锻件、盘类件、环形件、模具、五金件或其他节拍式加热工件' },
      { key: '工件尺寸', value: '提供最大外形、常见规格、摆放方式和工件间距要求' },
      { key: '单件重量', value: '提供单件重量、最大重量和炉底承载分布要求' },
      { key: '每小时产能', value: '说明每小时处理量、节拍制度和连续运行要求' },
      { key: '炉底直径', value: '按工件布料区域、进出料位置和炉内停留时间核算' },
      { key: '有效布料区域', value: '按工件摆放、间距、旋转路径和加热覆盖范围确认' },
      { key: '炉膛有效高度', value: '按工件高度、工装高度、热循环空间和安全间隙确定' },
      { key: '炉底承载', value: '按工件重量、布料方式、炉底结构和旋转机构综合设计' },
      { key: '炉底转速', value: '按加热时间、保温时间、进出料节拍和温区布置确认' },
      { key: '进出料方式', value: '人工、机械手、输送机或自动化上下料按现场条件评估' },
      { key: '温区数量', value: '按升温、保温、出料温度和工艺段配置需求确定' },
      { key: '最高温度', value: '提供设计最高温度和工艺要求的最高温度' },
      { key: '常用工作温度', value: '提供日常运行温度区间，便于炉衬和加热系统选型' },
      { key: '热处理工艺', value: '连续加热、退火、正火、回火或其他节拍式热处理工艺' },
      { key: '加热方式', value: '电阻加热、燃气加热或其他方式需结合工艺和能源条件确认' },
      { key: '气氛要求', value: '空气、保护气氛或其他气氛要求需按材料和工艺确认' },
      { key: '冷却方式', value: '自然冷却、风冷、配套冷却段或下游冷却设备按工艺确认' },
      { key: '自动化上下料要求', value: '按节拍、定位、工装回流和上下游设备联动需求确认' },
      { key: '控制系统要求', value: 'PLC、触摸屏、温控仪、记录仪、多温区控制、报警保护等' },
      { key: '现场空间与上下游设备条件', value: '提供车间空间、电源、气源、排烟、基础和上下游设备条件' },
    ],
    configurations: [
      { title: '小型转底炉', image: imagesBySlug['rotary-hearth-furnace'].configs[0], specs: ['工件范围：按小型零件、盘类件或环形件确认', '炉底直径：按有效布料区域和节拍核算', '温区配置：按升温、保温和出料温度确认', '适用场景：小型零件、五金件、节拍式加热'] },
      { title: '大型转底炉', image: imagesBySlug['rotary-hearth-furnace'].configs[1], specs: ['工件范围：按模具、锻件或批量加热工件确认', '炉底承载：按单件重量、布料方式和旋转机构设计', '上下料方式：按机械上料、输送衔接和现场空间评估', '适用场景：模具、锻造、高端装备零部件、机械制造'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['连续加热', '退火', '正火', '回火', '锻造加热', '节拍式热处理'],
    industries: ['模具制造', '五金零件', '高端装备零部件', '锻造', '机械制造', '热处理加工'],
    leadBullets: ['初步方案沟通', '按工艺需求评估炉型', '按参数确认配置边界', '按合同约定提供售后支持'],
    parameterTitle: '转底炉定制需要确认哪些参数？',
    parameterLink: {
      title: '查看报价需要哪些参数',
      description: '查看报价参数说明页。',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    comparisonTitle: '转底炉、推杆炉、台车炉怎么选？',
    comparisonHeaders: ['转底炉适合', '推杆炉适合', '台车炉适合'],
    comparisonRows: [
      { left: '工件适合环形布料或节拍式旋转加热', middle: '工件适合推料方式连续进出炉', right: '大型工件或单件较重' },
      { left: '工件批量较稳定', middle: '工件可按料盘、料筐或批次推进', right: '周期式整炉装卸' },
      { left: '需要连续或半连续节拍生产', middle: '生产节拍稳定', right: '需要台车承载或行车吊装' },
      { left: '对炉底转速、温区布置和进出料节拍有明确要求', middle: '炉内停留时间明确', right: '工件形状不规则' },
      { left: '适合锻件、盘类工件、环形工件、模具及部分小中型批量工件', middle: '适合连续退火、回火、加热等场景', right: '适合大型铸锻件、模具、焊接结构件热处理' },
    ],
    leadForm: {
      title: '需要定制转底炉？',
      description:
        '把工件材质、尺寸、单件重量、产能节拍、炉底直径、最高温度、热处理工艺、进出料方式和现场空间发给苏能，技术人员可先判断转底炉结构、温区配置、炉底旋转机构和控制方案。',
      submitLabel: '提交需求',
      contactHref: '/zh/contact',
      contactLabel: '联系苏能工业炉',
      phone: '+86-130-5298-6814',
      email: 'jssngyl@outlook.com',
    },
  },
  'roller-mesh-belt-line': {
    series: '网带式热处理炉系列',
    title: '托辊型网带式电阻炉生产线｜连续热处理设备定制',
    breadcrumbSeries: '热处理生产线',
    summary:
      '托辊型网带式电阻炉生产线适用于标准件、五金件、轴承零件、冲压件、粉末冶金件和中小型工件的连续退火、回火、正火、固溶、预热及烘干等工艺。苏能可根据工件材质、尺寸、铺料厚度、产能节拍、网带宽度、托辊结构和现场条件，提供连续式热处理设备非标定制方案。',
    sellingPoints: ['连续式热处理', '托辊支撑网带', '多温区控温', '上下游联动可评估'],
    quickTags: ['托辊网带炉', '连续退火 / 回火 / 正火', '网带宽度定制', '托辊结构确认', '电阻加热', 'PLC 控制系统'],
    ctaHighlights: ['成立于 2006 年', '14700㎡生产基地', '非标网带生产线定制'],
    heroCtas: [
      {
        title: '获取报价方案',
        description: '滚动到询价表单，提交托辊型网带炉参数。',
        href: '#product-lead-form',
      },
      {
        title: '查看报价需要哪些参数',
        description: '了解工业炉报价前建议准备的资料。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
    ],
    reasons: [
      { title: '满足工艺需求', text: '根据工件材质、热处理工艺、加热温度、保温时间和冷却要求，定制炉膛长度、加热分区、控温曲线和工艺节拍。' },
      { title: '贴合产线需求', text: '根据工件尺寸、单件重量、批量产能、上下料方式和现场布局，匹配网带宽度、托辊结构、输送速度和自动化程度。' },
      { title: '提升运行稳定性', text: '托辊结构可对网带形成连续支撑，减少网带下垂和跑偏风险，适合连续输送、批量生产和中长炉膛热处理产线。' },
      { title: '改善受热一致性', text: '通过多区控温、稳定输送和热循环设计，具备改善工件受热一致性的空间，具体效果需结合工况确认。' },
      { title: '能耗优化评估', text: '可根据炉体保温结构、加热分区、热循环系统和连续运行制度进行能耗优化评估。' },
      { title: '按工况配置稳定性', text: '网带、托辊、传动系统、加热系统、炉衬结构和电控系统按连续生产工况配置。' },
    ],
    customSpecs: [
      { key: '工件材质', value: '提供材料牌号、热处理目标和表面质量要求' },
      { key: '工件类型', value: '标准件、五金件、轴承零件、冲压件、粉末冶金件等' },
      { key: '工件尺寸', value: '提供最大外形、常见规格、摆放方式和混料情况' },
      { key: '单件重量', value: '提供单件重量、最大重量和单位面积装料负荷' },
      { key: '铺料厚度', value: '按工件堆放方式、透热要求和网带承载能力确认' },
      { key: '每小时产能', value: '说明每小时处理量、班次制度和连续运行节拍' },
      { key: '网带宽度', value: '按有效装料宽度、铺料方式和炉膛结构确认' },
      { key: '网带材质', value: '按工作温度、气氛、工件重量和维护周期选型' },
      { key: '托辊结构', value: '按炉膛长度、网带宽度、装料负荷和连续运行工况设计' },
      { key: '炉膛有效长度', value: '按升温、保温、冷却时间和网带速度综合核算' },
      { key: '加热区长度', value: '按温区数量、保温时间和工艺曲线确认' },
      { key: '温区数量', value: '按升温、保温、出料温度和工艺段配置需求确定' },
      { key: '网带运行速度', value: '按产能节拍、保温时间、铺料厚度和冷却方式确认' },
      { key: '最高温度', value: '提供设计最高温度和工艺要求的最高温度' },
      { key: '常用工作温度', value: '提供日常运行温度区间，便于炉衬和加热元件选型' },
      { key: '热处理工艺', value: '连续退火、回火、正火、固溶、预热、烘干等' },
      { key: '冷却方式', value: '风冷、水冷、油冷、保护气氛冷却或配套冷却段按工艺确认' },
      { key: '配套工段', value: '是否需要淬火槽、清洗、烘干、回火段等需按完整工艺路线确认' },
      { key: '上下料方式', value: '人工、振动上料、输送上料、机械手或自动化联动按现场确认' },
      { key: '控制系统要求', value: 'PLC、触摸屏、温控仪、记录仪、多温区控制、变频输送和报警保护等' },
      { key: '现场空间与上下游设备条件', value: '提供车间空间、电源、排烟、冷却水、基础和上下游设备条件' },
    ],
    configurations: [
      { title: '小型托辊型网带式电阻炉生产线', image: imagesBySlug['roller-mesh-belt-line'].configs[0], specs: ['工件范围：按小型五金件、标准件或冲压件确认', '网带宽度：按有效装料宽度和铺料方式核算', '托辊结构：按炉膛长度和装料负荷确认', '适用场景：小件连续退火、回火、预热或烘干'] },
      { title: '中型托辊型网带式电阻炉生产线', image: imagesBySlug['roller-mesh-belt-line'].configs[1], specs: ['工件范围：按轴承零件、汽车零部件或粉末冶金件确认', '温区配置：按升温、保温和冷却节拍确认', '输送速度：按保温时间和产能节拍核算', '适用场景：批量连续热处理生产线'] },
      { title: '大型托辊型网带式电阻炉生产线', image: imagesBySlug['roller-mesh-belt-line'].configs[0], specs: ['工件范围：按中小型批量工件和连续生产负荷确认', '炉膛长度：按加热区、保温区和配套工段核算', '上下游衔接：按清洗、淬火、回火或冷却段评估', '适用场景：热处理加工厂、汽车零部件、机械制造'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['连续退火', '连续回火', '正火', '固溶', '预热', '烘干', '连续式热处理', '批量化热处理'],
    industries: ['机械制造', '汽车零部件', '五金制品', '紧固件', '轴承配件', '粉末冶金', '冲压件加工', '金属热处理加工', '标准件生产'],
    leadBullets: ['初步方案沟通', '按工艺需求评估炉型', '按参数确认配置边界', '按合同约定提供售后支持'],
    parameterTitle: '托辊型网带炉定制需要确认哪些参数？',
    parameterLink: {
      title: '查看报价需要哪些参数',
      description: '查看报价参数说明页。',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    comparisonTitle: '托辊型网带炉、普通网带炉、辊底炉怎么选？',
    comparisonHeaders: ['托辊型网带炉适合', '普通网带炉适合', '辊底炉适合'],
    comparisonRows: [
      { left: '中长炉膛连续热处理生产线', middle: '小件、标准件、紧固件', right: '板材、棒材、管材或规整工件' },
      { left: '需要托辊支撑网带运行', middle: '单件较轻，可铺放在网带上', right: '工件更适合由辊道直接支撑和输送' },
      { left: '工件批量稳定，连续运行时间较长', middle: '炉膛长度和装料负荷相对适中', right: '对炉内输送稳定性和承载方式要求较高' },
      { left: '对网带运行稳定性和输送支撑有要求', middle: '批量稳定、连续进出料', right: '适合连续热处理生产线' },
      { left: '适合标准件、五金件、冲压件、粉末冶金件等连续处理', middle: '适合小件连续退火、回火、淬火加热', right: '适合规整工件连续退火、固溶、回火' },
    ],
    leadForm: {
      title: '需要定制托辊型网带式电阻炉生产线？',
      description:
        '把工件材质、尺寸、单件重量、铺料厚度、每小时产能、网带宽度、热处理工艺、冷却方式、上下料方式和现场条件发给苏能，技术人员可先判断网带宽度、托辊结构、炉膛长度、温区配置和控制方案。',
      submitLabel: '提交需求',
      contactHref: '/zh/contact',
      contactLabel: '联系苏能工业炉',
      phone: '+86-130-5298-6814',
      email: 'jssngyl@outlook.com',
    },
  },
  'copper-wire-annealing-line': {
    series: '铜丝退火生产线系列',
    title: '铜丝自动化退火生产线｜铜线材连续退火设备定制',
    breadcrumbSeries: '热处理生产线',
    summary:
      '铜丝自动化退火生产线适用于铜丝、铜线、铜合金丝、镀锡铜丝等线材的连续退火、软化退火、光亮退火和去应力处理。苏能可根据线材材质、线径范围、退火温度、运行速度、张力控制、保护气氛和收放线方式，配置铜线材连续退火设备非标方案。',
    sellingPoints: ['铜线材连续退火', '张力控制按项目评估', '保护气氛可评估', '收放线方式定制'],
    quickTags: ['铜丝 / 铜线 / 铜合金丝', '连续退火 / 软化退火', '光亮退火可评估', '张力控制', '保护气氛', 'PLC 控制系统'],
    ctaHighlights: ['成立于 2006 年', '14700㎡生产基地', '非标铜丝退火线定制'],
    heroCtas: [
      {
        title: '获取报价方案',
        description: '滚动到询价表单，提交铜丝退火线参数。',
        href: '#product-lead-form',
      },
      {
        title: '查看报价需要哪些参数',
        description: '了解工业炉报价前建议准备的资料。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
    ],
    reasons: [
      { title: '满足线材工艺需求', text: '根据铜丝材质、线径范围、退火温度、软化程度和表面质量要求，评估退火炉长度、加热分区、速度联动和工艺曲线。' },
      { title: '贴合生产节拍需求', text: '根据客户产能、线速度、收放线方式和现场布局，匹配自动放线、连续退火、冷却烘干、自动收线及张力控制系统。' },
      { title: '改善退火一致性', text: '通过加热分区、速度联动和张力控制，具备改善退火一致性的空间，具体效果需结合线材、速度和工况确认。' },
      { title: '评估表面质量方案', text: '可根据表面质量要求评估保护气氛、冷却清洗、烘干和防氧化结构，具体效果需结合工况确认。' },
      { title: '降低人工操作强度', text: '可配置自动放线、自动收线、张力控制、速度联动和集中电控系统，减少人工干预。' },
      { title: '按项目配置安全措施', text: '按项目配置电气保护、张力控制、报警联锁和操作安全措施。' },
    ],
    customSpecs: [
      { key: '线材材质', value: '紫铜丝、黄铜丝、铜合金丝、镀锡铜丝等，需提供材料牌号和表面状态' },
      { key: '线径范围', value: '提供最小线径、最大线径、常用规格和换规格频率' },
      { key: '单丝 / 多丝方式', value: '说明单根连续退火、多丝并行或其他走线方式' },
      { key: '目标工艺', value: '软化退火、光亮退火、去应力处理或其他线材退火目标' },
      { key: '退火温度', value: '按线材材质、线径、退火目标和运行速度确认' },
      { key: '最高温度', value: '提供工艺要求的最高温度和安全裕量要求' },
      { key: '运行速度', value: '按线径、炉体长度、停留时间、产能要求和收放线能力核算' },
      { key: '产能要求', value: '说明每小时或每班产量、连续运行时间和换线频率' },
      { key: '放线方式', value: '盘具、线轴、主动放线或被动放线需结合现场和张力要求确认' },
      { key: '收线方式', value: '收线盘、工字轮、成圈或其他方式按产品规格确认' },
      { key: '张力控制要求', value: '按线径、速度、断线风险和收放线方式确定控制方案' },
      { key: '是否需要保护气氛', value: '普通软化退火、光亮退火或防氧化目标需分别评估' },
      { key: '气氛类型', value: '氮气、氢氮混合气、惰性气体或其他气氛需按安全和工艺确认' },
      { key: '冷却方式', value: '自然冷却、风冷、水冷或保护气氛冷却按工艺确认' },
      { key: '清洗 / 烘干要求', value: '是否配置前后清洗、烘干、表面处理或配套工段' },
      { key: '表面质量要求', value: '光亮度、氧化控制、残留物和后续镀锡或拉丝要求需说明' },
      { key: '断线保护要求', value: '断线检测、报警停机、张力联锁和安全保护需按产线确认' },
      { key: '控制系统要求', value: 'PLC、触摸屏、温控、速度联动、张力控制、记录和报警保护等' },
      { key: '现场空间与上下游设备条件', value: '提供车间空间、电源、气源、冷却水、收放线区域和上下游设备条件' },
    ],
    configurations: [
      { title: '细铜丝自动化退火生产线', image: imagesBySlug['copper-wire-annealing-line'].configs[0], specs: ['线径范围：按细丝规格和断线风险确认', '退火温度：按材质、软化目标和速度确认', '运行速度：按炉体长度、停留时间和收放线能力核算', '适用产品：细铜丝、电子导线、精密铜线'] },
      { title: '中规格铜线连续退火生产线', image: imagesBySlug['copper-wire-annealing-line'].configs[1], specs: ['线材范围：按铜线、铜合金线或电缆导体规格确认', '张力控制：按线径、盘具和收放线方式设计', '气氛配置：按表面质量和光亮退火目标评估', '适用产品：铜线、铜合金线、电缆导体'] },
      { title: '大规格铜线材连续退火生产线', image: imagesBySlug['copper-wire-annealing-line'].configs[0], specs: ['线材范围：按大规格铜线和重型线材连续退火需求确认', '炉体长度：按退火停留时间和运行速度核算', '冷却方式：按表面质量、出线温度和后续工序确认', '适用产品：大规格铜线、重型线材连续退火'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['连续退火', '软化退火', '光亮退火', '去应力退火', '铜丝退火', '铜线退火', '保护气氛退火', '线材连续热处理'],
    industries: ['电线电缆', '铜材加工', '电子导线', '漆包线前处理', '新能源线束', '铜合金线材', '精密金属线材', '线缆导体制造'],
    leadBullets: ['初步方案沟通', '按工艺需求评估配置', '按参数确认配置边界', '按合同约定提供售后支持'],
    parameterTitle: '铜丝自动化退火生产线定制需要确认哪些参数？',
    parameterLink: {
      title: '查看报价需要哪些参数',
      description: '查看报价参数说明页。',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    comparisonTitle: '铜丝退火线、网带炉、退火固溶生产线怎么选？',
    comparisonHeaders: ['铜丝自动化退火生产线适合', '网带炉适合', '退火固溶生产线适合'],
    comparisonRows: [
      { left: '铜丝、铜线、铜合金丝等线材', middle: '小件、标准件、紧固件、五金件', right: '带材、板材、较规整金属材料' },
      { left: '需要放线、退火、冷却、收线连续生产', middle: '工件可铺放在网带上连续输送', right: '需要连续退火、固溶或热处理生产线' },
      { left: '对张力控制、运行速度和表面质量有要求', middle: '关注网带宽度、铺料厚度和温区配置', right: '关注材料宽度、速度、温区和冷却方式' },
      { left: '适合软化退火、光亮退火、去应力处理', middle: '适合小件连续退火、回火、淬火加热', right: '适合不锈钢、有色金属等连续生产场景' },
      { left: '重点确认线径、速度、气氛和收放线方式', middle: '重点确认工件尺寸、装料方式和产能节拍', right: '重点确认材料规格、带材宽度和工艺曲线' },
    ],
    leadForm: {
      title: '需要定制铜丝自动化退火生产线？',
      description:
        '把线材材质、线径范围、运行速度、退火温度、产能要求、放线收线方式、张力控制、保护气氛和现场条件发给苏能，技术人员可先判断炉体长度、加热分区、冷却方式、收放线系统和控制方案。',
      submitLabel: '提交需求',
      contactHref: '/zh/contact',
      contactLabel: '联系苏能工业炉',
      phone: '+86-130-5298-6814',
      email: 'jssngyl@outlook.com',
    },
  },
  'annealing-solution-line': {
    series: '连续式热处理生产线系列',
    title: '退火固溶生产线｜金属带材连续热处理设备定制',
    breadcrumbSeries: '热处理生产线',
    summary:
      '退火固溶生产线聚焦金属带材、卷材连续热处理场景，适用于不锈钢带材、合金带材、有色金属带材、卷材的连续退火、固溶处理、光亮退火和去应力处理。设备可根据材料牌号、带宽厚度、卷重、运行速度、冷却方式和现场布局进行非标定制。',
    sellingPoints: ['金属带材连续热处理', '连续退火 / 固溶处理', '张力 / 纠偏配置', '冷却段按工艺评估'],
    quickTags: ['退火固溶生产线', '金属带材 / 卷材', '连续退火 / 固溶处理', '张力 / 纠偏配置', '冷却段按工艺评估', 'PLC 控制系统'],
    ctaHighlights: ['成立于 2006 年', '14700㎡生产基地', '非标生产线定制'],
    reasons: [
      { title: '按材料规格评估方案', text: '根据材料牌号、带宽厚度、卷重、退火温度、固溶温度、保温时间和冷却速度要求，评估炉膛长度和工艺曲线。' },
      { title: '贴合连续产线需求', text: '根据产线节拍、开卷收卷方式、入口出口速度、张力控制和现场空间布局，评估整线系统配置。' },
      { title: '改善一致性与表面状态', text: '通过多区控温、稳定输送、热循环优化和冷却段设计，具备改善退火固溶一致性和表面状态的空间，具体效果需结合材料与工况确认。' },
      { title: '改善连续生产衔接', text: '可根据入口活套、出口活套、纠偏、张力控制和联动系统配置，改善连续生产衔接，具体以项目配置为准。' },
      { title: '能耗优化评估', text: '可根据炉体保温、加热分区、余热利用、热循环系统和连续运行制度进行能耗优化评估。' },
      { title: '按工况配置系统', text: '炉体结构、传动系统、辊道系统、加热系统、冷却系统和电控系统按连续生产工况配置。' },
    ],
    customSpecs: [
      { key: '材料牌号', value: '不锈钢、有色金属、合金带材等，需结合牌号和工艺标准确认。' },
      { key: '材料形态', value: '带材、卷材、板带、精密金属带材等。' },
      { key: '带材宽度', value: '提供目标带宽、边部状态和有效加热宽度要求。' },
      { key: '带材厚度', value: '提供厚度范围、厚度波动和热处理目标。' },
      { key: '最大卷重', value: '用于判断收放卷系统、张力控制和现场承载条件。' },
      { key: '入口速度 / 出口速度', value: '结合保温时间、冷却能力、活套配置和前后工序确认。' },
      { key: '目标产能', value: '按材料规格、运行制度和连续生产节拍评估。' },
      { key: '退火温度', value: '按材料牌号、组织状态和退火目标确认。' },
      { key: '固溶温度', value: '按材料牌号、固溶目标、冷却方式和验收要求确认。' },
      { key: '最高工作温度', value: '结合炉衬、加热系统、温区布置和安全边界确认。' },
      { key: '保温时间', value: '结合带材厚度、运行速度和有效加热区长度核算。' },
      { key: '冷却速度', value: '按材料工艺、表面状态和冷却段配置确认。' },
      { key: '冷却方式', value: '风冷、水冷、气雾冷却或分段冷却，需按工艺评估。' },
      { key: '是否需要保护气氛', value: '根据光亮退火、表面质量和氧化控制要求评估。' },
      { key: '表面质量要求', value: '需明确氧化、色差、划伤、板形和后续工序要求。' },
      { key: '张力控制要求', value: '结合卷重、带宽厚度、速度和收放卷方式确认。' },
      { key: '纠偏要求', value: '结合带材宽度、速度、入口出口布置和现场条件确认。' },
      { key: '活套配置', value: '入口活套、出口活套或其他缓冲段按连续生产节拍评估。' },
      { key: '产线边界', value: '明确放卷、清洗、加热、冷却、收卷及上下游设备接口。' },
      { key: '控制系统要求', value: 'PLC、触摸屏、记录仪、数据追溯和联动控制按项目确认。' },
      { key: '现场空间与上下游设备条件', value: '提供车间布局、基础、吊装、能源接口和前后工序条件。' },
    ],
    configurations: [
      { title: '金属带材退火固溶线', image: imagesBySlug['annealing-solution-line'].configs[0], specs: ['适用材料：不锈钢带材、合金带材、精密金属带材', '带宽厚度：按材料规格确认', '工作温度：按退火或固溶工艺确认', '运行速度：按保温时间和冷却能力评估'] },
      { title: '连续退火固溶生产线', image: imagesBySlug['annealing-solution-line'].configs[1], specs: ['适用材料：奥氏体不锈钢、不锈钢卷材、冷轧带材', '温区配置：按工艺曲线确认', '冷却方式：按材料与表面要求评估', '控制系统：按张力、纠偏和数据记录需求配置'] },
      { title: '卷材连续热处理线', image: imagesBySlug['annealing-solution-line'].configs[0], specs: ['适用材料：宽幅不锈钢带材、合金带材、有色金属带材', '卷重范围：按收放卷系统和现场条件确认', '产线边界：按放卷、清洗、加热、冷却、收卷接口确认', '验收指标：以双方确认技术方案为准'] },
    ],
    processSteps: defaultProcessSteps,
    processes: ['连续退火', '固溶处理', '光亮退火', '去应力退火', '不锈钢退火', '不锈钢固溶', '钢带热处理', '卷材连续热处理'],
    industries: ['不锈钢加工', '金属带材加工', '钢带热处理', '冷轧带材生产', '精密合金材料', '新能源材料', '汽车零部件材料', '能源装备材料'],
    leadBullets: ['初步方案沟通', '按材料规格与退火固溶工艺评估配置', '按参数确认配置边界', '按合同约定提供售后支持'],
    parameterTitle: '退火固溶生产线定制需要确认哪些参数？',
    parameterLink: {
      title: '查看报价需要哪些参数',
      description: '整理报价参数说明，便于技术人员判断方案边界。',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    comparisonTitle: '退火固溶生产线、铜丝退火线、网带炉怎么选？',
    comparisonHeaders: ['退火固溶生产线适合', '铜丝自动化退火生产线适合', '网带炉适合'],
    comparisonRows: [
      { left: '不锈钢带材、合金带材、有色金属带材', middle: '铜丝、铜线、铜合金丝等线材', right: '小件、标准件、紧固件、五金件' },
      { left: '带宽、厚度、卷重明确的卷材连续处理', middle: '需要放线、退火、冷却、收线连续生产', right: '工件可铺放在网带上连续输送' },
      { left: '需要连续退火、固溶处理、光亮退火或去应力处理', middle: '关注线径、速度、张力控制和表面质量', right: '关注网带宽度、铺料厚度和温区配置' },
      { left: '对张力、纠偏、冷却和收放卷衔接有要求', middle: '适合软化退火、光亮退火、去应力处理', right: '适合小件连续退火、回火、淬火加热' },
      { left: '适合金属带材连续热处理生产线', middle: '重点确认线径、速度、气氛和收放线方式', right: '重点确认铺料方式、装料负荷和上下料衔接' },
    ],
    leadForm: {
      title: '需要定制退火固溶生产线？',
      description:
        '把材料牌号、带材宽度、厚度范围、最大卷重、退火或固溶温度、运行速度、冷却方式、表面质量要求、张力控制和现场布局发给苏能，技术人员可先判断炉膛长度、温区配置、冷却段、收放卷系统和控制方案。',
      submitLabel: '提交需求',
      contactHref: '/zh/contact',
      contactLabel: '联系苏能工业炉',
      phone: '+86-130-5298-6814',
      email: 'jssngyl@outlook.com',
    },
  },
};

const productGeoEnhancements: Partial<
  Record<string, Pick<StaticProductDetail, 'parameterNote' | 'geoSections' | 'faq' | 'relatedLinks'>>
> = {
  'roller-mesh-belt-line': {
    parameterNote:
      '托辊型网带式电阻炉生产线报价不能只按设备名称估算，需结合工件材质、尺寸、铺料厚度、产能节拍、网带宽度、托辊结构、炉膛长度、配套工段和现场条件确定，最终以双方确认的技术方案为准。',
    geoSections: buildGeoSections(
      '托辊型网带式电阻炉生产线适合小型零件、紧固件、标准件、冲压件、粉末冶金件和批量连续热处理件。工件尺寸、单件重量、堆放方式和批量节拍会影响网带宽度、托辊结构、炉膛长度和上下料方式，需要结合现场产线条件确认。',
      '该类生产线常用于连续淬火、回火、正火、退火和批量连续热处理。是否配置淬火槽、回火段、清洗烘干或保护气氛，需要结合材料牌号、热处理曲线、冷却方式和表面质量要求评估。',
      ['网带宽度与有效装料宽度', '网带材质和托辊支撑结构', '运行速度和保温时间', '加热区长度和控温分区', '冷却方式和前后段衔接', '连续生产节拍和上下料方式'],
    ),
    faq: [
      {
        question: 'Q1：托辊型网带式电阻炉生产线适合哪些工件？',
        answer:
          '托辊型网带式电阻炉生产线适合标准件、五金件、轴承零件、冲压件、粉末冶金件和中小型批量工件。具体能否采用托辊网带结构，需要结合工件尺寸、单件重量、铺料厚度、热处理工艺和连续运行节拍判断。',
      },
      {
        question: 'Q2：托辊型网带炉和普通网带炉有什么区别？',
        answer:
          '托辊型网带炉通过托辊对网带形成支撑和导向，更适合中长炉膛、连续运行时间较长或装料相对稳定的生产线。普通网带炉结构相对简化，常用于小件、轻载和炉膛长度相对适中的连续热处理场景。',
      },
      {
        question: 'Q3：托辊型网带炉可以做连续退火、回火、正火吗？',
        answer:
          '可以。托辊型网带炉可按项目用于连续退火、回火、正火、固溶、预热和烘干等工艺。不同工艺对最高温度、保温时间、冷却方式、网带速度、温区数量和配套工段要求不同，应在方案阶段逐项确认。',
      },
      {
        question: 'Q4：托辊型网带炉价格主要看哪些参数？',
        answer:
          '价格主要受网带宽度、炉膛有效长度、加热区长度、托辊结构、温区数量、最高温度、网带材质、每小时产能、冷却方式、是否配置淬火槽、清洗、烘干或回火段，以及控制系统和安装调试范围影响。',
      },
      {
        question: 'Q5：网带宽度和运行速度怎么确定？',
        answer:
          '网带宽度通常由工件外形、铺放方式、有效装料宽度和装料负荷决定；运行速度与加热时间、保温时间、冷却方式、产能节拍和加热区长度相关。两者需要与温区数量、托辊结构和前后工序联动核算。',
      },
      {
        question: 'Q6：托辊型网带炉温度均匀性怎么保证？',
        answer:
          '温度均匀性与有效加热区、网带速度、装料厚度、温区布置、加热元件、热循环结构、炉衬保温、测温方式和验收口径有关。具体指标不能脱离项目配置承诺，应结合工况、测试条件和合同约定确认。',
      },
      {
        question: 'Q7：老旧网带生产线可以改造或大修吗？',
        answer:
          '可以先评估炉衬状态、网带和托辊磨损、加热元件、传动系统、温控系统、保温密封、冷却段和能耗数据。是否适合改造或大修，需要结合设备年限、停产窗口、备件条件和改造后工艺目标判断。',
      },
      {
        question: 'Q8：托辊型网带炉询价前需要准备哪些资料？',
        answer:
          '建议准备工件材质、类型、尺寸、单件重量、铺料厚度、每小时产能、最高温度、常用工作温度、热处理工艺、冷却方式、是否需要清洗烘干或回火段、上下料方式和现场布置资料。',
      },
    ],
    relatedLinks: [
      {
        title: '工业炉报价需要哪些参数',
        description: '整理炉型、尺寸、温度、产能、工艺曲线和现场条件，提高询价效率。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title: '工业炉节能改造与热处理炉大修服务',
        description: '了解老旧网带炉、连续热处理生产线的炉衬、传动、加热和控制系统评估思路。',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: '热处理炉厂家页面',
        description: '了解苏能作为热处理炉厂家的产品范围、制造能力和定制流程。',
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: '网带炉页面',
        description: '了解小件、标准件和连续式批量热处理的网带炉方案。',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
      {
        title: '辊底炉页面',
        description: '了解板材、棒材、管材和规整工件连续热处理的辊底炉方案。',
        href: '/zh/products/detail/roller-hearth-furnace',
      },
      {
        title: '推杆炉页面',
        description: '对比推料方式连续进出炉、料盘料框承载和稳定节拍生产场景。',
        href: '/zh/products/detail/pusher-furnace',
      },
      {
        title: '产品中心',
        description: '查看苏能已公开的热处理炉、工业炉和热处理生产线产品。',
        href: '/zh/products',
      },
      {
        title: '联系我们',
        description: '提交托辊型网带炉参数、咨询方案或预约进一步技术沟通。',
        href: '/zh/contact',
      },
    ],
  },
  'copper-wire-annealing-line': {
    parameterNote:
      '以上为常见配置范围，具体需结合线材材质、线径范围、退火目标、运行速度、保护气氛和现场条件确认，最终以双方确认的技术方案为准。',
    geoSections: buildGeoSections(
      '铜丝自动化退火生产线适合铜丝、铜线、铜合金线材和部分有色金属线材的连续退火或软化处理。线径范围、线材材质、表面状态、放线收线方式和张力控制要求，会直接影响炉体长度、速度联动和保护气氛配置。',
      '常见工艺包括连续退火、软化处理和去应力处理；光亮退火需要按项目评估保护气氛、密封结构、露点控制和冷却方式。不同线径和材质对应的退火温度、停留时间和表面质量要求应单独确认。',
      ['线径范围和材质牌号', '放线收线方式与张力控制', '运行速度和退火停留时间', '温区长度与控温分区', '气氛保护和密封需求', '表面质量、冷却和烘干要求'],
    ),
    faq: [
      {
        question: 'Q1：铜丝自动化退火生产线适合哪些线材？',
        answer:
          '铜丝自动化退火生产线适合紫铜丝、黄铜丝、铜合金丝、镀锡铜丝及相关铜线材的连续退火、软化退火和去应力处理。具体方案需要结合线径范围、线材状态、表面质量目标、收放线方式和张力控制要求确定。',
      },
      {
        question: 'Q2：铜丝退火温度和线径有什么关系？',
        answer:
          '退火温度、线径和运行速度需要联动考虑。线径越大，热透时间通常越长；线径较细时，还要关注张力、表面氧化和断线风险。最终温度曲线应结合材料牌号、退火目标、炉体长度和运行速度确认。',
      },
      {
        question: 'Q3：连续退火生产线速度怎么确定？',
        answer:
          '连续退火生产线速度由线径、线材材质、退火温度、炉内有效加热长度、冷却方式和收放线能力共同决定。设计时需要核算线材在炉内的停留时间，并与张力控制、表面质量目标和收卷节拍匹配。',
      },
      {
        question: 'Q4：铜丝退火生产线是否需要保护气氛？',
        answer:
          '是否配置保护气氛取决于线材表面质量、氧化控制、光亮退火目标和生产成本。普通软化退火与光亮退火的密封、气体、冷却和安全配置不同，需要按工艺目标和现场条件单独评估。',
      },
      {
        question: 'Q5：铜丝自动化退火线价格主要看哪些参数？',
        answer:
          '价格主要受线径范围、线材材质、炉体长度、加热分区、运行速度、产能要求、张力控制、保护气氛、冷却方式、清洗烘干配置、收放线系统、控制系统和安装调试范围影响。建议先提交参数再判断方案和报价范围。',
      },
      {
        question: 'Q6：铜丝退火线张力控制为什么重要？',
        answer:
          '张力控制会影响线材运行稳定性、断线风险、收卷质量和退火过程一致性。细线、高速运行或多丝并行时，对放线、牵引、收线和速度联动要求更高。具体控制方式需要结合线径、盘具、速度和现场工况确认。',
      },
      {
        question: 'Q7：老旧铜丝退火生产线可以改造或大修吗？',
        answer:
          '可以先评估炉体保温、加热元件、温控系统、传动张力、密封结构、冷却烘干、收放线系统和能耗数据。是否适合改造或大修，需要结合设备状态、产能瓶颈、产品质量目标、备件条件和停机窗口判断。',
      },
      {
        question: 'Q8：铜丝退火生产线询价前需要准备哪些资料？',
        answer:
          '建议准备线材材质、线径范围、单丝或多丝方式、退火目标、常用温度、运行速度、产能要求、收放线方式、张力控制要求、是否需要保护气氛、冷却清洗烘干要求、现场空间和照片。',
      },
    ],
    relatedLinks: [
      {
        title: '工业炉报价需要哪些参数',
        description: '整理炉型、尺寸、温度、产能、工艺曲线和现场条件，提高询价效率。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title: '工业炉节能改造与热处理炉大修服务',
        description: '了解老旧退火炉、线材退火生产线的保温、加热、传动和控制系统评估思路。',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: '热处理炉厂家页面',
        description: '了解苏能作为热处理炉厂家的产品范围、制造能力和定制流程。',
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: '网带炉页面',
        description: '了解小件、标准件和连续式批量热处理的网带炉方案。',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
      {
        title: '托辊型网带式电阻炉生产线',
        description: '对比小件连续热处理生产线的网带宽度、托辊结构和温区配置。',
        href: '/zh/products/detail/roller-mesh-belt-line',
      },
      {
        title: '退火固溶生产线',
        description: '了解带材、板材和卷材连续退火固溶生产线的方案边界。',
        href: '/zh/products/detail/annealing-solution-line',
      },
      {
        title: '产品中心',
        description: '查看苏能已公开的热处理炉、工业炉和热处理生产线产品。',
        href: '/zh/products',
      },
      {
        title: '联系我们',
        description: '提交铜丝退火线参数、咨询方案或预约进一步技术沟通。',
        href: '/zh/contact',
      },
    ],
  },
  'annealing-solution-line': {
    parameterNote:
      '以上为常见配置范围，具体需结合材料牌号、带宽厚度、卷重、退火或固溶温度、运行速度、冷却方式、现场布局和项目验收要求确认，最终以双方确认的技术方案为准。',
    geoSections: buildGeoSections(
      '退火固溶生产线适合不锈钢带材、有色金属带材、合金带材以及需要连续退火或固溶处理的卷带类材料。带宽、厚度、卷重、材料牌号、表面质量和张力控制要求，会影响炉长、温区、冷却段和整线布置。',
      '常见工艺包括连续退火、固溶处理、去应力处理和连续热处理；光亮退火或特殊气氛工艺需要按项目评估。固溶温度、保温时间、冷却速度和张力控制应结合材料牌号与产品标准确认。',
      ['带宽、厚度和卷重范围', '运行速度与炉内停留时间', '温区长度和有效加热区布置', '冷却段形式和冷却能力', '张力控制、纠偏和活套配置', '现有产线能耗优化空间'],
    ),
    faq: [
      {
        question: 'Q1：退火固溶生产线适合哪些材料？',
        answer:
          '退火固溶生产线适合不锈钢带材、有色金属带材、合金带材和需要连续热处理的卷带类材料。具体能否采用同一生产线，需要结合材料牌号、带宽厚度、卷重、表面质量要求和退火或固溶工艺曲线评估。',
      },
      {
        question: 'Q2：连续退火生产线和单台退火炉有什么区别？',
        answer:
          '连续退火生产线通常包含放卷、清洗、加热、冷却、张力控制、纠偏和收卷等环节，适合稳定批量生产；单台退火炉更适合离散装炉或批量不固定场景。选择时要看产能、材料形态和现场流程。',
      },
      {
        question: 'Q3：生产线速度如何确定？',
        answer:
          '生产线速度需要结合材料厚度、目标温度、炉内有效长度、保温时间、冷却速度、张力控制和前后工序能力确定。速度不是单独参数，应与温区数量、冷却段和整线自动化配置一起核算。',
      },
      {
        question: 'Q4：固溶温度和材料牌号有什么关系？',
        answer:
          '不同材料牌号对应的固溶温度、保温时间和冷却要求不同，不能只按设备最高温度判断。方案设计应由材料工艺要求出发，结合带材厚度、运行速度、冷却方式和炉温均匀性确定。',
      },
      {
        question: 'Q5：退火固溶生产线能否做节能改造？',
        answer:
          '可以评估炉体保温、加热系统、热风循环、冷却段、排烟余热、传动系统和控制逻辑等方向。节能效果需结合原设备状态、材料规格、运行制度、产线负荷和改造范围单独测算。',
      },
      {
        question: 'Q6：退火固溶生产线价格主要看哪些参数？',
        answer:
          '价格主要受材料牌号、带宽厚度、最大卷重、产线速度、退火或固溶温度、炉膛长度、温区数量、冷却方式、张力纠偏、活套配置、控制系统和安装调试边界影响。参数越完整，报价判断越接近真实项目。',
      },
      {
        question: 'Q7：退火固溶生产线温度均匀性怎么保证？',
        answer:
          '温度均匀性需结合有效加热区、温区布置、带材速度、热循环结构、装料状态、测温方式和项目验收要求确认。方案可通过分区控温、炉衬保温、热循环和记录系统优化，但具体指标应在技术方案中明确。',
      },
      {
        question: 'Q8：退火固溶生产线询价前需要准备哪些资料？',
        answer:
          '建议准备材料牌号、带材宽度和厚度、最大卷重、目标产能、退火或固溶温度、运行速度、冷却方式、表面质量、张力控制、收放卷方式和现场布局。资料不完整也可以先沟通，由技术人员判断补充项。',
      },
    ],
    relatedLinks: [
      {
        title: '工业炉报价需要哪些参数',
        description: '整理材料、尺寸、温度、产能和现场条件，便于判断报价边界。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title: '工业炉节能改造与热处理炉大修服务',
        description: '了解老旧退火固溶线的炉衬、加热、冷却和自动化系统评估思路。',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: '热处理炉厂家页面',
        description: '了解苏能作为热处理炉厂家的产品范围、制造能力和定制流程。',
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: '铜丝自动化退火生产线',
        description: '对比铜丝、铜线和铜合金丝连续退火设备的选型边界。',
        href: '/zh/products/detail/copper-wire-annealing-line',
      },
      {
        title: '网带炉页面',
        description: '了解小件、标准件、紧固件连续热处理的网带炉方案。',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
      {
        title: '托辊型网带式电阻炉生产线',
        description: '了解托辊支撑网带、连续退火回火正火设备的配置思路。',
        href: '/zh/products/detail/roller-mesh-belt-line',
      },
      {
        title: '产品中心',
        description: '查看苏能已公开的热处理炉、工业炉和热处理生产线产品。',
        href: '/zh/products',
      },
      {
        title: '联系我们',
        description: '提交退火固溶生产线参数、咨询方案或预约进一步技术沟通。',
        href: '/zh/contact',
      },
    ],
  },
  'box-furnace': {
    geoSections: buildGeoSections(
      '箱式炉适合中小型零件、模具件、试制件、小批量工件和多品种热处理任务。工件尺寸、装炉方式、批量频次、炉门开启方式和实验或生产用途，会影响炉膛尺寸、加热元件布置和控制系统配置。',
      '常见工艺包括退火、回火、正火、淬火前加热、时效和去应力处理。不同工艺对应的温度范围、升温速度、保温时间和气氛需求不同，炉膛结构和加热方式应按具体工艺条件确认。',
      ['炉膛尺寸和有效工作区', '单炉装炉量与工装方式', '最高温度和常用工艺温度', '加热元件形式和维护便利性', '控温精度与温度均匀性', '炉门开启方式和操作空间'],
    ),
    faq: [
      {
        question: 'Q1：箱式炉适合哪些工件？',
        answer:
          '箱式炉适合中小型机械零件、模具、试制件、小批量工件、铸锻件、焊接件和结构件等周期式热处理场景。它结构相对紧凑，适合装卸较简单、批量不大或规格变化较多的工件。具体炉膛尺寸和配置需结合工件尺寸、重量和装炉量判断。',
      },
      {
        question: 'Q2：箱式炉可以做退火、回火、正火吗？',
        answer:
          '可以。箱式炉常用于退火、回火、正火、淬火加热、时效和去应力处理等工艺。不同工艺对最高温度、升降温曲线、保温时间、装炉方式和温度均匀性要求不同，应在方案阶段结合材料牌号和工件状态逐项确认。',
      },
      {
        question: 'Q3：箱式炉价格主要看哪些参数？',
        answer:
          '箱式炉价格主要受炉膛尺寸、最高温度、炉衬材料、加热元件类型、装炉重量、温度均匀性要求、控制系统、炉门结构、是否需要风循环以及安装调试范围影响。箱式炉多为非标定制设备，需先提交参数再判断方案和报价范围。',
      },
      {
        question: 'Q4：箱式炉和台车炉有什么区别？',
        answer:
          '箱式炉结构更紧凑，适合中小型工件、小批量处理、试制或工艺验证；台车炉带有可移动台车，更适合大型、较重或需要行车吊装的工件。选择时应比较工件尺寸、重量、装卸方式、炉膛尺寸和现场空间。',
      },
      {
        question: 'Q5：箱式炉可以做到多高温度？',
        answer:
          '箱式炉的温度等级取决于热处理工艺、炉衬材料、加热元件类型、炉膛尺寸和使用频率，不能只按一个固定最高温度承诺。常见配置会根据工艺温度选择电阻丝、辐射管、硅碳棒或硅钼棒等方案，最终以技术方案为准。',
      },
      {
        question: 'Q6：箱式炉温度均匀性怎么保证？',
        answer:
          '温度均匀性与炉膛尺寸、加热元件布置、炉衬结构、炉门密封、装炉方式、风循环和控温分区有关。方案阶段应结合有效工作区、工件摆放、工艺温度和验收口径确定目标指标，不能脱离炉型和工况直接承诺固定数值。',
      },
      {
        question: 'Q7：旧箱式炉可以改造或大修吗？',
        answer:
          '可以先评估。旧箱式炉常见改造方向包括炉衬翻新、炉门密封修复、加热元件更换、控制系统升级、安全联锁完善和温区控制优化。是否适合改造，需要结合炉体状态、故障记录、能耗情况、备件条件和停产窗口综合判断。',
      },
      {
        question: 'Q8：箱式炉询价前需要准备哪些资料？',
        answer:
          '建议准备工件材质、尺寸、单件重量、每炉装炉量、最高温度、常用工作温度、热处理工艺、温度均匀性要求、加热方式、炉门结构、现场空间和安装条件。资料不完整也可以先沟通，由技术人员判断需补充内容。',
      },
    ],
    relatedLinks: [
      {
        title: '工业炉报价需要哪些参数',
        description: '整理炉型、尺寸、温度、装炉量、工艺曲线和现场条件，提高箱式炉询价效率。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title: '工业炉节能改造与热处理炉大修服务',
        description: '了解老旧箱式炉、热处理炉的炉衬、炉门密封、加热元件和控制系统评估思路。',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: '热处理炉厂家页面',
        description: '了解苏能作为热处理炉厂家的产品范围、制造能力和定制流程。',
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: '台车炉页面',
        description: '对比大型工件、周期式装炉和台车承重定制场景下的台车炉方案。',
        href: '/zh/products/detail/trolley-furnace',
      },
      {
        title: '网带炉页面',
        description: '了解小件、标准件和连续式批量热处理的网带炉方案。',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
      {
        title: '产品中心',
        description: '查看苏能已公开的热处理炉、工业炉和热处理生产线产品。',
        href: '/zh/products',
      },
      {
        title: '联系我们',
        description: '提交箱式炉参数、咨询方案或预约进一步技术沟通。',
        href: '/zh/contact',
      },
    ],
  },
  'pit-furnace': {
    parameterNote:
      '井式炉报价不能只按炉型名称估算，需结合工件长度、直径、装炉重量、有效工作区、炉盖结构、吊装方式、温度与工艺要求确定，最终以双方确认的技术方案为准。',
    geoSections: buildGeoSections(
      '井式炉适合轴类、杆类、套筒类、长轴件和需要竖向装炉的工件。工件长度、直径、吊装方式、装炉重量和变形控制要求，会影响井深、有效直径、炉盖结构、吊具和安全操作配置。',
      '常见工艺包括回火、退火、淬火加热、时效和去应力处理。是否配置气氛保护、热风循环或特殊吊装结构，需要结合材料、工件长径比、温度均匀性要求和现场操作方式评估。',
      ['井深、有效直径和有效加热区', '工件长度、重量与吊装方式', '炉盖结构和密封形式', '温度均匀性和控温分区', '装出炉安全操作和现场空间', '控制系统、联锁和数据记录要求'],
    ),
    faq: [
      {
        question: 'Q1：井式炉适合哪些工件？',
        answer:
          '井式炉适合轴类、杆件、长件、套筒件以及更适合竖直装炉的工件，常用于回火、退火、淬火加热、时效和去应力处理。具体是否适合，需要结合工件长度、直径、重量、吊装方式和工艺曲线判断。',
      },
      {
        question: 'Q2：井式炉可以做回火、退火、淬火加热吗？',
        answer:
          '可以。井式炉可根据项目要求用于回火、退火、淬火前加热、时效和去应力处理等工艺。不同工艺对温度范围、升降温制度、保温时间、转移方式和控制记录要求不同，应在方案阶段逐项确认。',
      },
      {
        question: 'Q3：井式炉价格主要看哪些参数？',
        answer:
          '井式炉价格主要受有效直径、有效深度、最高温度、装炉重量、炉盖结构、加热方式、炉衬材料、控制系统、气氛要求和现场施工范围影响。井式炉多为非标设备，建议先提交参数再判断方案和报价范围。',
      },
      {
        question: 'Q4：井式炉和箱式炉有什么区别？',
        answer:
          '井式炉采用立式装炉，更适合轴类、杆件、套筒件和长件；箱式炉结构更紧凑，适合中小型工件、小批量或试制任务。选择时应比较工件高度、装卸方式、吊装条件、有效工作区和现场空间。',
      },
      {
        question: 'Q5：井式炉有效深度怎么确定？',
        answer:
          '有效深度通常要根据工件最大长度、吊具高度、炉盖结构、炉口操作空间、装炉间隙和有效加热区确定。若后续产品规格可能变化，也应在设计阶段预留合理余量，避免炉膛尺寸与实际工件不匹配。',
      },
      {
        question: 'Q6：井式炉温度均匀性怎么保证？',
        answer:
          '温度均匀性与有效工作区、加热元件或燃烧系统布置、炉衬结构、控温分区、热电偶位置、装炉间距和工艺制度有关。具体指标不能脱离炉型和工件状态承诺，应在技术方案中明确测试条件和验收口径。',
      },
      {
        question: 'Q7：旧井式炉可以改造或大修吗？',
        answer:
          '可以先做设备状态评估。旧井式炉常见改造方向包括炉衬翻新、加热系统检修、炉盖密封修复、控制系统升级、联锁保护完善等。是否适合大修，需要结合炉体结构、安全风险、备件条件和停产窗口判断。',
      },
      {
        question: 'Q8：井式炉询价前需要准备哪些资料？',
        answer:
          '建议准备工件材质、长度、直径、单件重量、每炉装炉量、最高温度、常用工作温度、热处理工艺、温度均匀性要求、吊装方式、现场空间和照片。资料不完整也可以先沟通，再由技术人员判断需补充内容。',
      },
    ],
    relatedLinks: [
      {
        title: '工业炉报价需要哪些参数',
        description: '整理炉型、尺寸、温度、装炉量、工艺曲线和现场条件，提高询价效率。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title: '工业炉节能改造与热处理炉大修服务',
        description: '了解老旧井式炉、热处理炉的炉衬、加热、炉盖密封和控制系统评估思路。',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: '热处理炉厂家页面',
        description: '了解苏能作为热处理炉厂家的产品范围、制造能力和定制流程。',
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: '台车炉页面',
        description: '对比大型工件、周期式装炉和台车承重定制场景下的台车炉方案。',
        href: '/zh/products/detail/trolley-furnace',
      },
      {
        title: '箱式炉页面',
        description: '对比中小型工件、小批量和试制场景下的箱式炉方案。',
        href: '/zh/products/detail/box-furnace',
      },
      {
        title: '网带炉页面',
        description: '了解小件、标准件和连续式批量热处理的网带炉方案。',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
      {
        title: '产品中心',
        description: '查看苏能已公开的热处理炉、工业炉和热处理生产线产品。',
        href: '/zh/products',
      },
      {
        title: '联系我们',
        description: '提交井式炉参数、咨询方案或预约进一步技术沟通。',
        href: '/zh/contact',
      },
    ],
  },
  'bell-furnace': {
    parameterNote:
      '罩式炉报价不能只按炉型名称估算，需结合工件形态、装炉量、炉罩尺寸、炉台尺寸、温度、气氛、密封、冷却和现场吊装条件确定，最终以双方确认的技术方案为准。',
    geoSections: buildGeoSections(
      '罩式炉适合卷材、小型零件、批量装框零件以及需要罩式加热或整体保温的工件。装料高度、炉罩尺寸、炉台结构、密封条件和冷却方式，会影响炉体结构、气氛配置和生产节拍。',
      '常见工艺包括退火、回火和保温处理；保护气氛热处理需要按项目评估炉罩密封、气体系统、安全联锁和冷却方式。不同装料方式下的温度均匀性和升温时间应单独核算。',
      ['炉罩尺寸、炉台尺寸和装料高度', '装料方式、料框或工装结构', '密封结构和气氛条件', '冷却方式和出炉节拍', '温度均匀性与热循环配置', '炉罩升降、吊装和现场空间'],
    ),
    faq: [
      {
        question: 'Q1：罩式炉适合哪些热处理场景？',
        answer:
          '罩式炉适合卷材、线材、盘卷、小型零件和批量装框工件，常用于退火、回火、保温及气氛保护热处理。具体方案需要结合工件形态、装料高度、炉罩尺寸、炉台结构、气氛要求和冷却方式确认。',
      },
      {
        question: 'Q2：罩式炉和箱式炉有什么区别？',
        answer:
          '罩式炉通常由炉罩与炉台组合，适合盘卷、装框批量工件或需要整体罩式加热的场景；箱式炉结构更固定，适合中小型工件、小批量或试制任务。选择时要看装料方式、操作空间和气氛需求。',
      },
      {
        question: 'Q3：罩式炉可以配置保护气氛吗？',
        answer:
          '可以按项目评估保护气氛配置，但需要确认材料、表面质量要求、气体类型、密封结构、安全联锁、排气方式和冷却条件。保护气氛系统与普通空气炉配置差异较大，应按现场条件和工艺要求设计。',
      },
      {
        question: 'Q4：罩式炉装料方式怎么确定？',
        answer:
          '装料方式通常由工件形态、料框结构、单炉装料量、装料高度、吊装条件和生产节拍决定。设计时要同时考虑有效加热区、热循环通道、炉台承载、装出炉效率、密封结构和后续维护便利性。',
      },
      {
        question: 'Q5：老旧罩式炉可以大修吗？',
        answer:
          '可以先评估炉罩、炉台、密封结构、炉衬、加热元件、热循环、气氛系统和控制系统状态。是否适合大修，需要结合设备年限、备件条件、现有故障、停产窗口、运行记录和未来产能需求判断。',
      },
      {
        question: 'Q6：罩式炉价格主要看哪些参数？',
        answer:
          '罩式炉价格主要受炉罩尺寸、炉台尺寸、装料高度、装炉重量、最高温度、加热方式、气氛系统、密封要求、冷却方式、控制系统和现场安装范围影响。建议先提交参数，再判断方案和报价范围。',
      },
      {
        question: 'Q7：罩式炉温度均匀性怎么保证？',
        answer:
          '温度均匀性与有效工作区、装料方式、炉罩结构、炉衬保温、热循环系统、控温分区、测温方式和验收口径有关。具体指标不宜脱离工况直接承诺，应在技术方案中明确测试条件和验收要求。',
      },
      {
        question: 'Q8：罩式炉询价前需要准备哪些资料？',
        answer:
          '建议准备工件材质、工件形态、单件或单框重量、每炉装炉量、炉罩尺寸、炉台尺寸、最高温度、常用工作温度、热处理工艺、气氛要求、冷却方式、吊装条件和现场照片。',
      },
    ],
    relatedLinks: [
      {
        title: '工业炉报价需要哪些参数',
        description: '整理炉型、尺寸、温度、装炉量、工艺曲线和现场条件，提高询价效率。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title: '工业炉节能改造与热处理炉大修服务',
        description: '了解老旧罩式炉、热处理炉的炉罩、密封、炉衬、气氛和控制系统评估思路。',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: '热处理炉厂家页面',
        description: '了解苏能作为热处理炉厂家的产品范围、制造能力和定制流程。',
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: '箱式炉页面',
        description: '对比中小型工件、小批量和试制场景下的箱式炉方案。',
        href: '/zh/products/detail/box-furnace',
      },
      {
        title: '井式炉页面',
        description: '了解轴类、杆件、长件和竖直装炉场景下的井式炉方案。',
        href: '/zh/products/detail/pit-furnace',
      },
      {
        title: '台车炉页面',
        description: '对比大型工件、周期式装炉和台车承重定制场景下的台车炉方案。',
        href: '/zh/products/detail/trolley-furnace',
      },
      {
        title: '产品中心',
        description: '查看苏能已公开的热处理炉、工业炉和热处理生产线产品。',
        href: '/zh/products',
      },
      {
        title: '联系我们',
        description: '提交罩式炉参数、咨询方案或预约进一步技术沟通。',
        href: '/zh/contact',
      },
    ],
  },
  'pusher-furnace': {
    parameterNote:
      '推杆炉报价不能只按炉型名称估算，需结合工件材质、尺寸、重量、产能节拍、推料节拍、炉膛通道、承载方式、温区数量、上下料方式和现场条件确定，最终以双方确认的技术方案为准。',
    geoSections: buildGeoSections(
      '推杆炉适合批量连续热处理工件、棒材、坯料、结构件以及使用料盘或料框承载的生产场景。工件形态、料盘尺寸、推料节拍、温区数量和出料方式，会影响推杆机构、炉膛长度和整线布置。',
      '常见工艺包括连续加热、正火、退火和淬火前加热。是否配套冷却、回火或保护气氛，需要结合工件材质、装料方式、工艺曲线、节拍要求和现场前后工序确定。',
      ['推料机构和推力裕量', '料盘、料框和工装尺寸', '生产节拍与炉内停留时间', '温区数量和加热区长度', '进出料方式和前后工序衔接', '炉底结构、密封和维护便利性'],
    ),
    faq: [
      {
        question: 'Q1：推杆炉适合哪些工件？',
        answer:
          '推杆炉适合批量稳定、节拍明确、可用料盘、料框、托盘或工装承载的连续热处理工件，如棒材、坯料、结构件和部分批量零件。具体能否采用推杆方式，需要结合工件重量、摆放方式和出料衔接判断。',
      },
      {
        question: 'Q2：推杆炉可以做退火、回火、加热吗？',
        answer:
          '可以。推杆炉可按项目用于连续退火、回火、正火、淬火前加热和其他连续加热工艺。不同工艺对最高温度、保温时间、推料节拍、冷却方式和控制记录要求不同，应在方案阶段逐项确认。',
      },
      {
        question: 'Q3：推杆炉价格主要看哪些参数？',
        answer:
          '推杆炉价格主要受炉膛有效宽度和长度、炉内通道尺寸、承载方式、推杆机构形式、温区数量、最高温度、产能节拍、气氛和冷却要求、控制系统和安装调试范围影响。建议先提交参数再判断报价范围。',
      },
      {
        question: 'Q4：推杆炉和辊底炉有什么区别？',
        answer:
          '推杆炉通常通过推杆机构推动料盘、料框或工装按节拍前进；辊底炉通过炉辊支撑和输送工件，更适合板材、棒材、管材等规整工件。选择时要比较承载方式、单件重量、节拍和维护便利性。',
      },
      {
        question: 'Q5：推杆炉的推料节拍怎么确定？',
        answer:
          '推料节拍由每小时产能、单次推进装料量、炉膛有效长度、温区数量、升温和保温时间、冷却或转运节奏以及上下料能力共同决定。设计时需要把料盘间距、推料周期和前后工序衔接一起核算。',
      },
      {
        question: 'Q6：推杆炉温度均匀性怎么保证？',
        answer:
          '温度均匀性与炉膛有效尺寸、温区划分、加热元件或燃烧系统布置、炉衬保温、推料节拍、装料方式、热循环结构和验收口径有关。具体指标应结合项目配置、工况和测试条件确认。',
      },
      {
        question: 'Q7：旧推杆炉可以改造或大修吗？',
        answer:
          '可以先评估炉衬保温、炉门密封、加热系统、推杆机构、导轨、传动系统、温控分区和自动化控制状态。是否适合改造，需要结合炉体状态、节拍瓶颈、备件条件、停产窗口和改造目标判断。',
      },
      {
        question: 'Q8：推杆炉询价前需要准备哪些资料？',
        answer:
          '建议准备工件材质、形态、尺寸、单件重量、每小时产能、推料节拍、最高温度、常用工作温度、热处理工艺、温度均匀性要求、气氛和冷却要求、上下料方式及现场布置资料。',
      },
    ],
    relatedLinks: [
      {
        title: '工业炉报价需要哪些参数',
        description: '整理炉型、尺寸、温度、产能、工艺曲线和现场条件，提高询价效率。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title: '工业炉节能改造与热处理炉大修服务',
        description: '了解老旧推杆炉、连续热处理炉的炉衬、推料机构、加热和控制系统评估思路。',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: '热处理炉厂家页面',
        description: '了解苏能作为热处理炉厂家的产品范围、制造能力和定制流程。',
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: '辊底炉页面',
        description: '了解板材、棒材、管材和规整工件连续热处理的辊底炉方案。',
        href: '/zh/products/detail/roller-hearth-furnace',
      },
      {
        title: '网带炉页面',
        description: '了解小件、标准件和连续式批量热处理的网带炉方案。',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
      {
        title: '台车炉页面',
        description: '对比大型工件、周期式装炉和台车承重定制场景下的台车炉方案。',
        href: '/zh/products/detail/trolley-furnace',
      },
      {
        title: '产品中心',
        description: '查看苏能已公开的热处理炉、工业炉和热处理生产线产品。',
        href: '/zh/products',
      },
      {
        title: '联系我们',
        description: '提交推杆炉参数、咨询方案或预约进一步技术沟通。',
        href: '/zh/contact',
      },
    ],
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
        question: 'Q1：网带炉适合哪些工件？',
        answer:
          '网带炉适合标准件、紧固件、五金件、冲压件、小型金属零件和批量连续热处理工件，尤其适合单件较轻、规格稳定、可连续摊铺输送的产品。选型时需要结合工件尺寸、单件重量、铺料厚度、产能节拍和热处理工艺判断。',
      },
      {
        question: 'Q2：网带炉可以做退火、回火、固溶吗？',
        answer:
          '网带炉可用于连续退火、连续回火、淬火加热、时效和去应力处理等工艺。固溶处理也可按项目评估，但需要重点确认材料牌号、温度制度、冷却速度、气氛条件和网带耐热要求，不建议脱离工件与工艺直接选型。',
      },
      {
        question: 'Q3：网带炉价格主要看哪些参数？',
        answer:
          '网带炉价格主要受网带宽度、炉膛长度、温区数量、最高温度、产能节拍、网带材质、加热方式、气氛要求、冷却方式、控制系统和上下料联动影响。网带炉通常为非标设备，需要先提交参数，再判断方案和报价范围。',
      },
      {
        question: 'Q4：网带炉和台车炉有什么区别？',
        answer:
          '网带炉强调连续输送和稳定节拍，适合小件、标准件和紧固件批量热处理；台车炉采用周期式装炉，更适合大型、较重或形状不规则的工件。选择时应比较工件重量、装料方式、产能节拍和现场上下料条件。',
      },
      {
        question: 'Q5：网带炉可以连续运行吗？',
        answer:
          '网带炉属于常见连续式热处理炉型，可按项目配置连续进料、加热、保温、冷却、回火或清洗烘干等环节。但连续运行能力与网带材质、传动系统、炉衬、加热系统、维护窗口和现场管理有关，需结合实际工况确认。',
      },
      {
        question: 'Q6：网带炉温度均匀性怎么保证？',
        answer:
          '温度均匀性与炉膛长度、温区划分、加热元件或燃烧系统布置、炉衬保温、网带速度、装料厚度、气氛流动和控制系统有关。方案阶段应结合有效加热区、工艺温度和验收口径确定目标指标，不宜脱离工况承诺固定数值。',
      },
      {
        question: 'Q7：旧网带炉可以改造或大修吗？',
        answer:
          '可以先评估。旧网带炉常见改造方向包括炉衬翻新、网带和传动系统检修、加热系统升级、温区控制改造、冷却段优化和安全联锁完善。是否适合改造，需要结合炉体状态、停产窗口、备件条件和改造费用综合判断。',
      },
      {
        question: 'Q8：网带炉询价前需要准备哪些资料？',
        answer:
          '建议准备工件材质、尺寸、单件重量、每小时产能、网带宽度或现有线速、最高温度、热处理工艺、气氛要求、冷却方式、上下料方式、现场照片和配套条件。资料不完整也可以先沟通，由技术人员判断需补充内容。',
      },
    ],
    relatedLinks: [
      {
        title: '工业炉报价需要哪些参数',
        description: '整理炉型、尺寸、温度、产能、工艺曲线和现场条件，提高网带炉询价效率。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title: '工业炉节能改造与热处理炉大修服务',
        description: '了解老旧网带炉、连续热处理炉的炉衬、网带传动、加热和控制系统评估思路。',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: '热处理炉厂家页面',
        description: '了解苏能作为热处理炉厂家的产品范围、制造能力和定制流程。',
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: '台车炉页面',
        description: '对比大型工件、周期式装炉和台车承重定制场景下的台车炉方案。',
        href: '/zh/products/detail/trolley-furnace',
      },
      {
        title: '箱式炉页面',
        description: '了解中小型工件、小批量和试制场景下的箱式炉方案。',
        href: '/zh/products/detail/box-furnace',
      },
      {
        title: '产品中心',
        description: '查看苏能已公开的热处理炉、工业炉和热处理生产线产品。',
        href: '/zh/products',
      },
      {
        title: '联系我们',
        description: '提交网带炉参数、咨询方案或预约进一步技术沟通。',
        href: '/zh/contact',
      },
    ],
  },
  'roller-hearth-furnace': {
    parameterNote:
      '辊底炉报价不能只按炉型名称估算，需结合工件材质、尺寸、重量、产能节拍、炉膛长度、辊道结构、温区数量、冷却方式、上下料方式和现场条件确定，最终以双方确认的技术方案为准。',
    geoSections: buildGeoSections(
      '辊底炉适合板材、管材、棒材以及中大型连续热处理工件。工件重量、长度、直线度、辊道接触方式、运行速度和炉膛密封要求，会影响辊道材质、传动结构、温区控制和整线布置。',
      '常见工艺包括退火、正火、回火和连续热处理；固溶处理需要按项目评估材料牌号、温度制度、冷却速度和辊道耐热条件。不同工件截面和重量对应的输送方式应单独确认。',
      ['辊道材质、直径和耐热等级', '工件重量、长度和支撑方式', '运行速度与炉内停留时间', '温区控制和炉温均匀性', '辊底传动、密封和维护空间', '冷却段、上下料和前后工序衔接'],
    ),
    faq: [
      {
        question: 'Q1：辊底炉适合哪些工件？',
        answer:
          '辊底炉适合板材、棒材、管材、规整工件和较重的连续热处理工件，尤其适合可由辊道稳定承载和输送的场景。具体方案需要结合工件材质、尺寸、重量、支撑方式、产能节拍和工艺曲线判断。',
      },
      {
        question: 'Q2：辊底炉可以做退火、回火、固溶吗？',
        answer:
          '可以。辊底炉可按项目用于连续退火、回火、正火、固溶和其他连续热处理工艺。不同工艺对最高温度、保温时间、冷却方式、气氛条件和辊道耐热要求不同，应在方案阶段逐项确认。',
      },
      {
        question: 'Q3：辊底炉价格主要看哪些参数？',
        answer:
          '辊底炉价格主要受炉膛有效宽度、有效长度、辊道宽度、辊距、辊棒材质、温区数量、最高温度、产能节拍、冷却方式、气氛要求、控制系统和安装调试范围影响。建议先提交参数再判断报价范围。',
      },
      {
        question: 'Q4：辊底炉和网带炉有什么区别？',
        answer:
          '辊底炉通过炉辊承载和输送工件，更适合板材、棒材、管材或较规整工件；网带炉依靠网带输送，适合小件、标准件和紧固件。选择时要比较单件重量、铺料方式、输送稳定性和产能节拍。',
      },
      {
        question: 'Q5：辊底炉的辊道怎么设计？',
        answer:
          '辊道设计需要结合工件尺寸、单件重量、炉膛宽度、辊距、运行速度、工作温度、炉内气氛和维护周期确定。高温或重载工况下，还要关注辊棒材质、变形控制、传动同步和备件更换便利性。',
      },
      {
        question: 'Q6：辊底炉温度均匀性怎么保证？',
        answer:
          '温度均匀性与炉膛有效宽度和长度、温区划分、加热元件或燃烧系统布置、炉衬保温、热循环结构、输送速度、装炉方式和验收口径有关。具体指标应结合项目配置和测试条件确认。',
      },
      {
        question: 'Q7：旧辊底炉可以改造或大修吗？',
        answer:
          '可以先评估炉衬保温、炉辊磨损、传动系统、加热系统、温控分区、密封结构、冷却段和自动化控制状态。是否适合改造，需要结合炉体状态、辊道寿命、停产窗口、备件条件和改造目标判断。',
      },
      {
        question: 'Q8：辊底炉询价前需要准备哪些资料？',
        answer:
          '建议准备工件材质、形态、尺寸、单件重量、每小时产能、最高温度、常用工作温度、热处理工艺、温度均匀性要求、气氛和冷却要求、上下料方式、现场空间及上下游设备资料。',
      },
    ],
    relatedLinks: [
      {
        title: '工业炉报价需要哪些参数',
        description: '整理炉型、尺寸、温度、产能、工艺曲线和现场条件，提高询价效率。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title: '工业炉节能改造与热处理炉大修服务',
        description: '了解老旧辊底炉、连续热处理炉的炉辊、传动、炉衬、加热和控制系统评估思路。',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: '热处理炉厂家页面',
        description: '了解苏能作为热处理炉厂家的产品范围、制造能力和定制流程。',
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: '网带炉页面',
        description: '了解小件、标准件和连续式批量热处理的网带炉方案。',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
      {
        title: '台车炉页面',
        description: '对比大型工件、周期式装炉和台车承重定制场景下的台车炉方案。',
        href: '/zh/products/detail/trolley-furnace',
      },
      {
        title: '箱式炉页面',
        description: '对比中小型工件、小批量和试制场景下的箱式炉方案。',
        href: '/zh/products/detail/box-furnace',
      },
      {
        title: '产品中心',
        description: '查看苏能已公开的热处理炉、工业炉和热处理生产线产品。',
        href: '/zh/products',
      },
      {
        title: '联系我们',
        description: '提交辊底炉参数、咨询方案或预约进一步技术沟通。',
        href: '/zh/contact',
      },
    ],
  },
  'rotary-hearth-furnace': {
    parameterNote:
      '转底炉报价不能只按炉型名称估算，需结合工件材质、尺寸、单件重量、产能节拍、炉底直径、有效布料区域、温区数量、进出料方式和现场条件确定，最终以双方确认的技术方案为准。',
    geoSections: buildGeoSections(
      '转底炉适合环形布料、模具、锻件、小中型批量工件和需要节拍式连续加热的工件。炉底直径、旋转机构、装料方式、工件重量和进出料节拍，会影响炉膛分区、炉底承载和上下料布置。',
      '常见工艺包括加热、退火、正火、回火和时效处理。涉及锻造加热或节拍式连续生产时，需要确认工件摆放、加热均匀性、出料温度、旋转速度和现场自动化衔接。',
      ['炉底直径和有效布料区域', '旋转机构、承载和定位方式', '装料方式与工件重量', '加热均匀性和温区分布', '进出料节拍和自动化衔接', '炉底密封、维护和安全联锁'],
    ),
    faq: [
      {
        question: 'Q1：转底炉适合哪些工件？',
        answer:
          '转底炉适合锻件、盘类工件、环形工件、模具、五金零件以及适合环形布料或节拍式旋转加热的批量工件。是否适合采用转底结构，需要结合工件重量、摆放方式、进出料节拍和现场空间判断。',
      },
      {
        question: 'Q2：转底炉可以做退火、正火、回火和加热吗？',
        answer:
          '可以。转底炉可按项目用于节拍式连续加热、退火、正火、回火及部分锻造加热场景。不同工艺对最高温度、保温时间、炉底转速、温区布置、冷却方式和出料节拍要求不同，应在方案阶段逐项确认。',
      },
      {
        question: 'Q3：转底炉价格主要看哪些参数？',
        answer:
          '转底炉价格主要受炉底直径、有效布料区域、炉底承载、温区数量、最高温度、产能节拍、加热方式、气氛和冷却要求、进出料方式、自动化程度、控制系统和安装调试范围影响。建议先提交参数再判断报价范围。',
      },
      {
        question: 'Q4：转底炉和台车炉有什么区别？',
        answer:
          '转底炉通过旋转炉底实现节拍式加热和连续或半连续进出料，适合批量较稳定的场景；台车炉更适合大型、较重或形状不规则工件整炉装卸。选择时要看工件尺寸、装料方式、产能节拍和现场吊装条件。',
      },
      {
        question: 'Q5：转底炉和推杆炉怎么选？',
        answer:
          '转底炉更适合环形布料、炉底旋转和固定进出料位置的节拍式生产；推杆炉更适合料盘、料筐或批次工件按直线方向推进。选择时需要比较工件摆放方式、炉内停留时间、上下料衔接和维护便利性。',
      },
      {
        question: 'Q6：转底炉加热均匀性怎么保证？',
        answer:
          '加热均匀性与有效布料区域、炉底转速、工件摆放、温区布置、加热元件或燃烧系统、炉膛循环、测温点和验收口径有关。具体指标不能脱离项目配置承诺，应结合工况、测试条件和合同约定确认。',
      },
      {
        question: 'Q7：旧转底炉可以改造或大修吗？',
        answer:
          '可以先评估炉底旋转机构、传动系统、密封结构、炉衬、加热系统、温控分区、安全联锁和电控系统状态。是否适合改造或大修，需要结合炉体状态、故障记录、备件条件、生产负荷和停产窗口判断。',
      },
      {
        question: 'Q8：转底炉询价前需要准备哪些资料？',
        answer:
          '建议准备工件材质、形态、尺寸、单件重量、每小时产能、炉底直径或现场空间、最高温度、常用工作温度、热处理工艺、进出料方式、气氛和冷却要求、自动化需求及现场布置资料。',
      },
    ],
    relatedLinks: [
      {
        title: '工业炉报价需要哪些参数',
        description: '整理炉型、尺寸、温度、产能、工艺曲线和现场条件，提高询价效率。',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title: '工业炉节能改造与热处理炉大修服务',
        description: '了解老旧转底炉、热处理炉的旋转机构、炉衬、加热、密封和控制系统评估思路。',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: '热处理炉厂家页面',
        description: '了解苏能作为热处理炉厂家的产品范围、制造能力和定制流程。',
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: '推杆炉页面',
        description: '对比推料方式连续进出炉、料盘料框承载和稳定节拍生产场景。',
        href: '/zh/products/detail/pusher-furnace',
      },
      {
        title: '台车炉页面',
        description: '对比大型工件、周期式装炉和台车承重定制场景下的台车炉方案。',
        href: '/zh/products/detail/trolley-furnace',
      },
      {
        title: '辊底炉页面',
        description: '了解板材、棒材、管材和规整工件连续热处理的辊底炉方案。',
        href: '/zh/products/detail/roller-hearth-furnace',
      },
      {
        title: '产品中心',
        description: '查看苏能已公开的热处理炉、工业炉和热处理生产线产品。',
        href: '/zh/products',
      },
      {
        title: '联系我们',
        description: '提交转底炉参数、咨询方案或预约进一步技术沟通。',
        href: '/zh/contact',
      },
    ],
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
