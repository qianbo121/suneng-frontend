import type { FurnacePageConfig } from './types';
import { commonStandards, cutawayCallout, detailImage } from './shared';

export const rotaryHearthFurnacePageConfig: FurnacePageConfig = {
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
};
