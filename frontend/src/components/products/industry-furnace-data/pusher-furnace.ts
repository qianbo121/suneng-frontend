import type { FurnacePageConfig } from './types';
import { commonStandards, cutawayCallout, detailImage } from './shared';

export const pusherFurnacePageConfig: FurnacePageConfig = {
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
};
