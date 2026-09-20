import type { FurnaceCutawayCallout } from './FurnaceCutawayDiagram';
import type { PitFurnaceFaqItem, PitFurnaceGalleryImage } from './PitFurnaceDetailClient';

export const galleryImages: PitFurnaceGalleryImage[] = [
  {
    src: '/images/products/pit-furnace/pit-furnace-hero.png',
    alt: '地坑式井式炉、圆形炉盖与垂直吊装机构全景',
    caption: '井式炉全景',
  },
  {
    src: '/images/products/pit-furnace/pit-furnace-lifting.png',
    alt: '长轴类工件通过吊具垂直装入井式炉场景',
    caption: '长轴吊装',
  },
  {
    src: '/images/products/pit-furnace/pit-furnace-interior.png',
    alt: '井式炉圆形炉口、耐火炉衬与竖向电热元件',
    caption: '炉衬与元件',
  },
  {
    src: '/images/products/pit-furnace/pit-furnace-control.png',
    alt: '井式炉电控柜与温度曲线记录操作',
    caption: '电控与记录',
  },
];

export const sectionNav = [
  ['overview', '产品概述'],
  ['workpieces', '适用工件'],
  ['selection', '方案维度'],
  ['boundaries', '能力边界'],
  ['structure', '关键结构'],
  ['faq', '常见问题'],
  ['related', '相关资料'],
  ['inquiry', '提交工况'],
] as const;

export const selectionDimensions = [
  {
    title: '热源方式',
    options: [{ label: '电阻加热' }, { label: '天然气加热' }, { label: '其他燃料需单独评估' }],
  },
  {
    title: '温度条件',
    options: [
      { label: '长期工作温度' },
      { label: '最高使用温度' },
      { label: '升温与保温制度' },
      { label: '按材料与工艺确定设计条件' },
    ],
  },
  {
    title: '装炉方式',
    options: [
      { label: '单件吊挂' },
      { label: '多点吊具' },
      { label: '专用料架' },
      { label: '耐热钢料筐' },
    ],
  },
  {
    title: '炉内气氛',
    options: [
      { label: '空气气氛' },
      { label: '氮气保护' },
      { label: '可控气氛需密封、置换与联锁系统' },
    ],
  },
  {
    title: '冷却路径',
    options: [{ label: '炉冷' }, { label: '空冷' }, { label: '转移至淬火槽' }],
  },
] as const;

export const solutionCards = [
  {
    title: '井式电阻炉',
    image: '/images/products/pit-furnace/pit-furnace-hero.png',
    alt: '空气气氛井式电阻炉地坑安装场景',
    temperature: '按工艺温度配置',
    text: '适合按工件长度、装炉方式和工艺曲线核算的周期式热处理。',
  },
  {
    title: '高温井式炉',
    image: '/images/products/pit-furnace/pit-furnace-interior.png',
    alt: '高温井式炉耐火炉衬与竖向电热元件',
    temperature: '按温度与材料兼容性评估',
    text: '按长期工作温度、最高使用温度及炉衬与加热元件适用条件配置。',
  },
  {
    title: '井式炉＋淬火槽机组',
    image: '/images/products/pit-furnace/pit-furnace-quench-line.png',
    alt: '井式炉与淬火槽及转移机构组合',
    temperature: '加热＋转移＋冷却',
    text: '需同时校核最大起吊总质量、转移路径、安全联锁与冷却介质。',
  },
  {
    title: '井式燃气炉',
    image: '/images/products/pit-furnace/pit-furnace-gas.png',
    alt: '燃气井式炉、炉盖与燃烧排烟系统',
    temperature: '按能源与排烟条件评估',
    text: '燃烧系统、排烟、安全联锁与厂房公用条件需逐项确认。',
  },
] as const;

export const comparisonRows = [
  [
    '井式电阻炉',
    '分区控温、现场供电条件明确的长件周期式热处理',
    '控制布置清晰，便于按有效区分区核算',
    '供电容量、控温区、料具和炉盖结构',
    '不脱离装炉状态承诺温差与升温时间',
  ],
  [
    '高温井式炉',
    '确有更高额定等级需求且材料、炉衬与工艺均已确认',
    '可围绕额定等级配置炉衬与加热系统',
    '长期工作温度、最高温度和材料兼容性',
    '额定温度不等于默认长期工作温度',
  ],
  [
    '井式炉＋淬火槽机组',
    '需要加热后转移至冷却介质的工艺',
    '可把加热、起吊、转移和冷却作为系统评估',
    '最大起吊总质量、转移时间、路径与联锁',
    '不在工况不全时承诺转移节拍和冷却结果',
  ],
  [
    '井式燃气炉',
    '现场具备燃气、排烟和安全条件的项目',
    '可结合能源条件进行热源方案比较',
    '燃烧器、供气、排烟、联锁和厂房条件',
    '燃烧器参考标准不能替代整炉验收约定',
  ],
] as const;

export const boundaryData = [
  ['工件', '名称、材料牌号、最大尺寸、单件质量、重心与变形要求'],
  ['工艺', '长期工作温度、最高温度、升降温曲线、保温时间与质量目标'],
  ['装炉与节拍', '吊挂 / 料架 / 料筐、单炉数量、工件间距与批次节拍'],
  ['质量目标', '有效区、温度记录、表面状态、硬度或组织要求及验收口径'],
  ['冷却', '炉冷、空冷或冷却介质，转移路径与允许时间'],
  ['公用条件', '供电或燃气、排烟、行车、厂房高度、地坑深度与安装边界'],
] as const;

