import type { FurnacePageConfig } from './types';
import { commonStandards, cutawayCallout, detailImage } from './shared';

export const boxFurnacePageConfig: FurnacePageConfig = {
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
};
