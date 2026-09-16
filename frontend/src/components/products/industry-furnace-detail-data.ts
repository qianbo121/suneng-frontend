import type { FurnaceCutawayCallout, FurnaceCutawayLabelPosition } from './FurnaceCutawayDiagram';

export type IndustryFurnaceSlug =
  | 'box-furnace'
  | 'trolley-furnace'
  | 'bell-furnace'
  | 'mesh-belt-furnace'
  | 'pusher-furnace'
  | 'roller-hearth-furnace'
  | 'rotary-hearth-furnace';

export type FurnaceImage = {
  src: string;
  alt: string;
  caption: string;
  unoptimized?: boolean;
};

type OptionGroup = {
  title: string;
  options: string[];
};

type Solution = {
  title: string;
  image?: string;
  alt?: string;
  eyebrow: string;
  text: string;
  suitable: string;
  advantage: string;
  verify: string;
  noPromise: string;
};

type FurnacePageConfig = {
  slug: IndustryFurnaceSlug;
  name: string;
  englishName: string;
  title: string;
  description: string;
  gallery: FurnaceImage[];
  tags: string[];
  heroInfo: Array<[string, string]>;
  productProperties: Array<{ name: string; value: string }>;
  heroNotice: string;
  workpieces: Array<{
    status: string;
    tone: 'positive' | 'caution';
    title: string;
    text: string;
  }>;
  suitableConditions: string[];
  requiredConditions: string[];
  workpieceWarning: string;
  optionGroups: OptionGroup[];
  solutions: Solution[];
  equations: Array<[string, string, string]>;
  boundaryImage: FurnaceImage;
  boundaryFacts: Array<[string, string]>;
  requiredData: Array<[string, string]>;
  standards: Array<{ group: string; items: string[] }>;
  structureImage: FurnaceImage;
  structureCallouts: FurnaceCutawayCallout[];
  structureParameters: Array<[string, string]>;
  structureSystems: Array<[string, string]>;
  faqs: Array<{ question: string; answer: string }>;
  related: Array<{
    title: string;
    image: string;
    alt: string;
    text: string;
    href: string;
  }>;
};

const commonStandards = {
  effectiveZone: ['GB/T 9452-2023'],
  resistance: ['GB/T 10067.1-2019', 'GB/T 10067.4-2005', 'GB/T 10066.4-2004'],
  resistanceSafety: [
    'GB/T 5959.1-2019（仅适用于电热装置）',
    'GB 5959.4-2008（仅适用于电阻加热装置）',
  ],
  generalSafety: ['GB/T 37752.1-2019', 'GB/T 5226.1-2019'],
  burnerReference: ['GB/T 19839-2025（仅作为工业燃油燃气燃烧器参考）'],
} as const;

const relatedArticles = [
  ['工业炉报价需要哪些参数', '/zh/articles/gongye-lu-baojia-canshu'],
  ['热处理炉厂家选择时应核对哪些能力边界', '/zh/solutions/rechuli-lu-changjia'],
  ['旧炉维修、节能改造或控制系统升级', '/zh/service/furnace-renovation-overhaul'],
] as const;

export { relatedArticles };

type DetailImageRole =
  | 'main'
  | 'loading'
  | 'lining'
  | 'processLine'
  | 'gas'
  | 'control'
  | 'cutaway';

const detailImageFiles: Record<DetailImageRole, string> = {
  main: '01-main-scene.png',
  loading: '02-loading.png',
  lining: '03-lining-heating.png',
  processLine: '04-process-line.png',
  gas: '05-gas-fired.png',
  control: '06-control-record.png',
  cutaway: '07-structural-cutaway.png',
};

const trolleyReviewedImages: Record<DetailImageRole, string> = {
  main: '/images/products/trolley-furnace/reviewed-20260909/01-main-scene-b7225c291e71.png',
  loading: '/images/products/trolley-furnace/reviewed-20260909/02-loading-61638c6894bd.png',
  lining: '/images/products/trolley-furnace/reviewed-20260909/03-lining-heating-6a88eed493f6.png',
  processLine:
    '/images/products/trolley-furnace/reviewed-20260909/04-process-line-51580f06f2bc.png',
  gas: '/images/products/trolley-furnace/reviewed-20260909/05-gas-fired-9b785c9d8906.png',
  control: '/images/products/trolley-furnace/reviewed-20260909/06-control-record-511a4a755888.png',
  cutaway:
    '/images/products/trolley-furnace/reviewed-20260909/07-structural-cutaway-fa39c7cd6ff0.png',
};

const detailImage = (slug: IndustryFurnaceSlug, role: DetailImageRole) =>
  slug === 'trolley-furnace'
    ? trolleyReviewedImages[role]
    : `/images/products/${slug}/detail/${detailImageFiles[role]}`;

const calloutLineOrigins: Record<
  FurnaceCutawayLabelPosition,
  Pick<FurnaceCutawayCallout['line'], 'x1' | 'y1'>
> = {
  leftTop: { x1: 21, y1: 15 },
  leftMiddle: { x1: 21, y1: 31 },
  leftBottom: { x1: 21, y1: 43 },
  rightTop: { x1: 79, y1: 17 },
  rightMiddle: { x1: 79, y1: 41 },
  rightBottom: { x1: 79, y1: 53 },
};

const cutawayCallout = (
  position: FurnaceCutawayLabelPosition,
  target: string,
  label: string,
  x2: number,
  y2: number,
): FurnaceCutawayCallout => ({
  position,
  target,
  label,
  line: { ...calloutLineOrigins[position], x2, y2 },
});

