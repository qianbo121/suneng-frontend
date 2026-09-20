import type { FurnacePageConfig } from './types';
import { commonStandards, cutawayCallout, detailImage } from './shared';

export const trolleyFurnacePageConfig: FurnacePageConfig = {
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
};
