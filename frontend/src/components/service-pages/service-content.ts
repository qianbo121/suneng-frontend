export const serviceRoutes = {
  overview: '/zh/service',
  repair: '/zh/service/furnace-renovation-overhaul',
  relocation: '/zh/service/furnace-relocation-restart',
  relocationGuide: '/zh/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan',
  installation: '/zh/service/installation-after-sales',
  guides: '/zh/service/selection-retrofit-guide',
  products: '/zh/products',
  decision: '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
  quote: '/zh/articles/gongye-lu-baojia-canshu',
} as const;

export type ServicePageKind = 'overview' | 'relocation' | 'installation';
export type TextItem = { title: string; text: string; record?: string };
export type FaqItem = { question: string; answer: string };

// Independent assets, never crops of the supplied UI references.
export const serviceHeroAssets = {
  overview: {
    src: '/images/services/furnace-renovation/hero-inspection.webp',
    alt: '技术人员在停机工业炉外核对资料与炉门炉衬状态',
    desktopFocus: '58% 49%',
    mobileFocus: '50% 48%',
  },
  relocation: {
    src: '/images/services/service-pages-20260907/relocation.webp',
    alt: '工业炉模块稳放于支撑底座，技术人员核对重新就位条件，旁侧为转运平台',
    desktopFocus: '65% 52%',
    mobileFocus: '70% 50%',
  },
  installation: {
    src: '/images/services/service-pages-20260907/installation.webp',
    alt: '技术人员在关闭柜门的控制柜前指导操作员，旁侧为工业炉设备',
    desktopFocus: '65% 52%',
    mobileFocus: '78% 50%',
  },
} as const;

export const servicePages = {
  overview: {
    path: serviceRoutes.overview,
    title: '工业炉改造与工程服务',
    breadcrumb: '改造与服务',
    description: '维修与改造、搬迁复产、安装调试与售后，按您的设备现状找到对应服务。',
    note: '先发设备照片和问题描述，资料可后续补充。',
    tags: [],
    secondary: ['查看产品中心', serviceRoutes.products],
    metadataTitle: '工业炉改造与工程服务｜维修、搬迁复产与售后',
    metadataDescription:
      '苏能工业炉提供维修与改造、搬迁与复产、安装调试及售后服务。了解服务范围、咨询资料和实施流程，先发设备照片、铭牌及问题描述进行初步沟通。',
    nav: [],
    faqTitle: '咨询前，您可能关心',
    faqs: [
      {
        question: '不是苏能制造的设备，也能评估吗？',
        answer: '部分非苏能品牌设备可评估，需先核对资料、控制系统和备件条件。',
      },
      {
        question: '只有照片，可以先咨询吗？',
        answer: '可以先发设备全景、铭牌和问题描述，再补充必要资料。',
      },
      {
        question: '旧炉应该维修、改造还是更换？',
        answer: '需结合结构状况、安全系统、工艺要求和投入综合判断。',
      },
      {
        question: '能否直接给出费用和工期？',
        answer: '需先明确设备现状、实施范围、备件及现场条件。',
      },
    ],
    contactTitle: '把设备现状发来，先明确下一步',
    contactText: '设备全景、铭牌、问题描述，先从现有资料开始。',
    contactNote: '',
  },
  relocation: {
    path: serviceRoutes.relocation,
    title: '工业炉搬迁与停产复产',
    breadcrumb: '搬迁与复产',
    description: '按设备状态与现场条件，评估拆装、就位连接、维修改造及复产验证的服务范围。',
    note: '搬迁时可一并评估改造需求，先把设备现状和搬迁目标发来。',
    tags: ['停产重启', '整机搬迁', '搬迁同时改造'],
    secondary: ['查看检查项目', '#equipment-checks'],
    metadataTitle: '工业炉搬迁与停产复产｜检查、试运行与验收',
    metadataDescription:
      '了解工业炉搬迁的拆前记录、拆装转运、就位连接及复产验证，核对六项设备检查、冷态空载负载验证和交付资料。',
    nav: [
      ['relocation-work', '搬迁实施'],
      ['project-scope', '分工与费用'],
      ['equipment-checks', '设备检查'],
      ['verification', '试运行验证'],
      ['acceptance', '验收记录'],
      ['questions', '常见问题'],
    ],
    faqTitle: '搬迁与复产常见问题',
    faqs: [
      {
        question: '搬迁后，原工艺参数还能直接用吗？',
        answer:
          '原参数可作为核对起点。搬迁可能改变设备找正、管线、循环和测温条件，需在新现场重新验证。',
      },
      {
        question: '没有原图纸，还能先评估吗？',
        answer: '可先发照片与铭牌，再判断是否需要补测或恢复资料。',
      },
      {
        question: '复产需要多长时间？',
        answer:
          '先区分技术准备与备料、现场拆装与整改、试运行与验收三段时间。停机窗口要结合设备状态、备件、基础能源条件及必要的烘炉安排确认，不能只按吊装或运输时间估算。',
      },
      {
        question: '搬迁时想同时改造，需要分开咨询吗？',
        answer:
          '可以一起说明需求。先列出保留、维修、更换和新增项目，再核对拆装、改造与复产验证的接口。',
      },
      {
        question: '工业炉搬迁费用怎么算？',
        answer:
          '按检查与技术准备、拆装转运、安装连接、维修改造、调试验收分别核定范围。设备尺寸与重量、运输距离、基础及能源条件会影响费用，吊装运输等由谁承担需在报价中列清。',
      },
      {
        question: '是否需要更换整台设备？',
        answer: '先评估结构、安全系统和工艺适配，再判断维修、改造或更换。',
      },
    ],
    contactTitle: '发来设备现状，初步判断复产需要做什么',
    contactText: '先提供设备全景、铭牌，以及停机原因或搬迁需求。',
    contactNote: '图纸、程序备份和历史记录，可后续补充。',
  },
  installation: {
    path: serviceRoutes.installation,
    title: '工业炉安装调试与售后服务',
    breadcrumb: '安装与售后',
    description: '设备报修与维修支持，或新设备安装调试与交付培训，按当前需要联系苏能。',
    note: '',
    tags: ['设备铭牌', '报警信息', '现场照片', '故障现象'],
    secondary: ['查看安装准备', '#installation-preparation'],
    metadataTitle: '工业炉安装调试与售后服务｜交付、维修与备件',
    metadataDescription:
      '了解工业炉安装准备、客户配合、调试验收、培训交付、故障报修与备件支持，明确服务范围和质保安排。',
    nav: [
      ['after-sales', '故障报修'],
      ['installation-preparation', '安装调试'],
      ['delivery-documents', '交付资料'],
      ['overseas-delivery', '海外交付'],
      ['warranty', '质保服务'],
      ['questions', '常见问题'],
    ],
    faqTitle: '安装与售后常见问题',
    faqs: [
      {
        question: '安装前需要准备哪些条件？',
        answer: '先核对基础、通道、吊装、电源及设备所需能源接口。',
      },
      {
        question: '调试是否包含工件试验？',
        answer: '按约定的验收范围安排，并提前确认工件、工艺和检测要求。',
      },
      {
        question: '过了质保期，还能联系维修吗？',
        answer: '可以沟通维修或备件需求，先确认设备情况与费用。',
      },
      { question: '报修时发哪些资料最有用？', answer: '设备铭牌、故障现象、报警信息和现场照片。' },
    ],
    contactTitle: '安装交付或设备报修，直接联系苏能',
    contactText: '说明设备型号与当前问题，便于安排对应技术人员。',
    contactNote: '',
  },
} as const;

