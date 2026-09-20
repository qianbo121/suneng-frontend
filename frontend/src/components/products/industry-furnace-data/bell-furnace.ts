import type { FurnacePageConfig } from './types';
import { commonStandards, cutawayCallout, detailImage } from './shared';

export const bellFurnacePageConfig: FurnacePageConfig = {
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
};