export const structureParameters = [
  ['最大装料高度 Lload（mm）', '工件与装料工装形成的最大垂直包络。'],
  ['最大装料包络直径 Dload（mm）', '工件、间距与料具形成的最大水平包络。'],
  ['单件 / 净装载 / 料具 / 最大起吊总质量（kg）', '热负荷与起吊载荷分开填写、分开核算。'],
  [
    '行车吊钩最高工作位置距地高度 / 允许地坑深度（mm）',
    '用于校核垂直吊装路径、厂房净高和基础条件。',
  ],
  [
    '炉盖开启方式 / 可用开启净空 Ctop、Cside（mm）',
    '开启方式无毫米单位；毫米单位只属于顶部与侧向净空。',
  ],
] as const;

export const structureSystems = [
  ['炉体与炉衬', '围绕有效加热区、额定等级、热损失和检修边界确定结构。'],
  ['加热系统（电阻 / 燃气）', '根据热源、工艺温度、控温区与公用条件分别核算。'],
  ['循环与导流', '导流筒、循环方向与装炉间距按工艺和温度场需求选配。'],
  ['炉盖与密封', '升降或旋转方式、密封结构、开启净空与联锁逐项确认。'],
  ['吊具与转移', '按最大起吊总质量、重心、路径、速度与冷却方式校核。'],
  ['电控与安全', '控温、记录、报警、联锁、急停和数据接口按项目约定。'],
] as const;

export const cutawayCallouts = [
  {
    target: 'shell',
    label: '炉体与炉衬',
    position: 'leftBottom',
    line: { x1: 21, y1: 43, x2: 35, y2: 47 },
  },
  {
    target: 'heating',
    label: '分区电热元件',
    position: 'rightMiddle',
    line: { x1: 79, y1: 43, x2: 60, y2: 47 },
  },
  {
    target: 'flow',
    label: '导流筒（按工艺选配）',
    position: 'rightBottom',
    line: { x1: 79, y1: 53, x2: 44, y2: 47 },
  },
  {
    target: 'lid',
    label: '炉盖与密封',
    position: 'leftTop',
    line: { x1: 21, y1: 15, x2: 38, y2: 18 },
  },
  {
    target: 'handling',
    label: '吊具与垂直装料',
    position: 'leftMiddle',
    line: { x1: 21, y1: 31, x2: 49, y2: 37 },
  },
  {
    target: 'control',
    label: '电控与安全',
    position: 'rightTop',
    line: { x1: 79, y1: 17, x2: 78, y2: 24 },
  },
] as const satisfies readonly FurnaceCutawayCallout[];

export const faqItems: PitFurnaceFaqItem[] = [
  {
    question: '哪些长轴类工件适合先评估井式炉？',
    answer:
      '长轴、辊轴、拉杆、套筒及通过吊挂、料架或料筐竖直装炉的工件，可以先进入井式炉方案评估。仍需结合最大尺寸、长径比、单件质量、净装载、料具、变形要求和厂房吊装条件判断。',
  },
  {
    question: '井式炉的工作温度怎样确定？',
    answer:
      '先明确材料与热处理目的、长期工作温度、最高使用温度及升温和保温制度，再核对炉衬、加热元件、装载和热源的适用条件。额定温度不能直接当作默认长期工作温度。',
  },
  {
    question: '有效加热区为什么不能直接写成炉膛尺寸？',
    answer:
      '有效加热区是按约定条件进行温度均匀性评定和使用的工作空间，炉膛结构尺寸还要包含炉衬、加热或燃烧布置、导流和安全间隙，两者用途不同，不能交叉替代。',
  },
  {
    question: '工件净装载与最大起吊总质量有什么区别？',
    answer:
      '工件净装载与随炉料具质量用于热负荷核算；最大起吊总质量还应包含参与起吊的吊梁、吊钩和索具。起吊机构与厂房行车应按最大起吊总质量校核。',
  },
  {
    question: '报价前最少需要提供哪些资料？',
    answer:
      '至少需要工件名称、材料牌号、最大尺寸、单件质量、单炉数量、工件净装载、随炉料具质量、最大起吊总质量、长期工作温度、最高温度、保温时间、装炉方式、冷却介质、工艺曲线和厂房条件。',
  },
];

export const relatedEquipment = [
  [
    '井式电阻炉',
    '/images/products/pit-furnace/pit-furnace-hero.png',
    '空气气氛井式电阻炉地坑安装场景',
    '按有效区、装炉方式和控温分区评估。',
  ],
  [
    '井式炉＋淬火槽机组',
    '/images/products/pit-furnace/pit-furnace-quench-line.png',
    '井式炉与淬火槽及转移机构组合',
    '同时校核起吊、转移、冷却与安全联锁。',
  ],
  [
    '井式燃气炉',
    '/images/products/pit-furnace/pit-furnace-gas.png',
    '燃气井式炉、炉盖与燃烧排烟系统',
    '按燃气、排烟和厂房公用条件评估。',
  ],
] as const;

export const relatedArticles = [
  ['查看井式炉相关方案与项目资料', '#related-case-evidence'],
  ['企业资质与专利证书原件', '/zh/strength/honors'],
  ['工业炉报价需要哪些参数', '/zh/articles/gongye-lu-baojia-canshu'],
  ['热处理炉厂家选择时应核对哪些能力边界', '/zh/solutions/rechuli-lu-changjia'],
  ['旧井式炉维修、节能改造或控制系统升级', '/zh/service/furnace-renovation-overhaul'],
] as const;
