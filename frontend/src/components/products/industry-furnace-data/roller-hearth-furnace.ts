import type { FurnacePageConfig } from './types';
import { commonStandards, cutawayCallout, detailImage } from './shared';

export const rollerHearthFurnacePageConfig: FurnacePageConfig = {
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
};