export const serviceEntries = [
  {
    title: '维修与改造',
    text: '炉衬老化、加热异常，或希望升级设备性能。',
    scope: '炉衬与保温／加热系统／电气控制／机械机构',
    action: '查看维修改造',
    href: serviceRoutes.repair,
  },
  {
    title: '搬迁与复产',
    text: '设备需要换厂安装，或停产后重新投入生产。',
    scope: '现状检查／搬迁重装／试运行／复产验证',
    action: '查看搬迁复产',
    href: serviceRoutes.relocation,
  },
  {
    title: '安装调试与售后',
    text: '新设备安装交付，或在用设备需要报修和备件。',
    scope: '安装配合／设备调试／操作培训／维修支持',
    action: '查看安装售后',
    href: serviceRoutes.installation,
  },
  {
    title: '选型与改造指南',
    text: '不确定炉型怎么选，或旧炉该维修、改造还是更换。',
    scope: '工件与工艺／炉型选择／改造判断／询价资料',
    action: '查看选型指南',
    href: serviceRoutes.guides,
  },
] as const;
export const overviewSteps: TextItem[] = [
  { title: '资料初评', text: '了解设备、问题与目标。' },
  { title: '检查与方案', text: '核对设备、现场与安全条件，明确实施范围。' },
  { title: '组织实施', text: '按方案安排维修、改造或安装。' },
  { title: '验证与交付', text: '按服务范围完成安全检查、适用的试运行与性能验证，交付相关记录。' },
];
export const consultationItems: TextItem[] = [
  { title: '设备全景', text: '看清炉体、周边设备及现场条件。' },
  { title: '设备铭牌', text: '尽量拍清型号、出厂信息与主要参数。' },
  { title: '问题与目标', text: '说明故障现象，或希望达到的生产要求。' },
];
export const relocationWork: TextItem[] = [
  {
    title: '拆前记录',
    text: '设备拍照编号，留存接线记录及现有图纸；按设备配置备份控制程序与参数。',
  },
  { title: '拆装转运', text: '明确拆分范围，确认包装防护及吊装、运输分工。' },
  { title: '就位连接', text: '核对基础，完成设备找正、管线及电气接口恢复。' },
  {
    title: '验证交付',
    text: '按设备与工艺要求完成冷态检查、空载试运行及负载验证，整理记录并移交资料。',
  },
];
export const relocationScopeRows = [
  [
    '设备与技术工作',
    '核对拆分、找正、接口恢复及维修改造范围，明确调试和验收要求。',
    '提供设备资料、停机原因、改造目标及已知故障。',
  ],
  [
    '现场与外部配套',
    '核对设备就位、安装连接所需条件和接口。',
    '协调新旧厂房、通道、基础及能源条件；吊装、运输、土建的承担方分别确认。',
  ],
  [
    '人员与复产安排',
    '根据机械、电气、炉衬等工作量明确专业分工和进场安排。',
    '明确停产窗口、现场联系人、试验工件与操作人员。',
  ],
];
export const relocationCostItems: TextItem[] = [
  { title: '检查与技术准备', text: '设备状态检查、缺失资料补测、拆分与改造方案。' },
  { title: '拆装与现场配套', text: '拆装、吊装运输、就位连接及基础能源配套，按各方承担范围列项。' },
  { title: '维修与验证交付', text: '维修更换件、安装调试、必要的烘炉和试验验收，分别核定工作量。' },
];
export const equipmentChecks: TextItem[] = [
  { title: '停机原因与记录', text: '停机原因、最后工况、故障和维修记录。' },
  { title: '基础与钢结构', text: '基础、支撑、连接和搬迁后的定位状态。' },
  { title: '炉衬与密封', text: '炉衬损伤、受潮情况与炉门密封。' },
  { title: '加热与能源系统', text: '加热装置、能源管线与相关保护。' },
  { title: '电气测温与安全联锁', text: '线路绝缘、测温系统与异常保护动作。' },
  { title: '机械传动与循环', text: '传动机构、循环系统及连接状态。' },
];
export const verificationStages: TextItem[] = [
  {
    title: '冷态检查',
    text: '设备未升温时，检查结构、线路、机械动作与安全保护功能。',
    record: '检查与整改记录',
  },
  {
    title: '空载试运行',
    text: '不装生产工件，核对升温、循环、传动及保护动作。',
    record: '空载试运行记录',
  },
  {
    title: '负载验证',
    text: '按约定工件、装载方式和工艺，验证设备及工艺要求。',
    record: '负载试验记录',
  },
];
export const acceptanceRows = [
  ['安全与动作', '适用安全要求及经确认的联锁、保护和机械动作要求', '功能检查记录'],
  ['温度与测温', '约定工况、测定方法及技术要求', '测温与温场记录'],
  ['工件试验', '约定材质、装载、工艺及检测要求', '试验与检测记录'],
];
export const installationRows = [
  ['安装准备', '核对设备布置、基础及能源接口条件。', '提供现场尺寸、基础及能源条件。'],
  ['安装连接', '按约定范围完成安装、连接与检查。', '协调设备进场、通道及吊装条件。'],
  ['调试验证', '单机调试、联动试运行及约定验收项目。', '提供试验工件、操作人员和生产条件。'],
  ['培训交付', '操作维护培训、资料移交与交付确认。', '指定接收人员，参与培训与确认。'],
];
export const deliveryItems: TextItem[] = [
  { title: '设备资料', text: '相关图纸、操作维护说明。' },
  { title: '检查与试运行记录', text: '约定检测项目、试运行及整改记录。' },
  { title: '维护与备件资料', text: '维护要点及适用备件清单。' },
];
export const afterSalesSteps: TextItem[] = [
  { title: '提交现象', text: '发铭牌、故障描述、报警信息及照片。' },
  { title: '技术反馈', text: '核对情况，说明需补充的检查与资料。' },
  { title: '处理安排', text: '先明确远程支持、备件或现场服务的范围与费用，再确认实施安排。' },
  { title: '恢复确认', text: '记录处理结果，确认后续注意事项。' },
];
export const warrantyItems: TextItem[] = [
  {
    title: '质保期内',
    text: '质保期内因设备制造质量或设计缺陷导致的故障，按合同约定提供免费维修或更换服务。',
  },
  { title: '质保期外', text: '维修、备件及改造服务，另行确认范围与费用。' },
];