export const industryFurnacePageConfigs: Record<IndustryFurnaceSlug, FurnacePageConfig> = {
  'box-furnace': {
    slug: 'box-furnace',
    name: '箱式炉',
    englishName: 'BOX TYPE HEAT TREATMENT FURNACE',
    title: '箱式炉｜中小型工件周期式热处理',
    description:
      '面向中小型机械件、模具、试制件和多品种小批量工件，先根据装料包络、承载方式、工艺曲线和炉门装卸条件判断箱式炉是否适用，再确定有效加热区与加热系统。',
    gallery: [
      {
        src: detailImage('box-furnace', 'main'),
        alt: '箱式热处理炉、升降炉门与炉膛主场景',
        caption: '箱式炉全景',
      },
      {
        src: detailImage('box-furnace', 'loading'),
        alt: '箱式炉装料托盘进入炉膛的场景',
        caption: '装料场景',
      },
      {
        src: detailImage('box-furnace', 'lining'),
        alt: '箱式炉耐火炉衬与加热元件制造检查场景',
        caption: '炉衬与元件',
      },
      {
        src: detailImage('box-furnace', 'control'),
        alt: '箱式炉电控柜与温度记录操作场景',
        caption: '电控与记录',
      },
    ],
    tags: ['中小型工件', '炉门装卸', '周期式生产', '非标方案需工况校核'],
    heroInfo: [
      ['装料包络', '宽 × 高 × 长'],
      ['装载条件', '工件、间距与随炉料具'],
      ['工作温度', '按材料与工艺确定'],
      ['装卸条件', '炉门开口与进出通道'],
    ],
    productProperties: [],
    heroNotice:
      '先核对工件与料具形成的装料包络，再确定工作区、炉门开口和温度条件；有效加热区按约定条件测定。',
    workpieces: [
      {
        status: '通常适合评估',
        tone: 'positive',
        title: '中小型机械件、模具与试制件',
        text: '适合从炉门装卸、按批次完成加热和出料的多品种小批量任务。',
      },
      {
        status: '按装炉方式评估',
        tone: 'positive',
        title: '料框、托盘或炉底板承载工件',
        text: '需核对料具高温强度、工件间距、底部支承和炉门净开口。',
      },
      {
        status: '需要比较炉型',
        tone: 'caution',
        title: '大型重件、长轴或稳定连续批量',
        text: '应同时比较台车炉、井式炉或连续式炉型，避免装卸困难和炉膛利用率偏低。',
      },
    ],
    suitableConditions: [
      '工件可经炉门安全装卸，装料包络和操作空间明确。',
      '生产组织适合一炉一批，换产频率和批次节拍可以接受。',
      '料框、托盘或炉底板能够满足高温承载与热循环要求。',
    ],
    requiredConditions: [
      '材料牌号、工件尺寸、单件质量、每炉数量和净装载。',
      '长期工作温度、最高温度、升降温曲线、保温与冷却方式。',
      '炉门方向、装卸工具、厂房空间、公用条件和验收口径。',
    ],
    workpieceWarning:
      '工件变形同时受材料、原始状态、装炉支承、升降温速率和冷却方式影响，不能只用“炉温均匀”作保证。',
    optionGroups: [
      { title: '热源方式', options: ['电阻加热', '天然气加热', '其他燃料需单独评估'] },
      { title: '循环方式', options: ['自然对流', '强制循环', '导流结构按装炉校核'] },
      { title: '装炉方式', options: ['炉底板', '料框 / 托盘', '专用工装'] },
      { title: '炉内气氛', options: ['空气气氛', '保护气氛', '可控气氛需密封与联锁'] },
      { title: '冷却路径', options: ['炉冷', '出炉空冷', '转移至冷却工位'] },
    ],
    solutions: [
      {
        title: '自然对流箱式电阻炉',
        image: detailImage('box-furnace', 'main'),
        alt: '箱式电阻炉、升降炉门与炉膛主场景',
        eyebrow: '周期式电阻加热',
        text: '适合工艺和装炉状态明确的中小型工件批次热处理。',
        suitable: '中小型工件、小批量、多品种周期式生产',
        advantage: '结构清晰，便于按有效区和装炉方式配置',
        verify: '装料包络、炉门开口、料具和控温区',
        noPromise: '不脱离装炉状态承诺温差和升温时间',
      },
      {
        title: '强制循环箱式炉',
        image: '/images/products/box-furnace/detail/10-circulation-workshop-20260915.webp',
        alt: '强制循环箱式炉厂房场景示意，展示侧壁风机入口、外置驱动与炉内导流板',
        eyebrow: '循环与导流',
        text: '是否配置循环风机和导流结构，应由温度、装炉和工艺目标共同决定。',
        suitable: '需要加强炉内对流换热的中低温工况',
        advantage: '可结合导流改善装载区域内的气流组织',
        verify: '风机耐温、导流、装料阻力与维护空间',
        noPromise: '不把循环风机等同于温度均匀性结果',
      },
      {
        title: '保护气氛箱式炉',
        image: detailImage('box-furnace', 'loading'),
        alt: '箱式炉炉门、装料托盘与炉膛场景',
        eyebrow: '密封与置换',
        text: '需把炉门密封、置换、排放、监测与安全联锁作为完整系统确认。',
        suitable: '对氧化、脱碳或表面状态有控制要求的工况',
        advantage: '可围绕气氛路径与炉门密封形成专项方案',
        verify: '气氛成分、露点目标、密封、排放与联锁',
        noPromise: '不以“通保护气”替代表面质量验收条件',
      },
      {
        title: '生产型箱式炉',
        image: detailImage('box-furnace', 'processLine'),
        alt: '箱式炉与淬火槽及转移机构组成的完整机组',
        eyebrow: '按批次稳定生产',
        text: '围绕装炉频率、炉门动作、记录追溯与维护需求配置。',
        suitable: '批次稳定、需要工艺记录和设备联锁的生产任务',
        advantage: '可把炉体、承载、控制和操作边界整体设计',
        verify: '使用频率、记录方式、联锁与易损件维护',
        noPromise: '不在产量资料不全时承诺生产节拍',
      },
    ],
    equations: [
      ['有效加热区', '≠', '炉膛结构尺寸'],
      ['工件净装载＋随炉料具', '≠', '炉底结构允许载荷'],
    ],
    boundaryImage: {
      src: detailImage('box-furnace', 'lining'),
      alt: '箱式炉耐火炉衬、加热元件和炉底承载结构',
      caption: '炉膛、炉口、承载和加热布置均需围绕有效加热区与装炉状态计算。',
    },
    boundaryFacts: [
      ['有效加热区', '按约定测温方法确认，不直接等同于炉膛内壁尺寸。'],
      ['装料包络', '包含工件、间距和随炉料具，不与有效加热区变量混用。'],
      ['热负荷', '工件净装载与随炉料具质量共同参与升温和功率核算。'],
      ['结构载荷', '炉底板、支承和料具按高温状态与载荷分布校核。'],
      ['炉门净开口', '应满足装卸工装、工件姿态和安全操作空间。'],
      ['能力承诺', '不公开未经技术审核的最大尺寸、最大装载和温差。'],
    ],
    requiredData: [
      ['工件', '名称、材料、最大尺寸、单件质量、每炉数量与表面状态'],
      ['工艺', '长期工作温度、最高温度、曲线、保温时间与冷却方式'],
      ['装炉', '料框 / 托盘 / 炉底板、摆放方式、间距和装卸工具'],
      ['质量', '有效区、记录方式、硬度 / 组织 / 变形及验收口径'],
      ['生产', '批次节拍、换产频率、年运行时间和维护窗口'],
      ['公用条件', '供电或燃气、排烟、厂房空间、基础和安装边界'],
    ],
    standards: [
      {
        group: '箱式电阻炉技术与试验',
        items: [
          'GB/T 10067.44-2014（仅适用于箱式电阻炉）',
          ...commonStandards.resistance,
          ...commonStandards.resistanceSafety,
        ],
      },
      {
        group: '有效加热区、电气与通用安全',
        items: [...commonStandards.effectiveZone, ...commonStandards.generalSafety],
      },
      { group: '燃气方案条件引用', items: [...commonStandards.burnerReference] },
    ],
    structureImage: {
      src: '/images/products/box-furnace/detail/07-structural-cutaway-v2.webp',
      unoptimized: true,
      alt: '箱式炉炉体、炉门、炉衬、加热元件与承载结构剖切示例',
      caption: '箱式炉结构示例 · 具体配置随温度、气氛、装载和操作方式变化',
    },
    structureCallouts: [
      cutawayCallout('leftMiddle', 'shell', '炉体与炉衬', 67, 28),
      cutawayCallout('rightMiddle', 'heating', '加热元件', 43, 41),
      cutawayCallout('rightTop', 'roof', '炉顶结构', 67, 15),
      cutawayCallout('leftTop', 'door', '升降炉门', 28, 28),
      cutawayCallout('leftBottom', 'loading', '承载与料具', 49, 54),
    ],
    structureParameters: [
      ['最大装料包络 Wload × Hload × Lload（mm）', '按工件、间距和随炉料具形成完整包络。'],
      ['单件 / 净装载 / 随炉料具质量（kg）', '热负荷与炉底结构载荷分别核算。'],
      ['长期工作温度 / 最高温度 / 工艺曲线', '用于炉衬、加热元件、功率和控制分区设计。'],
      ['炉门开启方式 / 净开口 / 装卸通道', '核对侧开、升降和工装进出所需空间。'],
      ['炉内气氛 / 冷却路径 / 记录与联锁', '气氛不是单一接口，应按系统确认。'],
    ],
    structureSystems: [
      ['炉体与炉衬', '按有效区、温度等级、热循环和检修边界确定。'],
      ['加热与控温', '电阻或燃气系统按功率、分区和公用条件设计。'],
      ['炉顶与检修结构', '炉顶隔热、承力构件、检修开口和维护空间按温度与结构边界确认。'],
      ['炉门与密封', '开启方式、压紧、密封、隔热和安全联锁同步确认。'],
      ['承载与料具', '炉底板、支承、料框和托盘按高温载荷设计。'],
      ['电控与安全', '控温、记录、报警、急停、门控和数据接口按项目约定。'],
    ],
    faqs: [
      {
        question: '哪些工件适合先评估箱式炉？',
        answer:
          '可从炉门安全装卸、适合按批次生产的中小型机械件、模具、试制件和多品种小批量工件，可先进入箱式炉方案评估。仍需核对装料包络、单件质量、净装载、料具和工艺曲线。',
      },
      {
        question: '箱式炉与台车炉怎么区分？',
        answer:
          '箱式炉通常面向炉门装卸的中小型工件；台车炉由承载台车整体进出炉膛，更适合大型或重型工件。判断时应比较装卸方式、载荷、轨道基础和炉膛利用率。',
      },
      {
        question: '有效加热区为什么不能直接写成炉膛尺寸？',
        answer:
          '有效加热区是按约定条件进行温度均匀性评定和使用的工作空间；炉膛结构尺寸还要包含炉衬、加热或燃烧布置、导流和安全间隙，两者不能互相替代。',
      },
      {
        question: '保护气氛箱式炉只要通气就可以吗？',
        answer:
          '不可以。还需确认气氛成分、置换过程、炉门密封、排放路径、监测、报警和安全联锁，并把表面质量验收条件写入技术文件。',
      },
      {
        question: '报价前最少需要哪些资料？',
        answer:
          '至少需要材料牌号、最大尺寸、单件质量、每炉数量、净装载、料具、长期工作温度、最高温度、工艺曲线、炉门装卸方式、气氛与冷却要求及厂房公用条件。',
      },
    ],
    related: [
      {
        title: '台车炉',
        image: detailImage('trolley-furnace', 'main'),
        alt: '大型工件用台车式热处理炉',
        text: '大型重件由台车整体进出炉膛。',
        href: '/zh/products/detail/trolley-furnace',
      },
      {
        title: '井式炉',
        image: '/images/products/pit-furnace/pit-furnace-hero.png',
        alt: '长轴工件立式装炉的井式炉',
        text: '长轴与杆件优先比较竖直装炉。',
        href: '/zh/products/detail/pit-furnace',
      },
      {
        title: '网带炉',
        image: detailImage('mesh-belt-furnace', 'main'),
        alt: '小型工件连续输送用网带炉',
        text: '批量稳定小件可比较连续输送。',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
    ],
  },

  'trolley-furnace': {
    slug: 'trolley-furnace',
    name: '台车炉',
    englishName: 'BOGIE HEARTH HEAT TREATMENT FURNACE',
    title: '台车炉｜大型重型工件周期式热处理',
    description:
      '面向大型铸锻件、焊接结构件、模具和重型机械件，先按工件外形、支承位置、装炉总质量、台车行程与基础条件判断方案，再确定有效加热区、台车结构和热源。',
    gallery: [
      {
        src: detailImage('trolley-furnace', 'main'),
        alt: '台车式电阻炉、升降炉门与承载台车配置示意',
        caption: '台车炉全景示意',
      },
      {
        src: detailImage('trolley-furnace', 'loading'),
        alt: '环形工件放置在台车耐火垫块上的装载状态示意',
        caption: '台车装载状态示意',
      },
      {
        src: detailImage('trolley-furnace', 'lining'),
        alt: '台车炉炉衬、侧墙加热元件与承载台面示意',
        caption: '炉衬与元件示意',
      },
      {
        src: detailImage('trolley-furnace', 'control'),
        alt: '台车炉控制柜与记录界面示意，屏幕不代表实际温度记录',
        caption: '控制柜与界面示意',
      },
    ],
    tags: ['大型重件', '台车整体进出', '周期式生产', '轨道基础需校核'],
    heroInfo: [
      ['标准额定温度等级', '350 / 750 / 950 / 1,200 / 1,350 ℃'],
      ['现有项目工作区样本', '4,000 × 2,500 × 2,500 mm'],
      ['现有大型炉膛样本', '约 13,000 × 7,400 × 4,300 mm'],
      ['现有项目温度样本', '700 / 950 ℃'],
    ],
    productProperties: [
      { name: '标准额定温度等级', value: '350 / 750 / 950 / 1,200 / 1,350 ℃' },
      { name: '现有项目工作区样本', value: '4,000 × 2,500 × 2,500 mm' },
      { name: '现有大型炉膛样本', value: '约 13,000 × 7,400 × 4,300 mm' },
      { name: '现有项目温度样本', value: '700 / 950 ℃' },
    ],
    heroNotice:
      '额定温度等级来自 GB/T 10067.48-2014；尺寸与项目温度来自苏能现有项目资料，只作选型参考样本，不构成连续规格范围或设备能力承诺。',
    workpieces: [
      {
        status: '通常适合评估',
        tone: 'positive',
        title: '大型铸锻件、模具与结构件',
        text: '适合由台车整体承载、集中装炉和集中出炉的周期式热处理。',
      },
      {
        status: '按支承方式评估',
        tone: 'positive',
        title: '重型或形状不规则工件',
        text: '需明确重心、支点、垫块、台面载荷分布和高温变形边界。',
      },
      {
        status: '需要比较炉型',
        tone: 'caution',
        title: '长轴竖装或连续稳定批量',
        text: '应同时比较井式炉、辊底炉、推杆炉等方案。',
      },
    ],
    suitableConditions: [
      '工件能够在台车上稳定支承，装卸与吊装路径明确。',
      '厂房具备台车行程、轨道、基础、炉门开启和安全空间。',
      '批次生产与整炉进出方式符合节拍要求。',
    ],
    requiredConditions: [
      '最大工件外形、单件质量、净装载、料具和载荷分布。',
      '长期工作温度、最高温度、工艺曲线和冷却路径。',
      '轨道标高、基础承载、台车行程、吊装能力和公用条件。',
    ],
    workpieceWarning:
      '台车承载能力不只取决于总重量，还与支点位置、载荷分布、台面高温强度、轨道和驱动条件有关。',
    optionGroups: [
      { title: '热源方式', options: ['电阻加热', '天然气加热', '其他燃料需单独评估'] },
      { title: '循环方式', options: ['自然对流', '强制循环', '导流按装炉状态校核'] },
      { title: '台车方式', options: ['自驱台车', '牵引台车', '双台车 / 交换台车'] },
      { title: '炉门方式', options: ['垂直升降', '侧向开启', '压紧密封按项目确认'] },
      { title: '冷却路径', options: ['炉冷', '台车出炉空冷', '转移至冷却工位'] },
    ],
    solutions: [
      {
        title: '台车式电阻炉',
        image: detailImage('trolley-furnace', 'main'),
        alt: '台车式电阻炉与承载台车配置示意',
        eyebrow: '分区电阻加热',
        text: '适合供电条件明确、需要分区控温和记录的周期式任务。',
        suitable: '大型重件退火、回火、正火或去应力方向评估',
        advantage: '便于围绕有效区与装载布置加热分区',
        verify: '供电容量、分区、料具、密封和台车承载',
        noPromise: '不脱离装炉状态承诺温差和升温时间',
      },
      {
        title: '台车式燃气炉',
        image: detailImage('trolley-furnace', 'gas'),
        alt: '台车式燃气炉、燃烧管路与排烟系统配置示意',
        eyebrow: '燃烧与排烟系统',
        text: '需把供气、燃烧、排烟、换热和安全联锁整体确认。',
        suitable: '厂房燃气和排烟条件明确的大型工件任务',
        advantage: '可结合能源与炉体规模进行热源比较',
        verify: '燃气参数、燃烧器、排烟、炉压与联锁',
        noPromise: '不以燃烧器参数代替整炉性能验收',
      },
      {
        title: '强制循环台车炉',
        image: '/images/products/trolley-furnace/detail/10-circulation-workshop-20260915.webp',
        alt: '强制循环台车炉厂房场景示意，展示顶部驱动装置、炉顶回风口与轨道台车',
        eyebrow: '循环与导流',
        text: '循环风机、导流和装炉间隙需按工艺温度与阻力校核。',
        suitable: '需要加强对流换热的中低温大型装载',
        advantage: '可围绕工件间隙优化炉内气流组织',
        verify: '风机耐温、导流、装载阻力与维护空间',
        noPromise: '不把有风机等同于温度均匀性结果',
      },
      {
        title: '台车炉更新与改造评估',
        image: detailImage('trolley-furnace', 'processLine'),
        alt: '冷态台车炉、退出台车与轨道的改造前现场评估示意',
        eyebrow: '新炉 / 大修 / 改造',
        text: '需先核对旧炉壳体、轨道、基础、控制与停产窗口。',
        suitable: '旧炉性能下降、能源或控制系统需要升级的现场',
        advantage: '可比较保留、改造与整炉替换的边界',
        verify: '旧炉检测、基础、接口、停产与验收范围',
        noPromise: '不在现场检测前直接承诺改造效果',
      },
    ],
    equations: [
      ['有效加热区', '≠', '炉膛结构尺寸'],
      ['热负荷核算质量', '≠', '台车驱动与轨道设计载荷'],
    ],
    boundaryImage: {
      src: detailImage('trolley-furnace', 'lining'),
      alt: '台车炉炉膛、耐火炉衬与加热元件制造检查场景',
      caption: '有效区、台面支承、轨道和炉门净空应分别定义、分别校核。',
    },
    boundaryFacts: [
      ['有效加热区', '按约定测温方法确认，不等于炉膛内壁尺寸。'],
      ['工件净装载', '与随炉料具共同用于热负荷核算。'],
      ['台车设计载荷', '还需结合台面结构、载荷分布和高温强度。'],
      ['驱动牵引条件', '受坡度、轨道、密封摩擦和启停方式影响。'],
      ['轨道与基础', '按标高、直线度、承载、热胀和维护边界校核。'],
      ['能力承诺', '不公开未经技术审核的最大尺寸、最大装载和温差。'],
    ],
    requiredData: [
      ['工件', '名称、材料、最大外形、单件质量、重心与支点'],
      ['工艺', '长期工作温度、最高温度、曲线、保温与冷却'],
      ['装炉', '每炉数量、净装载、料具、垫块与载荷分布'],
      ['生产', '批次节拍、装卸时间、台车交换和维护窗口'],
      ['厂房', '轨道、基础、行程、炉门净空、吊装与物流路径'],
      ['公用条件', '供电或燃气、排烟、冷却水、压缩空气和接口'],
    ],
    standards: [
      {
        group: '台车式电阻炉技术与试验',
        items: [
          'GB/T 10067.48-2014（仅适用于台车式电阻炉）',
          ...commonStandards.resistance,
          ...commonStandards.resistanceSafety,
        ],
      },
      {
        group: '有效加热区、电气与通用安全',
        items: [...commonStandards.effectiveZone, ...commonStandards.generalSafety],
      },
      { group: '燃气方案条件引用', items: [...commonStandards.burnerReference] },
    ],
    structureImage: {
      src: detailImage('trolley-furnace', 'cutaway'),
      alt: '台车炉炉体、升降炉门、炉衬、加热元件、承载台车、运行轨道与控制柜结构剖切示意',
      caption: '台车炉结构示例 · 具体配置随装载、热源、厂房和生产组织变化',
    },
    structureCallouts: [
      cutawayCallout('leftMiddle', 'shell', '炉体与炉衬', 79, 25),
      cutawayCallout('rightMiddle', 'heating', '加热元件', 42, 37.2),
      cutawayCallout('leftTop', 'door', '升降炉门', 44, 20),
      cutawayCallout('leftBottom', 'trolley', '承载台车', 32, 56),
      cutawayCallout('rightBottom', 'track', '运行轨道', 33, 72),
      cutawayCallout('rightTop', 'control', '控制柜', 95, 45),
    ],
    structureParameters: [
      ['最大工件与装料包络 Wload × Hload × Lload（mm）', '包含工件、垫块、间距和随炉料具。'],
      ['单件 / 净装载 / 料具 / 台车设计载荷（kg）', '热负荷、结构载荷与驱动载荷分开核算。'],
      ['支点位置 / 面载荷 / 集中载荷', '用于台面、耐热垫块、轮组和轨道校核。'],
      ['台车行程 / 轨道标高 / 炉门开启净空（mm）', '确认车间物流、基础与检修空间。'],
      ['长期温度 / 热源 / 冷却 / 控制与记录', '形成炉衬、加热、排烟和联锁方案。'],
    ],
    structureSystems: [
      ['炉体与炉衬', '按有效区、热源、运行温度和检修方式确定。'],
      ['加热与控温', '电阻或燃气系统按热负荷、分区和公用条件设计。'],
      ['炉门与密封', '升降、压紧、隔热、密封和安全联锁同步确认。'],
      ['台车与料具', '台面、支承、轮组、轴承和料具按高温载荷设计。'],
      ['轨道与驱动', '轨距、基础、热胀、牵引、限位与应急回车统筹设计。'],
      ['电控与安全', '控温、记录、报警、炉门台车联锁和急停按项目约定。'],
    ],
    faqs: [
      {
        question: '哪些大型工件适合先评估台车炉？',
        answer:
          '大型铸锻件、焊接结构件、模具和重型机械件，如适合由承载台车整体进出炉膛，可先进入台车炉方案评估。仍需核对最大外形、单件质量、支承位置、净装载和厂房条件。',
      },
      {
        question: '台车承重为什么不能只给一个总重量？',
        answer:
          '同样的总重量会因支点、载荷分布、工件重心和高温状态产生不同结构响应。台面、轮组、轨道和驱动系统需要分别校核。',
      },
      {
        question: '电阻加热和燃气加热怎么选？',
        answer:
          '应综合供电或供气条件、炉体规模、工艺温度、控制与排烟要求、运行组织和维护能力比较，不能只按能源单价决定。',
      },
      {
        question: '旧台车炉适合改造还是换新？',
        answer:
          '需先检查炉壳、炉衬、台车、轨道、炉门、加热或燃烧系统、电控和基础状态，再比较保留改造与整炉替换的风险、停产时间和验收边界。',
      },
      {
        question: '报价前最少需要哪些资料？',
        answer:
          '至少需要工件最大外形、单件质量、每炉数量、净装载、料具、支点与载荷分布、工艺曲线、炉门与台车方向、轨道基础、吊装和能源条件。',
      },
    ],
    related: [
      {
        title: '箱式炉',
        image: detailImage('box-furnace', 'main'),
        alt: '中小型工件用箱式炉',
        text: '中小型工件可比较炉门装卸方案。',
        href: '/zh/products/detail/box-furnace',
      },
      {
        title: '井式炉',
        image: '/images/products/pit-furnace/pit-furnace-hero.png',
        alt: '长轴工件立式装炉的井式炉',
        text: '长轴与杆件可比较竖直装炉。',
        href: '/zh/products/detail/pit-furnace',
      },
      {
        title: '辊底炉',
        image: detailImage('roller-hearth-furnace', 'main'),
        alt: '规整工件连续输送用辊底炉',
        text: '稳定批量可比较连续辊道输送。',
        href: '/zh/products/detail/roller-hearth-furnace',
      },
    ],
  },

  'bell-furnace': {
    slug: 'bell-furnace',
    name: '罩式炉',
    englishName: 'BELL TYPE HEAT TREATMENT FURNACE',
    title: '罩式炉｜固定炉台上的批次热处理',
    description:
      '面向盘卷、线材、卷材及料框装载工件，先根据装料堆垛、炉台承载、炉罩升降、循环路径和气氛边界判断方案，再确定有效区、炉罩结构与冷却组织。',
    gallery: [
      {
        src: '/images/products/bell-furnace/detail/01-main-scene-v3.webp',
        unoptimized: true,
        alt: '深筒加热罩吊起于金属内罩和固定炉台上方的罩式炉配置示意',
        caption: '罩式炉配置示意',
      },
      {
        src: detailImage('bell-furnace', 'loading'),
        alt: '罩式炉炉罩吊装与固定炉台装料场景',
        caption: '吊装与装料',
      },
      {
        src: '/images/products/bell-furnace/detail/03-lining-heating-v2.webp',
        unoptimized: true,
        alt: '加热罩卧放在维护支架上，展示深筒炉衬与轴向布置的加热元件',
        caption: '炉衬与元件（维护支承）',
      },
      {
        src: detailImage('bell-furnace', 'control'),
        alt: '罩式炉电控柜与温度记录操作场景',
        caption: '电控与记录',
      },
    ],
    tags: ['盘卷 / 线材', '固定炉台', '炉罩整体升降', '气氛方案需系统校核'],
    heroInfo: [
      ['工作区直径', 'Φ300 mm 起（标准系列）'],
      ['工作区高度', '300 mm 起（标准系列）'],
      ['尺寸分档', '≤600 每 100 mm；>600 每 200 mm'],
      ['最高工作温度', '750 / 850 / 950 / 1,200 ℃'],
    ],
    productProperties: [
      { name: '工作区直径', value: 'Φ300 mm 起（标准系列）' },
      { name: '工作区高度', value: '300 mm 起（标准系列）' },
      { name: '尺寸分档', value: '≤600 每 100 mm；>600 每 200 mm' },
      { name: '最高工作温度', value: '750 / 850 / 950 / 1,200 ℃' },
    ],
    heroNotice:
      '上述起始规格、递增规则与温度分级来自 GB/T 10067.46-2014，只作选型参考；装料包络、炉台承载和炉罩净空仍需单独校核。',
    workpieces: [
      {
        status: '通常适合评估',
        tone: 'positive',
        title: '盘卷、线材与堆垛装载',
        text: '工件留在固定炉台，炉罩整体升降完成装卸和加热组织。',
      },
      {
        status: '按料具评估',
        tone: 'positive',
        title: '料框装载或环形件',
        text: '需核对堆垛高度、料框强度、循环通道和炉台承载。',
      },
      {
        status: '需要比较炉型',
        tone: 'caution',
        title: '大型异形件、长轴或连续节拍小件',
        text: '应比较台车炉、井式炉或连续式炉型。',
      },
    ],
    suitableConditions: [
      '工件能够在固定炉台上稳定堆垛或通过料具定位。',
      '炉罩升降与吊装净空满足厂房和操作安全要求。',
      '气氛、循环和冷却路径可以形成明确系统边界。',
    ],
    requiredConditions: [
      '工件外径、高度、单件质量、堆垛方式、每炉数量和总装载。',
      '材料、表面质量、长期温度、曲线、气氛和冷却要求。',
      '炉台尺寸、承载、炉罩开启净空、行车和厂房条件。',
    ],
    workpieceWarning:
      '保护气氛、内罩和强制循环都属于按工艺选配项，不能把某一配置当成全部罩式炉的默认结构。',
    optionGroups: [
      { title: '热源方式', options: ['电阻加热', '天然气加热', '其他燃料需单独评估'] },
      { title: '罩体配置', options: ['加热罩', '内罩按气氛选配', '冷却罩按节拍选配'] },
      { title: '循环方式', options: ['自然对流', '强制循环', '导流按装料堆垛校核'] },
      { title: '炉内气氛', options: ['空气气氛', '氮气 / 惰性气氛', '含氢气氛需专项安全评估'] },
      { title: '冷却路径', options: ['炉罩内冷却', '更换冷却罩', '保护气氛循环冷却'] },
    ],
    solutions: [
      {
        title: '空气气氛罩式炉',
        image: '/images/products/bell-furnace/detail/08-air-atmosphere-20260915.webp',
        alt: '空气气氛罩式炉配置示意，固定炉台上的环件直接由加热罩覆盖',
        eyebrow: '常规批次热处理',
        text: '适合不需要专用保护气氛的堆垛或料框装载任务。',
        suitable: '盘卷、环件或料框装载的常规热处理',
        advantage: '炉台固定，装载与炉罩结构边界清晰',
        verify: '装料堆垛、循环路径、炉台承载与净空',
        noPromise: '不脱离装载状态承诺温差和周期',
      },
      {
        title: '保护气氛罩式炉',
        image: '/images/products/bell-furnace/detail/01-main-scene-v3.webp',
        alt: '保护气氛罩式炉配置示意，金属内罩位于固定炉台与提升的加热罩之间',
        eyebrow: '内罩、密封与置换',
        text: '需按气氛成分、表面质量和安全要求配置完整系统。',
        suitable: '对氧化、脱碳或表面状态有控制要求的材料',
        advantage: '可围绕内罩和气氛循环形成专项方案',
        verify: '气氛成分、露点、密封、置换、排放与联锁',
        noPromise: '不把通气等同于表面质量结果',
      },
      {
        title: '强制循环罩式炉',
        image: '/images/products/bell-furnace/detail/11-circulation-workshop-20260915.webp',
        alt: '罩式炉循环装置检修场景示意，展示炉台风机、下置电机及旁置内罩与加热罩',
        eyebrow: '循环与导流',
        text: '风机、导流和堆垛通道需按工况与温度等级校核。',
        suitable: '需要加强堆垛间对流换热的工况',
        advantage: '可围绕堆垛通道组织炉内循环',
        verify: '风机耐温、装料阻力、导流与检修空间',
        noPromise: '不把循环风量直接换算为均匀性结果',
      },
      {
        title: '多炉台生产组织',
        image: detailImage('bell-furnace', 'processLine'),
        alt: '罩式炉多炉台退火生产组织场景',
        eyebrow: '加热罩与炉台匹配',
        text: '多炉台、加热罩和冷却罩数量按生产节拍与物流核算。',
        suitable: '批次稳定且需要提高罩体利用率的生产组织',
        advantage: '可分解加热、保温和冷却占用时间',
        verify: '节拍、罩体数量、物流、吊装和备用策略',
        noPromise: '不在节拍资料不全时承诺产量',
      },
    ],
    equations: [
      ['有效加热区', '≠', '炉罩结构内径与高度'],
      ['工件净装载＋料具', '≠', '炉台与吊装系统校核载荷'],
    ],
    boundaryImage: {
      src: '/images/products/bell-furnace/detail/03-lining-heating-v2.webp',
      unoptimized: true,
      alt: '罩式炉炉罩耐火炉衬与加热元件制造检查场景',
      caption: '装料包络、有效区、炉台承载和炉罩开启净空应分别定义。',
    },
    boundaryFacts: [
      ['有效加热区', '按约定测温方法确认，不等于炉罩结构尺寸。'],
      ['装料包络', '包含工件、堆垛间距、料框或支承结构。'],
      ['炉台承载', '按工件、料具、载荷分布和高温状态校核。'],
      ['吊装载荷', '炉罩、内罩、吊具和参与起吊部件按实际路径校核。'],
      ['气氛边界', '内罩密封、置换、循环、排放、监测和联锁成套确认。'],
      ['能力承诺', '不公开未经技术审核的最大尺寸、最大装载和周期。'],
    ],
    requiredData: [
      ['工件', '材料、外径 / 宽度、高度、单件质量和堆垛方式'],
      ['装炉', '每炉数量、净装载、料具、层数、间距和支承'],
      ['工艺', '长期温度、最高温度、曲线、保温与冷却'],
      ['气氛', '成分、露点或表面目标、置换、循环和排放'],
      ['生产', '批次节拍、炉台 / 炉罩数量、吊装与物流组织'],
      ['厂房', '炉罩开启净空、行车能力、基础和公用条件'],
    ],
    standards: [
      {
        group: '罩式电阻炉技术与试验',
        items: [
          'GB/T 10067.46-2014（仅适用于罩式电阻炉）',
          ...commonStandards.resistance,
          ...commonStandards.resistanceSafety,
        ],
      },
      {
        group: '有效加热区、电气与通用安全',
        items: [...commonStandards.effectiveZone, ...commonStandards.generalSafety],
      },
      {
        group: '燃气与全氢方案条件引用',
        items: [
          'GB/T 30840-2014（仅适用于燃气罩式退火炉）',
          ...commonStandards.burnerReference,
          'YB/T 4250-2025（仅适用于冶金用全氢罩式退火炉）',
        ],
      },
    ],
    structureImage: {
      src: detailImage('bell-furnace', 'cutaway'),
      alt: '罩式炉加热罩、炉衬、固定炉台、循环系统和工件结构剖切示例',
      caption: '罩式炉通用部件关系示例 · 与外观图为不同代表配置，具体结构按项目确定',
    },
    structureCallouts: [
      cutawayCallout('leftBottom', 'base', '炉台与支承', 27, 67),
      cutawayCallout('leftMiddle', 'hood', '加热罩与炉衬', 29, 30),
      cutawayCallout('leftTop', 'inner-cover', '内罩', 43, 19),
      cutawayCallout('rightBottom', 'circulation', '循环装置', 51.5, 64),
      cutawayCallout('rightTop', 'lifting', '吊耳', 73.5, 12),
    ],
    structureParameters: [
      ['最大装料包络 ΦDload × Hload（mm）', '包含工件、堆垛间距和随炉料具。'],
      ['单件 / 净装载 / 料具 / 炉台校核载荷（kg）', '热负荷与结构载荷分开核算。'],
      ['炉罩 / 内罩 / 炉台有效结构边界（mm）', '按气氛、循环、维护和密封要求确定。'],
      ['炉罩开启方式 / 吊装载荷 / 顶部净空（mm）', '用于行车、吊具和厂房高度校核。'],
      ['气氛 / 置换 / 冷却 / 记录与联锁', '保护气氛项目需形成完整安全边界。'],
    ],
    structureSystems: [
      ['炉台与支承', '按装料、载荷分布、密封和热循环确定。'],
      ['加热罩与炉衬', '按有效区、热源、温度等级和升降方式设计。'],
      ['内罩与密封', '按气氛目标、置换、承压边界和检修方式选配。'],
      ['循环与导流', '风机、导流和装料通道按温度与堆垛阻力校核。'],
      ['吊装与冷却', '罩体起吊、换罩、冷却路径和操作区域统筹确认。'],
      ['电控与安全', '控温、记录、气氛监测、报警和联锁按项目约定。'],
    ],
    faqs: [
      {
        question: '哪些工件适合先评估罩式炉？',
        answer:
          '盘卷、线材、卷材、环形件或通过料框堆垛在固定炉台上的工件，可先进入罩式炉评估。仍需核对装料外形、堆垛方式、炉台承载、气氛和吊装条件。',
      },
      {
        question: '罩式炉是不是都要保护气氛？',
        answer:
          '不是。空气气氛、保护气氛、内罩、冷却罩和强制循环均应按材料、表面质量、工艺与安全要求选配，不能作为默认配置。',
      },
      {
        question: '为什么装料高度不能直接等于有效区高度？',
        answer:
          '有效区需要按测温与使用条件确认，并预留循环、导流和安全间隙。装料包络和有效区是不同变量，不能直接等同。',
      },
      {
        question: '多炉台一定能提高产量吗？',
        answer:
          '多炉台可用于组织加热、保温和冷却，但实际产量还受工艺周期、装卸、罩体数量、冷却、吊装和物流约束，应完成节拍平衡后判断。',
      },
      {
        question: '报价前最少需要哪些资料？',
        answer:
          '至少需要材料、装料外形、堆垛方式、每炉数量、净装载、料具、长期与最高温度、工艺曲线、气氛和冷却目标、炉罩开启净空及行车条件。',
      },
    ],
    related: [
      {
        title: '箱式炉',
        image: detailImage('box-furnace', 'main'),
        alt: '中小型工件用箱式炉',
        text: '炉门装卸任务可比较箱式结构。',
        href: '/zh/products/detail/box-furnace',
      },
      {
        title: '井式炉',
        image: '/images/products/pit-furnace/pit-furnace-hero.png',
        alt: '长轴工件立式装炉的井式炉',
        text: '长轴与杆件可比较竖直装炉。',
        href: '/zh/products/detail/pit-furnace',
      },
      {
        title: '台车炉',
        image: detailImage('trolley-furnace', 'main'),
        alt: '大型重件用台车炉',
        text: '大型重件可比较台车整体进出。',
        href: '/zh/products/detail/trolley-furnace',
      },
    ],
  },

  'mesh-belt-furnace': {
    slug: 'mesh-belt-furnace',
    name: '网带炉',
    englishName: 'MESH BELT RESISTANCE HEATING UNIT',
    title: '网带炉｜小型工件连续热处理',
    description:
      '面向可在网带上平铺或受控堆料的小型零件，先按工件形态、铺料状态、网带材料、工艺时间和上下游节拍判断方案，再确定有效输送宽度、加热段长度与冷却路径。',
    gallery: [
      {
        src: detailImage('mesh-belt-furnace', 'main'),
        alt: '网带式连续热处理炉与进料网带主场景',
        caption: '网带炉全景',
      },
      {
        src: detailImage('mesh-belt-furnace', 'loading'),
        alt: '网带炉工件铺料与进料网带场景',
        caption: '铺料与进料',
      },
      {
        src: detailImage('mesh-belt-furnace', 'lining'),
        alt: '网带炉炉衬、加热元件与网带制造检查场景',
        caption: '炉衬与元件',
      },
      {
        src: detailImage('mesh-belt-furnace', 'control'),
        alt: '网带炉电控柜与温度记录操作场景',
        caption: '电控与记录',
      },
    ],
    tags: ['小型零件', '网带连续输送', '多温区控制', '产能需实物铺料校核'],
    heroInfo: [
      ['现有项目有效宽度', '180–400 mm'],
      ['现有项目有效高度', '50–100 mm'],
      ['现有项目加热段长度', '2,100–5,600 mm'],
      ['标准额定温度范围', '150–1,200 ℃'],
    ],
    productProperties: [
      { name: '现有项目有效宽度', value: '180–400 mm' },
      { name: '现有项目有效高度', value: '50–100 mm' },
      { name: '现有项目加热段长度', value: '2,100–5,600 mm' },
      { name: '标准额定温度范围', value: '150–1,200 ℃' },
    ],
    heroNotice:
      '150–1,200 ℃是 GB/T 10067.41-2013 的标准适用范围，不是苏能所有网带炉的连续工作温度承诺。具体温度需结合网带材质、气氛、载荷及使用寿命核定；尺寸来自现有项目资料，产能按铺料和工艺时间校核。',
    workpieces: [
      {
        status: '通常适合评估',
        tone: 'positive',
        title: '紧固件、五金件与小型机械件',
        text: '适合平铺或受控堆料，并能随网带连续通过各温区的批量工件。',
      },
      {
        status: '按铺料评估',
        tone: 'positive',
        title: '可散装但不易互相卡滞的零件',
        text: '需通过铺料试验确认翻滚、叠压、遮挡和单位面积载荷。',
      },
      {
        status: '需要比较炉型',
        tone: 'caution',
        title: '重件、长件、易滚落或需专用料盘工件',
        text: '应比较推杆炉、辊底炉、箱式炉或台车炉。',
      },
    ],
    suitableConditions: [
      '工件能够稳定铺在网带上，不会卡网、滚落或严重叠压。',
      '生产批量稳定，连续进出料与上下游设备可以匹配。',
      '工艺温度、气氛与网带材质的长期使用边界明确。',
    ],
    requiredConditions: [
      '工件尺寸、材料、单件质量、铺料层数和单位时间投料量。',
      '长期温度、最高温度、工艺时间、气氛与冷却方式。',
      '上下料、清洗、淬火、回火、冷却和出料接口。',
    ],
    workpieceWarning:
      '产能不能只由网带宽度和速度推算，必须同时考虑铺料密度、有效加热时间、热负荷、上下游瓶颈和合格率目标。',
    optionGroups: [
      { title: '工艺组织', options: ['单段加热', '加热＋保温', '淬火＋清洗＋回火联线'] },
      { title: '网带方式', options: ['常规金属网带', '耐热网带按温度选材', '托辊支承按载荷选配'] },
      { title: '炉内气氛', options: ['空气气氛', '保护气氛', '可控气氛需密封与联锁'] },
      { title: '铺料方式', options: ['单层平铺', '受控堆料', '自动布料需工件试验'] },
      { title: '冷却路径', options: ['出炉空冷', '受控风冷', '转入淬火 / 冷却段'] },
    ],
    solutions: [
      {
        title: '连续退火 / 回火网带炉',
        image: detailImage('mesh-belt-furnace', 'main'),
        alt: '连续退火回火用网带式热处理炉主场景',
        eyebrow: '连续加热与保温',
        text: '围绕铺料、工艺时间和各温区热负荷配置。',
        suitable: '批量稳定的小件退火、回火与去应力方向',
        advantage: '连续进出料，易与上下游设备组织联线',
        verify: '铺料、有效宽度、速度、温区与网带材料',
        noPromise: '不脱离实物铺料承诺产量和均匀性',
      },
      {
        title: '网带式淬火回火机组',
        image: detailImage('mesh-belt-furnace', 'processLine'),
        alt: '多段网带式连续热处理完整机组',
        eyebrow: '加热＋转移＋冷却',
        text: '加热、淬火、清洗、回火和冷却需按整线节拍联动。',
        suitable: '工艺路线稳定、需要连续淬火回火的小型零件',
        advantage: '可把多工序按统一节拍进行系统设计',
        verify: '转移、介质、清洗、回火、冷却与联锁',
        noPromise: '不在工艺试验不足时承诺组织和变形结果',
      },
      {
        title: '保护气氛网带炉',
        image: detailImage('mesh-belt-furnace', 'lining'),
        alt: '网带炉炉衬、加热元件与连续网带结构',
        eyebrow: '密封、置换与连续传动',
        text: '炉口、网带回程、置换和排放共同决定气氛边界。',
        suitable: '对氧化、脱碳或表面状态有控制要求的连续工况',
        advantage: '可围绕连续输送建立气氛分区与接口',
        verify: '气氛成分、炉口密封、置换、排放与联锁',
        noPromise: '不把气体流量直接等同于表面质量',
      },
      {
        title: '紧凑型网带炉',
        image: detailImage('mesh-belt-furnace', 'loading'),
        alt: '网带炉进料网带与工件铺料场景',
        eyebrow: '单机连续处理',
        text: '适合先从单一工序与明确节拍建立连续处理能力。',
        suitable: '产线接口简单、工艺段较少的小型零件任务',
        advantage: '设备边界较集中，便于与现有上下料衔接',
        verify: '投料、收料、速度、有效时间和维护空间',
        noPromise: '不在上下游未确认时承诺整线效率',
      },
    ],
    equations: [
      ['有效输送宽度 Wb', '≠', '网带总宽度'],
      ['理论通过量', '≠', '稳定合格产能'],
    ],
    boundaryImage: {
      src: detailImage('mesh-belt-furnace', 'lining'),
      alt: '网带炉炉衬、加热元件、网带和炉口结构',
      caption: '有效宽度、铺料状态、网带支承与炉口结构共同形成连续输送边界。',
    },
    boundaryFacts: [
      ['有效输送宽度', '按炉口、导向和实际铺料区域定义，不等于网带总宽。'],
      ['单位面积载荷', '由工件质量、铺料密度、网带和支承结构共同校核。'],
      ['有效加热时间', '由有效加热长度与实际网带速度共同确定。'],
      ['网带材料', '按长期温度、气氛、载荷和循环寿命选材。'],
      ['整线节拍', '投料、加热、冷却、清洗与收料按最慢环节平衡。'],
      ['能力承诺', '不公开未经工艺与实物铺料验证的产量和质量结果。'],
    ],
    requiredData: [
      ['工件', '材料、尺寸、单件质量、形状与表面状态'],
      ['铺料', '单层 / 多层、单位面积质量、投料量与是否易卡滞'],
      ['工艺', '长期温度、最高温度、有效时间、气氛与曲线'],
      ['冷却', '空冷、风冷、液体介质、转移与清洗要求'],
      ['生产', '目标节拍、班次、换产、上下游接口与合格率目标'],
      ['公用条件', '供电或燃气、气氛介质、排烟、冷却和安装空间'],
    ],
    standards: [
      {
        group: '网带式电阻加热机组技术与试验',
        items: [
          'GB/T 10067.41-2013',
          ...commonStandards.resistance,
          ...commonStandards.resistanceSafety,
        ],
      },
      {
        group: '有效加热区与工业炉通用安全',
        items: [...commonStandards.effectiveZone, 'GB/T 37752.1-2019'],
      },
      {
        group: '机械电气安全',
        items: ['GB/T 5226.1-2019'],
      },
    ],
    structureImage: {
      src: detailImage('mesh-belt-furnace', 'cutaway'),
      alt: '网带炉炉体、炉衬、温区、网带传动与支承结构剖切示例',
      caption: '网带炉结构示例 · 具体配置随工件铺料、温度、气氛和整线节拍变化',
    },
    structureCallouts: [
      cutawayCallout('leftMiddle', 'shell', '炉体与炉衬', 42, 24),
      cutawayCallout('rightTop', 'heating', '加热与控温', 52, 31),
      cutawayCallout('leftBottom', 'belt', '网带与支承', 50, 47),
      cutawayCallout('rightBottom', 'drive', '传动电机与张紧', 96, 52),
      cutawayCallout('leftTop', 'atmosphere', '气氛与冷却', 63, 12),
      cutawayCallout('rightMiddle', 'outlet', '出料端链轮与导向', 89, 39),
    ],
    structureParameters: [
      ['工件尺寸 / 单件质量 / 铺料状态', '确认单层、堆料、翻滚、卡滞和遮挡风险。'],
      ['有效输送宽度 Wb / 铺料高度 Hload（mm）', '与网带总宽和炉口结构尺寸分开定义。'],
      ['单位面积载荷 / 单位时间投料量', '用于网带、支承、热负荷和产能核算。'],
      ['网带速度 / 有效加热长度 Le / 有效时间', '三者必须在工艺和温区布置中对应。'],
      ['网带材料 / 气氛 / 冷却 / 上下游接口', '形成连续运行与维护边界。'],
    ],
    structureSystems: [
      ['炉体与炉衬', '按温区、热损失、气氛和维护分段设计。'],
      ['加热与控温', '按热负荷、工艺曲线和连续输送分区配置。'],
      ['网带与支承', '网带、链轮、托辊、导向和回程按温度与载荷校核。'],
      ['传动电机与张紧', '电机、减速、张紧和跑偏调整按网带速度与载荷校核。'],
      ['气氛与冷却', '炉口密封、置换、排放、冷却与上下游接口成套确认。'],
      ['出料端链轮与导向', '出料端链轮、导向、回程和上下游衔接按整线节拍确认。'],
    ],
    faqs: [
      {
        question: '哪些小件适合先评估网带炉？',
        answer:
          '能稳定平铺或受控堆料、不易卡网或滚落，并适合连续进出料的紧固件、五金件和小型机械件，可先评估网带炉。',
      },
      {
        question: '网带宽度能直接换算产量吗？',
        answer:
          '不能。产量还受铺料密度、单位面积载荷、有效加热时间、热负荷、冷却与上下游节拍限制，需要用实物铺料和工艺数据核算。',
      },
      {
        question: '网带速度越快产量越高吗？',
        answer:
          '提高速度会缩短有效加热和保温时间，可能影响温度、组织和表面结果。速度必须与有效长度、温区和工艺时间共同确定。',
      },
      {
        question: '保护气氛网带炉最关键的是什么？',
        answer:
          '连续进出料使炉口密封、置换、网带回程、排放和安全联锁更复杂，应把气氛系统与输送系统一起设计和验收。',
      },
      {
        question: '报价前最少需要哪些资料？',
        answer:
          '至少需要工件材料、尺寸、单件质量、铺料状态、单位时间投料量、长期与最高温度、工艺时间、气氛与冷却路线，以及上下游接口。',
      },
    ],
    related: [
      {
        title: '推杆炉',
        image: detailImage('pusher-furnace', 'main'),
        alt: '料盘节拍推进的推杆炉',
        text: '不宜直接上网带的工件可比较料盘输送。',
        href: '/zh/products/detail/pusher-furnace',
      },
      {
        title: '辊底炉',
        image: detailImage('roller-hearth-furnace', 'main'),
        alt: '辊道连续输送的辊底炉',
        text: '板材、条材和规整长件可比较辊道输送。',
        href: '/zh/products/detail/roller-hearth-furnace',
      },
      {
        title: '箱式炉',
        image: detailImage('box-furnace', 'main'),
        alt: '中小型工件周期式处理箱式炉',
        text: '多品种小批量可比较周期式装炉。',
        href: '/zh/products/detail/box-furnace',
      },
    ],
  },

  'pusher-furnace': {
    slug: 'pusher-furnace',
    name: '推杆炉',
    englishName: 'PUSHER TYPE HEAT TREATMENT UNIT',
    title: '推杆炉｜料盘节拍推进的连续热处理',
    description:
      '本页聚焦以料盘、料框或专用工装承载工件的推送式机组，先按装载料盘包络、推送节拍、炉内停留、推力传递和上下游转移判断方案，再确定通道、温区与冷却系统。',
    gallery: [
      {
        src: detailImage('pusher-furnace', 'main'),
        alt: '推杆式热处理炉、料盘入口与多段炉体主场景',
        caption: '推杆炉全景',
      },
      {
        src: detailImage('pusher-furnace', 'loading'),
        alt: '推杆炉料盘与推进机构装料场景',
        caption: '料盘与推料',
      },
      {
        src: detailImage('pusher-furnace', 'lining'),
        alt: '推杆炉炉衬、加热元件与料盘通道制造检查场景',
        caption: '炉衬与元件',
      },
      {
        src: detailImage('pusher-furnace', 'control'),
        alt: '推杆炉电控柜与温度记录操作场景',
        caption: '电控与记录',
      },
    ],
    tags: ['料盘 / 料框承载', '节拍式推进', '多温区处理', '推力链需系统校核'],
    heroInfo: [
      ['标准型号工作区示例', '600 × 3,600 × 400 mm'],
      ['标准额定温度范围', '150–1,350 ℃'],
      ['现有产品型号', 'TGL-3000 × 2000 × 850-12'],
      ['现有推料机构', '5 工位液压推料'],
    ],
    productProperties: [
      { name: '标准型号工作区示例', value: '600 × 3,600 × 400 mm' },
      { name: '标准额定温度范围', value: '150–1,350 ℃' },
      { name: '现有产品型号', value: 'TGL-3000 × 2000 × 850-12' },
      { name: '现有推料机构', value: '5 工位液压推料' },
    ],
    heroNotice:
      '温度范围与工作区示例取自 GB/T 10067.42-2013；产品型号与推料机构来自苏能现有合同资料，只作选型参考，不代表统一尺寸上限。',
    workpieces: [
      {
        status: '通常适合评估',
        tone: 'positive',
        title: '需料盘或工装承载的批量工件',
        text: '适合形状、批量和工艺路线稳定，按节拍逐盘推进的生产任务。',
      },
      {
        status: '按推力链评估',
        tone: 'positive',
        title: '棒料、坯料与规整机械件',
        text: '需核对料盘高温强度、摩擦、推力传递、对中和出料转移。',
      },
      {
        status: '需要比较炉型',
        tone: 'caution',
        title: '可直接上网带的小件或适合辊道的长件',
        text: '应比较网带炉或辊底炉，避免料盘循环过度复杂。',
      },
    ],
    suitableConditions: [
      '工件可由标准化料盘、料框或工装稳定定位。',
      '生产节拍稳定，料盘推进、出料和回盘路径明确。',
      '炉内摩擦、推力链、热胀和卡阻风险可以校核。',
    ],
    requiredConditions: [
      '料盘尺寸、质量、材质、工件布置和在炉盘数。',
      '工艺温度、各段时间、推进节拍与冷却转移。',
      '进出料、回盘、清洗、淬火和安全联锁接口。',
    ],
    workpieceWarning:
      '推杆额定推力不能直接作为可推进装载量；摩擦、热胀、料盘变形、对中和在炉盘数都会影响推力链。',
    optionGroups: [
      { title: '热源方式', options: ['电阻加热', '天然气加热', '其他燃料需单独评估'] },
      { title: '承载方式', options: ['料盘', '料框', '专用工装'] },
      { title: '推进方式', options: ['单列推送', '多列需专项校核', '回盘系统按物流选配'] },
      { title: '炉内气氛', options: ['空气气氛', '保护气氛', '可控气氛需密封与联锁'] },
      { title: '冷却路径', options: ['出炉空冷', '转入淬火槽', '联线清洗与回火'] },
    ],
    solutions: [
      {
        title: '推送式电阻加热机组',
        image: detailImage('pusher-furnace', 'main'),
        alt: '推送式热处理炉与料盘入口主场景',
        eyebrow: '分区电阻加热',
        text: '按料盘、在炉盘数、工艺时间和热负荷分区配置。',
        suitable: '批量稳定、需要料盘定位的连续热处理',
        advantage: '工件姿态和盘间节距相对明确',
        verify: '料盘、推力、温区、节拍与回盘',
        noPromise: '不脱离完整节拍链承诺产量',
      },
      {
        title: '保护气氛推杆炉',
        image: detailImage('pusher-furnace', 'lining'),
        alt: '推杆炉炉衬、加热元件与料盘通道',
        eyebrow: '密封与连续推进',
        text: '炉门、推料口、出料口和气氛分区需系统设计。',
        suitable: '对表面状态和气氛有控制要求的料盘工件',
        advantage: '可结合料盘节距建立分区气氛边界',
        verify: '炉口密封、置换、排放、监测与联锁',
        noPromise: '不以通气量代替表面质量结果',
      },
      {
        title: '推杆炉＋淬火冷却机组',
        image: detailImage('pusher-furnace', 'processLine'),
        alt: '推杆炉、转移设备与冷却工位组成的完整机组',
        eyebrow: '加热＋转移＋冷却',
        text: '出料、转移、淬火、清洗与回火按统一节拍联动。',
        suitable: '工艺路线稳定且需要介质冷却的批量工件',
        advantage: '料盘可维持工件姿态并组织转移',
        verify: '转移时间、介质、料盘、升降与联锁',
        noPromise: '不在工艺试验不足时承诺组织和变形结果',
      },
      {
        title: '生产型推杆炉',
        image: detailImage('pusher-furnace', 'control'),
        alt: '推杆炉电控柜与温度记录操作场景',
        eyebrow: '整线节拍组织',
        text: '围绕在炉盘数、回盘、上下料与维护窗口配置。',
        suitable: '长期稳定批量与标准化料盘生产',
        advantage: '可把工艺段与物流段统一排程',
        verify: '盘数平衡、回盘、备用料盘与故障旁路',
        noPromise: '不在物流边界不全时承诺开动率',
      },
    ],
    equations: [
      ['装载料盘最大包络', '≠', '炉膛通道结构尺寸'],
      ['单次推进时间', '≠', '整线生产节拍'],
    ],
    boundaryImage: {
      src: detailImage('pusher-furnace', 'lining'),
      alt: '推杆炉炉衬、加热元件、料盘与推进通道',
      caption: '料盘、推力链、热胀间隙和出料转移共同决定稳定推进边界。',
    },
    boundaryFacts: [
      ['装载料盘包络', '包含料盘、工件、定位、热胀和必要间隙，不等于通道结构尺寸。'],
      ['推力链', '按在炉盘数、摩擦、坡度、热胀、对中和启停工况核算。'],
      ['有效时间', '由推进节拍、在炉盘数与各工艺段位置共同决定。'],
      ['料盘寿命', '受材料、温度、载荷、热循环和维护方式影响。'],
      ['整线节拍', '上下料、加热、转移、冷却、清洗和回盘统一平衡。'],
      ['能力承诺', '不公开未经热态与负载验证的推力、产量和合格率。'],
    ],
    requiredData: [
      ['工件', '材料、尺寸、单件质量、每盘数量与定位方式'],
      ['料盘', '外形、材质、质量、高温强度、间隙和回盘方式'],
      ['工艺', '长期温度、最高温度、各段时间、气氛与曲线'],
      ['节拍', '推送间隔、在炉盘数、目标产量和上下料时间'],
      ['冷却', '转移时间、介质、升降、清洗与后续回火'],
      ['公用条件', '供电或燃气、排烟、气氛、基础和整线空间'],
    ],
    standards: [
      {
        group: '推送式电阻加热机组技术与试验',
        items: [
          'GB/T 10067.42-2013（仅适用于电阻加热机组）',
          ...commonStandards.resistance,
          ...commonStandards.resistanceSafety,
        ],
      },
      {
        group: '有效加热区、电气与通用安全',
        items: [...commonStandards.effectiveZone, ...commonStandards.generalSafety],
      },
      { group: '燃气方案条件引用', items: [...commonStandards.burnerReference] },
    ],
    structureImage: {
      src: detailImage('pusher-furnace', 'cutaway'),
      alt: '推杆炉炉体、炉衬、推料通道、料盘和驱动结构剖切示例',
      caption: '推杆炉结构示例 · 具体配置随料盘、推力、温区和整线节拍变化',
    },
    structureCallouts: [
      cutawayCallout('leftTop', 'shell', '炉体与温区', 50, 23),
      cutawayCallout('rightTop', 'heating', '加热与控温', 55, 32),
      cutawayCallout('leftMiddle', 'tray', '料盘与通道', 52, 49),
      cutawayCallout('leftBottom', 'pusher', '推杆与驱动', 17, 57),
      cutawayCallout('rightBottom', 'transfer', '转移与回盘', 82, 53),
      cutawayCallout('rightMiddle', 'control', '电控与安全', 94, 36),
    ],
    structureParameters: [
      ['装载料盘包络 Wt × Ht × Lt / 料盘质量（mm / kg）', '料盘、工件、定位和热胀间隙一并确认。'],
      ['每盘净装载 / 在炉盘数 / 推力链载荷', '热负荷、结构与推进载荷分开核算。'],
      ['推送节距 Ppush / 节拍 tcycle / 有效时间', '与温区长度和工艺过程对应。'],
      ['料盘材质 / 热态变形 / 摩擦与对中', '用于通道、导向、推杆和维护设计。'],
      ['气氛 / 冷却 / 回盘 / 上下游联锁', '形成完整连续生产边界。'],
    ],
    structureSystems: [
      ['炉体与温区', '按工艺段、热负荷、气氛和维护分段设计。'],
      ['加热与控温', '按在炉装载、推进节拍和各段曲线分区配置。'],
      ['料盘与通道', '料盘、导轨、间隙、热胀和高温强度成套校核。'],
      ['推杆与驱动', '推力、行程、速度、对中、限位和卡阻保护统筹设计。'],
      ['转移与回盘', '出料、淬火、清洗、回火和空盘返回按节拍联动。'],
      ['电控与安全', '控温、记录、推料互锁、堵料报警和整线急停按项目约定。'],
    ],
    faqs: [
      {
        question: '哪些工件适合先评估推杆炉？',
        answer:
          '需要料盘、料框或专用工装定位，且批量、工艺路线和推进节拍相对稳定的工件，可先进入推杆炉方案评估。',
      },
      {
        question: '推杆炉与网带炉怎么选？',
        answer:
          '可稳定直接铺在网带上的小件可优先比较网带炉；需要料盘保持姿态、承载较重或不宜接触网带的工件，更适合评估推杆炉。',
      },
      {
        question: '推杆推力能直接代表最大装载吗？',
        answer:
          '不能。推力还受在炉盘数、摩擦、热胀、料盘变形、对中、坡度和启停工况影响，需要按完整推力链校核。',
      },
      {
        question: '推进节拍怎样确定？',
        answer:
          '需结合各工艺段有效长度、在炉盘数、加热保温时间、转移冷却、上下料和回盘时间统一平衡。',
      },
      {
        question: '报价前最少需要哪些资料？',
        answer:
          '至少需要工件与料盘尺寸、质量和材质、每盘数量、在炉盘数、工艺曲线、推进节拍、气氛、冷却转移和上下游接口。',
      },
    ],
    related: [
      {
        title: '网带炉',
        image: detailImage('mesh-belt-furnace', 'main'),
        alt: '小件直接连续输送的网带炉',
        text: '可直接铺料的小件可比较网带输送。',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
      {
        title: '辊底炉',
        image: detailImage('roller-hearth-furnace', 'main'),
        alt: '辊道连续输送的辊底炉',
        text: '板材与规整长件可比较辊道输送。',
        href: '/zh/products/detail/roller-hearth-furnace',
      },
      {
        title: '转底炉',
        image: detailImage('rotary-hearth-furnace', 'main'),
        alt: '环形炉底旋转的转底炉',
        text: '同一区域装出料可比较环形炉底。',
        href: '/zh/products/detail/rotary-hearth-furnace',
      },
    ],
  },

  'roller-hearth-furnace': {
    slug: 'roller-hearth-furnace',
    name: '辊底炉',
    englishName: 'ROLLER HEARTH HEAT TREATMENT FURNACE',
    title: '辊底炉｜规整工件辊道连续热处理',
    description:
      '面向板材、条材、棒材、管材及可由辊道稳定支承的规整工件，先按支承跨度、线载荷、辊距、输送速度和工艺时间判断方案，再确定有效宽度、温区与冷却接口。',
    gallery: [
      {
        src: detailImage('roller-hearth-furnace', 'main'),
        alt: '辊底式热处理炉、进料辊道与多段炉体主场景',
        caption: '辊底炉全景',
      },
      {
        src: detailImage('roller-hearth-furnace', 'loading'),
        alt: '辊底炉工件进入炉膛的辊道装料场景',
        caption: '辊道装料',
      },
      {
        src: detailImage('roller-hearth-furnace', 'lining'),
        alt: '辊底炉炉衬、加热元件与炉辊制造检查场景',
        caption: '炉衬与炉辊',
      },
      {
        src: detailImage('roller-hearth-furnace', 'control'),
        alt: '辊底炉电控柜与温度记录操作场景',
        caption: '电控与记录',
      },
    ],
    tags: ['板材 / 条材 / 长件', '炉辊连续输送', '多温区控制', '辊距与载荷需校核'],
    heroInfo: [
      ['现有项目炉膛样本', '4,050 × 3,100 × 500 mm'],
      ['现有项目工件样本', 'Φ1,500–Φ3,000 × 8–15 mm'],
      ['现有项目炉辊中心距', '约 600 mm'],
      ['现有项目温度 / 速度', '950 ℃ / 5–20 m/min'],
    ],
    productProperties: [
      { name: '现有项目炉膛样本', value: '4,050 × 3,100 × 500 mm' },
      { name: '现有项目工件样本', value: 'Φ1,500–Φ3,000 × 8–15 mm' },
      { name: '现有项目炉辊中心距', value: '约 600 mm' },
      { name: '现有项目温度 / 速度', value: '950 ℃ / 5–20 m/min' },
    ],
    heroNotice:
      '上述数据来自苏能现有辊底炉项目资料，仅作为选型参考。5–20 m/min 为资料所列速度范围，需进一步核对其用于进出炉、往复还是稳定工艺运行，不能直接据此计算加热时间或产能。工件支承、炉辊载荷和工艺节拍须按项目校核。',
    workpieces: [
      {
        status: '通常适合评估',
        tone: 'positive',
        title: '板材、条材、棒材与管材',
        text: '适合由多根炉辊连续支承并稳定通过各温区的规整工件。',
      },
      {
        status: '按支承评估',
        tone: 'positive',
        title: '托盘承载或较长规格工件',
        text: '需核对支承点数、最小长度、悬伸、线载荷与热态变形。',
      },
      {
        status: '需要比较炉型',
        tone: 'caution',
        title: '易滚动小件、散装件或需固定节距料盘工件',
        text: '应比较网带炉、推杆炉或周期式炉型。',
      },
    ],
    suitableConditions: [
      '工件或托盘能在炉辊上稳定支承，不会滚落、卡阻或过度悬伸。',
      '生产批量和规格适合连续输送，进出料接口明确。',
      '工件线载荷、炉辊材质、辊距和热态变形可以校核。',
    ],
    requiredConditions: [
      '工件尺寸、材料、单件质量、最小长度、平直度和支承方式。',
      '长期温度、最高温度、工艺时间、气氛和冷却。',
      '进出料辊道、对中、速度、上下游设备和厂房布置。',
    ],
    workpieceWarning:
      '同样总重量在不同工件长度和支承跨度下会形成不同炉辊载荷，不能用“单件最大重量”代替辊道系统校核。',
    optionGroups: [
      { title: '热源方式', options: ['电阻加热', '天然气加热', '其他燃料需单独评估'] },
      { title: '输送方式', options: ['工件直接上辊', '托盘 / 料架', '对中导向按工件选配'] },
      { title: '炉辊配置', options: ['耐热钢炉辊', '陶瓷辊按工艺评估', '分段驱动按节拍设计'] },
      { title: '炉内气氛', options: ['空气气氛', '保护气氛', '可控气氛需密封与联锁'] },
      {
        title: '冷却路径',
        options: ['出炉空冷', '受控风冷', '联线淬火 / 固溶处理后快速冷却'],
      },
    ],
    solutions: [
      {
        title: '电加热辊底炉',
        image: detailImage('roller-hearth-furnace', 'main'),
        alt: '辊底式连续热处理炉与进料辊道主场景',
        eyebrow: '分区电阻加热',
        text: '按工件热负荷、有效时间和辊道输送分区配置。',
        suitable: '规整工件的连续退火、回火与加热方向',
        advantage: '便于围绕有效区和输送速度配置温区',
        verify: '有效宽度、辊距、线载荷、速度与分区',
        noPromise: '不脱离支承与装载状态承诺产量和均匀性',
      },
      {
        title: '燃气辊底炉',
        image: detailImage('roller-hearth-furnace', 'gas'),
        alt: '燃气辊底炉、燃烧管路与连续辊道',
        eyebrow: '燃烧、炉压与排烟',
        text: '供气、燃烧、排烟和炉压控制需与辊道密封整体确认。',
        suitable: '厂房供气和排烟条件明确的连续加热任务',
        advantage: '可结合炉体规模与能源条件进行方案比较',
        verify: '燃烧器、炉压、排烟、辊封与安全联锁',
        noPromise: '不以燃烧器参数代替整炉性能验收',
      },
      {
        title: '保护气氛辊底炉',
        image: detailImage('roller-hearth-furnace', 'lining'),
        alt: '辊底炉炉衬、加热元件与炉辊结构',
        eyebrow: '连续炉口与气氛分区',
        text: '进出料炉口、辊轴密封、置换和排放共同形成气氛边界。',
        suitable: '对氧化、脱碳或表面状态有控制要求的长件',
        advantage: '可按温区和炉口组织连续气氛系统',
        verify: '炉口、辊封、气氛、排放、监测与联锁',
        noPromise: '不把气体流量直接等同于表面质量',
      },
      {
        title: '辊底炉＋快速冷却段',
        image: detailImage('roller-hearth-furnace', 'processLine'),
        alt: '辊底炉完整机组与进出料配套工位',
        eyebrow: '加热＋转移＋冷却',
        text: '加热、出炉、冷却、对中和输送按统一节拍匹配。',
        suitable: '需要正火后受控冷却或固溶处理后快速冷却的规整工件',
        advantage: '连续辊道可组织稳定转移路径',
        verify: '出炉温度、冷却强度、平直度、输送与联锁',
        noPromise: '不在工艺试验不足时承诺组织、性能和板形',
      },
    ],
    equations: [
      ['有效输送宽度 Wr', '≠', '炉辊辊面总长'],
      ['工件总质量', '≠', '单根炉辊设计载荷'],
    ],
    boundaryImage: {
      src: detailImage('roller-hearth-furnace', 'lining'),
      alt: '辊底炉炉衬、加热元件、炉辊排列和炉口结构',
      caption: '工件长度、支承点数、炉辊中心距和线载荷应在同一工况下校核。',
    },
    boundaryFacts: [
      ['有效输送宽度', '按工件实际运行、对中和安全间隙定义，不等于辊面总长。'],
      ['最小支承长度', '应保证工件或托盘在任一位置都有足够支承点。'],
      ['单辊载荷', '由工件质量、支承跨度、载荷分布和动态冲击共同决定。'],
      ['炉辊材料', '按温度、气氛、载荷、腐蚀和热循环选择。'],
      ['有效时间', '由有效加热长度与实际输送速度共同确定。'],
      ['能力承诺', '不公开未经热态与负载验证的最大载荷、速度和产量。'],
    ],
    requiredData: [
      ['工件', '材料、宽厚长 / 直径长度、质量、平直度和表面状态'],
      ['支承', '直接上辊或托盘、最小长度、支承跨度与线载荷'],
      ['工艺', '长期温度、最高温度、有效时间、气氛与曲线'],
      ['输送', '速度、对中、进出料、工件间距和规格切换'],
      ['冷却', '空冷、风冷、淬火或固溶处理后快速冷却与转移边界'],
      ['公用条件', '供电或燃气、排烟、气氛、冷却和整线空间'],
    ],
    standards: [
      {
        group: '辊底炉适用工艺与电阻加热',
        items: [
          'JB/T 14730-2024（仅在辊底式连续退火工艺下引用）',
          ...commonStandards.resistance,
          ...commonStandards.resistanceSafety,
        ],
      },
      {
        group: '有效加热区、电气与通用安全',
        items: [...commonStandards.effectiveZone, ...commonStandards.generalSafety],
      },
      { group: '燃气方案条件引用', items: [...commonStandards.burnerReference] },
    ],
    structureImage: {
      src: detailImage('roller-hearth-furnace', 'cutaway'),
      alt: '辊底炉炉体、炉衬、炉辊、传动和支承结构剖切示例',
      caption: '辊底炉结构示例 · 具体配置随工件支承、热源、气氛和冷却路线变化',
    },
    structureCallouts: [
      cutawayCallout('leftTop', 'shell', '炉体与温区', 45, 20),
      cutawayCallout('rightMiddle', 'heating', '加热与控温', 56, 31),
      cutawayCallout('leftMiddle', 'rollers', '炉辊与支承', 48, 49),
      cutawayCallout('leftBottom', 'drive', '传动与对中', 69, 52),
      cutawayCallout('rightTop', 'atmosphere', '气氛与冷却', 79, 18),
      cutawayCallout('rightBottom', 'control', '电控与联线', 94, 37),
    ],
    structureParameters: [
      ['工件最大 / 最小规格与支承方式', '最小长度、悬伸和对中状态必须同时确认。'],
      ['有效宽度 Wr / 工件包络高度 Hload（mm）', '与辊面总长和炉膛结构尺寸分开定义。'],
      ['单件质量 / 线载荷 / 单辊校核载荷', '按实际支承点与动态工况计算。'],
      ['炉辊直径 / 中心距 Pr / 材质 / 驱动分区', '按热态强度、速度和维护要求确定。'],
      ['有效长度 / 速度 / 冷却 / 上下游接口', '形成连续工艺与生产节拍。'],
    ],
    structureSystems: [
      ['炉体与温区', '按工艺段、热负荷、热源和维护分段设计。'],
      ['加热与控温', '电阻或燃气系统按有效时间和温区曲线配置。'],
      ['炉辊与支承', '炉辊、轴承、密封、冷却和更换方式按热态载荷校核。'],
      ['传动与对中', '分段驱动、速度同步、对中、跑偏和堵料保护统筹设计。'],
      ['气氛与冷却', '炉口、辊封、置换、排放和冷却接口成套确认。'],
      ['电控与联线', '控温、记录、速度联动、报警和整线急停按项目约定。'],
    ],
    faqs: [
      {
        question: '哪些工件适合先评估辊底炉？',
        answer:
          '能由辊道稳定支承的板材、条材、棒材、管材和规整长件，可先进入辊底炉方案评估。仍需核对最小长度、支承跨度、线载荷、平直度和工艺时间。',
      },
      {
        question: '辊底炉与推杆炉怎么选？',
        answer:
          '工件或托盘可直接由辊道稳定输送时可比较辊底炉；需要标准料盘按固定节距推进、保持特定姿态时更适合评估推杆炉。',
      },
      {
        question: '为什么总重量不能代表炉辊载荷？',
        answer:
          '工件长度、支点数量、支承跨度、重心和输送冲击会改变单根炉辊受力，必须按最不利位置核算。',
      },
      {
        question: '输送速度怎样确定？',
        answer:
          '需结合有效加热长度、升温和保温时间、温区曲线、冷却与上下游节拍确定，不能单独以目标产量倒推。',
      },
      {
        question: '报价前最少需要哪些资料？',
        answer:
          '至少需要工件材料、最大与最小规格、单件质量、支承方式、线载荷、长期与最高温度、工艺时间、输送速度、气氛、冷却和上下游接口。',
      },
    ],
    related: [
      {
        title: '网带炉',
        image: detailImage('mesh-belt-furnace', 'main'),
        alt: '小件连续输送用网带炉',
        text: '小件平铺或散装可比较网带输送。',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
      {
        title: '推杆炉',
        image: detailImage('pusher-furnace', 'main'),
        alt: '料盘节拍推进的推杆炉',
        text: '需料盘定位的工件可比较推杆输送。',
        href: '/zh/products/detail/pusher-furnace',
      },
      {
        title: '台车炉',
        image: detailImage('trolley-furnace', 'main'),
        alt: '大型重件周期式处理台车炉',
        text: '多品种大型重件可比较周期式装炉。',
        href: '/zh/products/detail/trolley-furnace',
      },
    ],
  },

  'rotary-hearth-furnace': {
    slug: 'rotary-hearth-furnace',
    name: '转底炉',
    englishName: 'ROTARY HEARTH HEAT TREATMENT FURNACE',
    title: '转底炉｜环形炉底节拍式热处理',
    description:
      '面向可在环形炉底上按工位布置的盘类、环类、锻件和批量工件，先按布料环带、单件质量、工位节距、旋转方式和装出料区域判断方案，再确定炉底、温区与自动化接口。',
    gallery: [
      {
        src: detailImage('rotary-hearth-furnace', 'main'),
        alt: '转底式热处理炉、圆形炉体与回转炉底驱动主场景',
        caption: '转底炉全景',
      },
      {
        src: detailImage('rotary-hearth-furnace', 'loading'),
        alt: '转底炉工件装料与回转炉底进料场景',
        caption: '装料与转运',
      },
      {
        src: detailImage('rotary-hearth-furnace', 'lining'),
        alt: '转底炉炉衬、加热元件与环形炉底制造检查场景',
        caption: '炉衬与炉底',
      },
      {
        src: detailImage('rotary-hearth-furnace', 'control'),
        alt: '转底炉电控柜与温度记录操作场景',
        caption: '电控与记录',
      },
    ],
    tags: ['环形炉底', '工位式布料', '同区域装出料', '旋转节拍需系统校核'],
    // 行业公开样本：唐山亚捷热处理转底炉系列（炉底直径与节拍）；
    // Gadda #1185 受控气氛热处理转底炉（单个项目炉膛尺寸）。
    heroInfo: [
      ['布料范围', '按工件尺寸与间距核算'],
      ['工位节拍', '按工艺时间与产量核算'],
      ['旋转方式', '连续 / 步进，按工艺选择'],
      ['温度与气氛', '按材料及表面要求确定'],
    ],
    productProperties: [],
    heroNotice: '将工件布料、加热停留与进出料节拍一起核算，再确定炉底尺寸、工位和温度分区。',
    workpieces: [
      {
        status: '通常适合评估',
        tone: 'positive',
        title: '盘类、环类、锻件与工位化工件',
        text: '适合在环形炉底上按圆周方向布置并随炉底旋转完成加热。',
      },
      {
        status: '按布料评估',
        tone: 'positive',
        title: '需要固定工位或机械上下料的工件',
        text: '需核对工件包络、重心、工位节距、抓取姿态和装出料扇区。',
      },
      {
        status: '需要比较炉型',
        tone: 'caution',
        title: '长件、散装小件或需直线连续输送工件',
        text: '应比较井式炉、网带炉、推杆炉或辊底炉。',
      },
    ],
    suitableConditions: [
      '工件能在炉底上稳定布置，旋转时不会滑移或倾覆。',
      '装料、加热、出料可在环形路径上形成明确工位。',
      '炉底载荷、驱动扭矩、支承和密封边界可以校核。',
    ],
    requiredConditions: [
      '工件尺寸、质量、重心、底部接触和布料方式。',
      '工位数量、节距、旋转方式、工艺时间和上下料节拍。',
      '热源、气氛、冷却、机械手或输送接口及厂房条件。',
    ],
    workpieceWarning:
      '转底炉并不等同于冶金尘泥处理用转底炉工艺；本页讨论的是工件热处理用环形炉底设备，标准与工艺边界应按具体项目确认。',
    optionGroups: [
      { title: '热源方式', options: ['电阻加热', '天然气加热', '其他燃料需单独评估'] },
      { title: '旋转方式', options: ['连续旋转', '步进分度', '工位停留按工艺设计'] },
      { title: '布料方式', options: ['单环布料', '多环布料', '专用托具 / 工装'] },
      { title: '炉内气氛', options: ['空气气氛', '保护气氛', '可控气氛需密封与联锁'] },
      { title: '上下料', options: ['同侧装出料', '分区装出料', '机械手 / 输送线接口'] },
    ],
    solutions: [
      {
        title: '电加热转底炉',
        image: detailImage('rotary-hearth-furnace', 'main'),
        alt: '转底式热处理炉与回转炉底驱动主场景',
        eyebrow: '分区电阻加热',
        text: '按环形有效区、工位停留和热负荷配置加热分区。',
        suitable: '工位化批量工件的节拍式热处理',
        advantage: '便于围绕圆周位置组织分区与工位',
        verify: '有效环带、工位、扭矩、分区与炉底承载',
        noPromise: '不脱离布料和节拍承诺产量与均匀性',
      },
      {
        title: '燃气转底炉',
        image: detailImage('rotary-hearth-furnace', 'gas'),
        alt: '燃气转底炉、圆形炉体与燃烧排烟系统',
        eyebrow: '燃烧、炉压与排烟',
        text: '燃烧器、排烟、炉压和旋转密封需整体设计。',
        suitable: '供气与排烟条件明确的中大型转底炉任务',
        advantage: '可结合炉体规模与能源条件比较方案',
        verify: '燃烧器、排烟、炉压、密封与联锁',
        noPromise: '不以燃烧器参数代替整炉性能验收',
      },
      {
        title: '步进分度转底炉',
        image: detailImage('rotary-hearth-furnace', 'lining'),
        alt: '转底炉炉衬、加热元件与环形炉底结构',
        eyebrow: '工位停留与分度',
        text: '按工位角度、停留时间、加减速和上下料窗口组织节拍。',
        suitable: '需要固定工位停留和机械上下料的工件',
        advantage: '工位与操作动作边界较清晰',
        verify: '工位数、角度、重复定位、扭矩与互锁',
        noPromise: '不在工位动作未验证时承诺节拍',
      },
      {
        title: '大型自动化转底炉',
        image: detailImage('rotary-hearth-furnace', 'processLine'),
        alt: '转底炉完整机组与自动化上下料配套工位',
        eyebrow: '炉体＋上下料自动化',
        text: '炉底、机械手、输送、检测与冷却按统一工位节拍联动。',
        suitable: '批量稳定、工位清晰的自动化热处理任务',
        advantage: '装料与出料可在限定扇区内组织',
        verify: '抓取姿态、工位、物流、故障旁路与安全区',
        noPromise: '不在自动化边界不全时承诺开动率',
      },
    ],
    equations: [
      ['有效布料环带', '≠', '炉底结构外径范围'],
      ['单件质量 × 工位数', '≠', '炉底驱动设计载荷'],
    ],
    boundaryImage: {
      src: detailImage('rotary-hearth-furnace', 'lining'),
      alt: '转底炉炉衬、加热元件、回转炉底与密封结构',
      caption: '有效环带、工位布置、炉底支承、驱动扭矩与旋转密封应分别校核。',
    },
    boundaryFacts: [
      ['有效布料环带', '由有效外径、有效内径、炉墙、开口和安全间隙共同确定。'],
      ['工位包络', '包含工件、托具、抓取空间和旋转过程中的动态间隙。'],
      ['炉底载荷', '按工件、托具、载荷分布和热态结构校核。'],
      ['驱动扭矩', '受载荷、摩擦、密封、加减速和异常工况影响。'],
      ['旋转节拍', '由工艺停留、分度、上下料和自动化动作共同决定。'],
      ['能力承诺', '不公开未经热态与负载验证的最大载荷、速度和产量。'],
    ],
    requiredData: [
      ['工件', '材料、尺寸、质量、重心、底部接触与抓取姿态'],
      ['布料', '有效内外径、工位数、环数、间距和托具'],
      ['工艺', '长期温度、最高温度、各工位时间、气氛与曲线'],
      ['旋转', '连续 / 步进、角度、速度、加减速与定位精度'],
      ['上下料', '人工、机械手或输送线，装出料扇区和冷却路径'],
      ['公用条件', '供电或燃气、排烟、气氛、基础和安全区域'],
    ],
    standards: [
      {
        group: '电阻炉通用与试验',
        items: [...commonStandards.resistance, ...commonStandards.resistanceSafety],
      },
      {
        group: '有效加热区、电气与通用安全',
        items: [...commonStandards.effectiveZone, ...commonStandards.generalSafety],
      },
      { group: '燃气方案条件引用', items: [...commonStandards.burnerReference] },
    ],
    structureImage: {
      src: detailImage('rotary-hearth-furnace', 'cutaway'),
      alt: '转底炉炉体、炉衬、回转炉底、驱动和分区结构剖切示例',
      caption: '转底炉结构示例 · 具体配置随布料环带、热源、工位与自动化方式变化',
    },
    structureCallouts: [
      cutawayCallout('leftTop', 'shell', '炉体与炉衬', 76, 22),
      cutawayCallout('rightTop', 'heating', '加热与控温', 71, 33),
      cutawayCallout('leftBottom', 'hearth', '回转炉底', 50, 48),
      cutawayCallout('rightMiddle', 'drive', '驱动与分度', 82, 62),
      cutawayCallout('leftMiddle', 'workstation', '工位与料具', 31, 36),
      cutawayCallout('rightBottom', 'support', '支承滚轮与基础', 54, 64),
    ],
    structureParameters: [
      ['工件包络 / 单件质量 / 重心与底部接触', '用于布料、稳定性、抓取和炉底载荷核算。'],
      ['有效布料外径 Do / 内径 Di / 高度 Hload（mm）', '与炉底结构直径和炉膛尺寸分开定义。'],
      ['工位数量 / 工位角度 / 工件间距', '对应工艺停留和上下料动作。'],
      ['连续或步进 / 速度 / 扭矩 / 定位', '按载荷、密封和异常工况校核。'],
      ['热源 / 气氛 / 上下料 / 冷却与联锁', '形成完整设备与自动化边界。'],
    ],
    structureSystems: [
      ['炉体与炉衬', '按有效环带、热源、温区和检修方式确定。'],
      ['加热与控温', '电阻或燃气系统按圆周工位和热负荷分区。'],
      ['回转炉底', '炉底、耐热层、支承、热胀和密封按热态载荷设计。'],
      ['驱动与分度', '传动、扭矩、制动、定位、限位和异常保护统筹设计。'],
      ['工位与料具', '工位数量、料具、工件间距和布料环带按节拍与热负荷确认。'],
      ['支承滚轮与基础', '支承滚轮、轴承、轨道和基础按回转载荷与检修条件校核。'],
    ],
    faqs: [
      {
        question: '哪些工件适合先评估转底炉？',
        answer:
          '能在环形炉底上稳定布置，并适合按工位或连续圆周路径完成加热的盘类、环类、锻件和批量工件，可先进入转底炉方案评估。',
      },
      {
        question: '炉底直径能直接作为有效布料范围吗？',
        answer:
          '不能。还要扣除中心区域、炉墙、密封、装出料开口、安全间隙和抓取空间，最终以有效布料内外径和工位包络表达。',
      },
      {
        question: '连续旋转和步进分度怎么选？',
        answer:
          '连续旋转适合工艺沿圆周连续变化的场景；步进分度适合固定工位停留和机械上下料。最终取决于工艺时间、定位、动作和节拍。',
      },
      {
        question: '为什么本页不引用冶金尘泥处理转底炉标准？',
        answer:
          '同名设备可能用于不同工艺。本页是工件热处理用环形炉底设备，不能套用冶金尘泥还原或能耗标准，应按具体热源、工艺和设备边界选择适用标准。',
      },
      {
        question: '报价前最少需要哪些资料？',
        answer:
          '至少需要工件材料、尺寸、质量、重心、托具、工位布料、工艺曲线、旋转方式、上下料动作、冷却路线、热源与厂房条件。',
      },
    ],
    related: [
      {
        title: '推杆炉',
        image: detailImage('pusher-furnace', 'main'),
        alt: '料盘直线推进的推杆炉',
        text: '料盘直线节拍推进可比较推杆炉。',
        href: '/zh/products/detail/pusher-furnace',
      },
      {
        title: '辊底炉',
        image: detailImage('roller-hearth-furnace', 'main'),
        alt: '辊道直线连续输送的辊底炉',
        text: '规整长件可比较辊道输送。',
        href: '/zh/products/detail/roller-hearth-furnace',
      },
      {
        title: '台车炉',
        image: detailImage('trolley-furnace', 'main'),
        alt: '大型重件周期式处理台车炉',
        text: '多品种大型重件可比较周期式台车装炉。',
        href: '/zh/products/detail/trolley-furnace',
      },
    ],
  },
};

export function isIndustryFurnaceSlug(slug: string): slug is IndustryFurnaceSlug {
  return slug in industryFurnacePageConfigs;
}
