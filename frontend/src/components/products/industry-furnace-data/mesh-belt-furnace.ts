import type { FurnacePageConfig } from './types';
import { commonStandards, cutawayCallout, detailImage } from './shared';

export const meshBeltFurnacePageConfig: FurnacePageConfig = {
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
};
