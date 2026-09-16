import { getAdditionalFurnace } from './additional-furnaces';
import productionLineHeroImages from './production-line-hero-images.json';
import { PRODUCT_CENTER_CATEGORIES } from '@/constants/product-categories';
import { homeProductionLines, homeSingleFurnaces } from '@/lib/home-product-types';
import { getChineseProductCenterDisplayName } from '@/lib/product-center-display-names';
import { getHeatTreatmentLine } from '@/lib/heat-treatment-lines';

type FurnaceCardCopy = {
  workpiece: string;
  handling: string;
  description: string;
  fieldLabel: '装炉方式' | '输送方式';
  fieldValue: string;
};

const productCategoryBySlug = new Map(
  PRODUCT_CENTER_CATEGORIES.map((product) => [product.slug, product]),
);
const homeProductionLineBySlug = new Map(
  homeProductionLines.map((product) => [product.id, product]),
);

function getProductCategory(slug: string) {
  const product = productCategoryBySlug.get(slug);
  if (!product) {
    throw new Error(`Missing product category for ${slug}`);
  }
  return product;
}

const productCenterPlaceholderProductionLines = [
  // TODO(图片): 占位图，待替换为实拍
  {
    id: 'track-shoe-press-quench-line',
    name: '履带板压淬生产线',
    title: '履带板压淬生产线',
    image: '/images/products/track-shoe-press-quench-line/gallery/line-01.jpg',
    imageAlt: '履带板压淬生产线设备',
    imagePosition: 'center',
    applicable: '单/双/三筋履带板等底盘件，10~120 kg',
    summary: '燃气辊底加热 · 三工位压淬 · 电加热回火',
    steps: ['机器人上料', '辊底加热', '三工位压淬', '辊底回火', '出料检测'],
    accentSteps: ['辊底加热', '三工位压淬'],
    typicalTemperature: 900,
    minimumTemperature: 0,
    maximumTemperature: 1300,
    detailStatus: 'placeholder',
  },
  // TODO(图片): 占位图，待替换为实拍
  {
    id: 'forging-waste-heat-qt-line',
    name: '锻件余热调质生产线',
    title: '锻件余热调质生产线',
    image: '/images/products/forging-waste-heat-qt-line/gallery/line-01.jpg',
    imageAlt: '锻件余热调质生产线设备',
    imagePosition: 'center',
    applicable: '链轨节等中小锻件，10~44 kg',
    summary: '连锻造线余热 · 网带淬火 · 网带回火',
    steps: ['锻造余热接入', '控温输送', '机器人上料', '网带淬火加热', '淬火', '网带回火', '下料'],
    accentSteps: ['控温输送', '网带淬火加热'],
    typicalTemperature: 860,
    minimumTemperature: 0,
    maximumTemperature: 1300,
    detailStatus: 'placeholder',
  },
  // TODO(图片): 占位图，待替换为实拍
  {
    id: 'fastener-quench-temper-line',
    name: '紧固件调质生产线',
    title: '紧固件调质生产线',
    image: '/images/products/fastener-quench-temper-line/gallery/line-01.jpg',
    imageAlt: '紧固件调质生产线设备',
    imagePosition: 'center',
    applicable: '高强度螺栓、螺母等紧固件 M16~M72',
    summary: '可控气氛多用炉 · 油淬 · 回火快冷',
    steps: ['装料', '多用炉加热', '前室油淬', '清洗', '回火', '回火后快冷'],
    accentSteps: ['多用炉加热', '前室油淬'],
    typicalTemperature: 860,
    minimumTemperature: 0,
    maximumTemperature: 1300,
    detailStatus: 'placeholder',
  },
  // TODO(图片): 占位图，待替换为实拍
  {
    id: 'mesh-belt-carbonitriding-line',
    name: '网带式渗碳淬火生产线',
    title: '网带式渗碳淬火生产线',
    image: '/images/products/mesh-belt-carbonitriding-line/gallery/line-01.jpg',
    imageAlt: '网带式渗碳淬火生产线设备',
    imagePosition: 'center',
    applicable: '自攻螺钉、自钻螺钉等小型标准件',
    summary: '碳氮共渗 · 油淬 · 清洗回火',
    steps: ['振动上料', '共渗加热', '油淬', '清洗', '网带回火', '收料'],
    accentSteps: ['共渗加热', '油淬'],
    typicalTemperature: 880,
    minimumTemperature: 0,
    maximumTemperature: 1300,
    detailStatus: 'placeholder',
  },
  // TODO(图片): 占位图，待替换为实拍
  {
    id: 'multi-furnace-quench-cell',
    name: '多炉共用操作机淬火单元',
    title: '多炉共用操作机淬火单元',
    image: '/images/products/multi-furnace-quench-cell/gallery/line-01.jpg',
    imageAlt: '多炉共用操作机淬火单元设备',
    imagePosition: 'center',
    applicable: '5 t 级大型工件、模具与结构件',
    summary: '多台箱式炉 · 轨道操作机 · 共用水槽',
    steps: ['料盘装料', '操作机装炉', '箱式加热', '操作机转运', '入水淬火', '出料'],
    accentSteps: ['操作机转运', '入水淬火'],
    typicalTemperature: 1000,
    minimumTemperature: 0,
    maximumTemperature: 1300,
    detailStatus: 'placeholder',
  },
  // TODO(图片): 占位图，待替换为实拍
  {
    id: 'aluminum-solution-aging-line',
    name: '铝合金固溶时效生产线',
    title: '铝合金固溶时效生产线',
    image: '/images/products/aluminum-solution-aging-line/gallery/line-01.jpg',
    imageAlt: '铝合金固溶时效生产线设备',
    imagePosition: 'center',
    applicable: '铝/镁合金锻件、铸件与气瓶',
    summary: '立式固溶 · 快速水淬 · 时效',
    steps: ['料框装料', '立式固溶加热', '底开门落料水淬', '沥水转运', '时效', '出料'],
    accentSteps: ['立式固溶加热', '底开门落料水淬'],
    typicalTemperature: 530,
    minimumTemperature: 0,
    maximumTemperature: 1300,
    detailStatus: 'placeholder',
  },
  // TODO(图片): 占位图，待替换为实拍
  {
    id: 'aluminum-forging-heating-line',
    name: '铝合金锻造加热生产线',
    title: '铝合金锻造加热生产线',
    image: '/images/products/aluminum-forging-heating-line/gallery/line-01.jpg',
    imageAlt: '铝合金锻造加热生产线设备',
    imagePosition: 'center',
    applicable: '7 系铝合金锻件与 Ø200~500 棒料',
    summary: '链式连续加热 · 多温区保温 · 机器人取件',
    steps: ['自动上料', '链式输送', '多温区加热', '保温均温', '机器人取件送锻'],
    accentSteps: ['多温区加热', '保温均温'],
    typicalTemperature: 450,
    minimumTemperature: 0,
    maximumTemperature: 1300,
    detailStatus: 'placeholder',
  },
  // TODO(图片): 占位图，待替换为实拍
  {
    id: 'cylinder-curing-line',
    name: '缠绕气瓶连续固化生产线',
    title: '缠绕气瓶连续固化生产线',
    image: '/images/products/cylinder-curing-line/gallery/line-01.jpg',
    imageAlt: '缠绕气瓶连续固化生产线设备',
    imagePosition: 'center',
    applicable: 'III / IV 型缠绕气瓶，长度 ≤1200 mm',
    summary: '悬挂链贯通 · 多温区固化 · 带气固化',
    steps: ['挂具上瓶', '悬挂链贯通输送', '升温段', '保温固化平台', '冷却段', '下瓶'],
    accentSteps: ['保温固化平台'],
    typicalTemperature: 150,
    minimumTemperature: 0,
    maximumTemperature: 1300,
    detailStatus: 'placeholder',
  },
] as const;

const publishedProductionLineSlugs = [
  'roller-mesh-belt-line',
  'copper-wire-annealing-line',
  'annealing-solution-line',
] as const;

const publishedProductionLines = publishedProductionLineSlugs.map((slug) => {
  const product = getProductCategory(slug);
  const productionLine = homeProductionLineBySlug.get(slug);
  if (!productionLine) {
    throw new Error(`Missing homepage production-line data for ${slug}`);
  }

  const name = getChineseProductCenterDisplayName(product.slug, product.name.zh);
  return {
    ...productionLine,
    id: product.slug,
    name,
    title: name,
    image: product.image,
    imageAlt: `${name}设备`,
    href: `/zh/products/detail/${product.slug}`,
    detailStatus: 'published' as const,
  };
});

// Short process labels from each reviewed detail's process section.
const productionLineProcess: Record<string, string> = {
  'track-shoe-press-quench-line': '加热 · 模压淬火 · 回火',
  'forging-waste-heat-qt-line': '余热淬火 · 回火',
  'fastener-quench-temper-line': '淬火 · 回火',
  'mesh-belt-carbonitriding-line': '渗碳 · 淬火 · 回火',
  'multi-furnace-quench-cell': '分炉加热 · 转移淬火',
  'aluminum-solution-aging-line': '固溶 · 淬火 · 人工时效',
  'aluminum-forging-heating-line': '分区升温 · 均热 · 出炉测温',
  'cylinder-curing-line': '升温 · 保温固化 · 冷却',
  'roller-mesh-belt-line': '连续退火或已淬火件回火',
  'copper-wire-annealing-line': '连续退火 · 保护冷却',
  'annealing-solution-line': '退火或固溶 · 受控冷却',
};

// Keep the list's applicability wording within the reviewed material/process scope.
const productionLineApplicability: Record<string, string> = {
  'forging-waste-heat-qt-line': '经验证可采用余热淬火的钢锻件',
  'fastener-quench-temper-line': '需淬火与回火的钢制紧固件',
  'roller-mesh-belt-line': '可稳定铺料的中小型钢件',
};

// Complete overview routes, condensed from each detail page rather than its first six stages.
const productionLineFlows: Record<string, { steps: string[]; accentSteps: string[] }> = {
  'track-shoe-press-quench-line': {
    steps: ['上料', '加热', '转移定位', '模压淬火', '回火冷却', '检验'],
    accentSteps: ['模压淬火', '回火冷却'],
  },
  'forging-waste-heat-qt-line': {
    steps: ['锻后测温', '按需均温', '快速转移', '淬火', '回火', '冷却检验'],
    accentSteps: ['淬火', '回火'],
  },
  'fastener-quench-temper-line': {
    steps: ['布料', '气氛加热', '淬火', '清洗', '回火', '冷却'],
    accentSteps: ['淬火', '回火'],
  },
  'mesh-belt-carbonitriding-line': {
    steps: ['前处理', '渗碳扩散', '淬火', '清洗干燥', '回火', '终冷出料'],
    accentSteps: ['渗碳扩散', '淬火'],
  },
  'multi-furnace-quench-cell': {
    steps: ['装炉', '加热保温', '出料排程', '快速转移', '入槽淬火', '出槽交接'],
    accentSteps: ['快速转移', '入槽淬火'],
  },
  'aluminum-solution-aging-line': {
    steps: ['装料', '固溶保温', '快速转移', '淬火', '人工时效', '冷却检验'],
    accentSteps: ['固溶保温', '人工时效'],
  },
  'aluminum-forging-heating-line': {
    steps: ['上料', '分区升温', '均热', '出炉测温', '合格交接', '下游锻压'],
    accentSteps: ['分区升温', '均热'],
  },
  'cylinder-curing-line': {
    steps: ['交接上料', '按需预热', '分区升温', '保温固化', '受控冷却', '下料'],
    accentSteps: ['保温固化'],
  },
  'roller-mesh-belt-line': {
    steps: ['上料布料', '加热', '保温', '受控冷却', '下料', '检验'],
    accentSteps: ['加热', '保温'],
  },
  'copper-wire-annealing-line': {
    steps: ['放线', '导向牵引', '连续退火', '保护冷却', '按需干燥', '收线'],
    accentSteps: ['连续退火'],
  },
  'annealing-solution-line': {
    steps: ['开卷', '前处理', '加热', '保温', '受控冷却', '收卷'],
    accentSteps: ['加热', '保温'],
  },
};

export const productCenterProductionLines = [
  ...productCenterPlaceholderProductionLines,
  ...publishedProductionLines,
].map((card) => {
  const line = getHeatTreatmentLine(card.id);
  if (!line) throw new Error(`Missing reviewed production-line content for ${card.id}`);
  const heroImage = productionLineHeroImages[line.slug as keyof typeof productionLineHeroImages];
  const flow = productionLineFlows[line.slug];
  if (!flow) throw new Error(`Missing production-line overview flow for ${line.slug}`);
  return {
    ...card,
    name: line.cardTitle,
    title: line.cardTitle,
    applicable: productionLineApplicability[line.slug] ?? line.cardApplicable,
    process: productionLineProcess[line.slug],
    compositionHref: `/zh/products/detail/${line.slug}#process`,
    summary: line.cardSummary,
    steps: flow.steps,
    accentSteps: flow.accentSteps,
    image: heroImage.src,
    imageAlt: heroImage.alt,
    imageLabel: '设备场景示意',
    temperatureNote: '温度按工艺确认',
    href: `/zh/products/detail/${line.slug}`,
    detailStatus: 'published' as const,
  };
});

const furnaceCopyBySlug: Record<string, FurnaceCardCopy> = {
  'box-furnace': {
    workpiece: '模具、机械零件等',
    handling: '炉门装卸 · 批次处理',
    description: '从炉门装卸，适合中小型工件、小批量或多品种生产。',
    fieldLabel: '装炉方式',
    fieldValue: '炉门装卸',
  },
  'trolley-furnace': {
    workpiece: '大型铸锻件、焊接件',
    handling: '台车进出 · 炉外装卸',
    description: '台车整体进出炉膛，便于大型、重型工件装卸。',
    fieldLabel: '装炉方式',
    fieldValue: '台车进出',
  },
  'pit-furnace': {
    workpiece: '长轴、杆类工件',
    handling: '垂直吊装 · 竖直装炉',
    description: '工件垂直吊装入炉，适合长轴、杆件等长形工件。',
    fieldLabel: '装炉方式',
    fieldValue: '垂直吊装',
  },
  'bell-furnace': {
    workpiece: '卷材、成垛工件',
    handling: '炉罩升降 · 炉台装料',
    description: '炉罩整体升降，工件留在固定炉台上。',
    fieldLabel: '装炉方式',
    fieldValue: '炉罩升降',
  },
  'mesh-belt-furnace': {
    workpiece: '螺栓、螺钉等中小件',
    handling: '网带输送 · 连续处理',
    description: '工件平铺或散装在网带上连续输送，适合批量稳定的小件。',
    fieldLabel: '输送方式',
    fieldValue: '网带输送',
  },
  'pusher-furnace': {
    workpiece: '适合料盘承载的工件',
    handling: '料盘推进 · 按节拍进出',
    description: '工件装入料盘后按节拍推进，适合不便直接上网带的件。',
    fieldLabel: '输送方式',
    fieldValue: '料盘推进',
  },
  'roller-hearth-furnace': {
    workpiece: '板材、管材及料盘工件',
    handling: '辊道输送 · 按节拍进出',
    description: '工件由辊道连续输送，适合板材、条材及较长规格的工件。',
    fieldLabel: '输送方式',
    fieldValue: '辊道输送',
  },
  'rotary-hearth-furnace': {
    workpiece: '适合炉底承载的坯料',
    handling: '炉底旋转 · 按节拍进出',
    description: '工件随环形炉底转动，可在同一区域完成装料和出料。',
    fieldLabel: '输送方式',
    fieldValue: '炉底旋转',
  },
};

function buildFurnaceCard(slug: string) {
  const addition = getAdditionalFurnace(slug);
  if (addition)
    return {
      id: addition.id,
      name: addition.name,
      animationKind: addition.animationKind,
      image: addition.image,
      imageAlt: addition.imageAlt,
      href: addition.href,
      workpiece: addition.workpiece,
      handling: addition.handling,
      description: addition.summary,
      fieldLabel: addition.group === 'continuous' ? ('输送方式' as const) : ('装炉方式' as const),
      fieldValue: addition.handling,
      imageLabel: '设备结构示意',
    };
  const product = getProductCategory(slug);
  const furnace = homeSingleFurnaces.find((item) => item.id === slug);
  const copy = furnaceCopyBySlug[slug];

  if (!furnace || !copy) {
    throw new Error(`Missing product-center furnace data for ${slug}`);
  }

  return {
    id: product.slug,
    name: getChineseProductCenterDisplayName(product.slug, product.name.zh),
    animationKind: furnace.animationKind,
    image: furnace.image,
    imageAlt: furnace.imageAlt,
    href: `/zh/products/detail/${product.slug}`,
    ...copy,
  };
}

export const periodicFurnaceCards = [
  'box-furnace',
  'trolley-furnace',
  'pit-furnace',
  'bell-furnace',
  'shovel-furnace',
  'elevator-hearth-furnace',
  'gas-nitriding-furnace',
].map(buildFurnaceCard);

export const continuousFurnaceCards = [
  'mesh-belt-furnace',
  'pusher-furnace',
  'roller-hearth-furnace',
  'rotary-hearth-furnace',
  'walking-beam-furnace',
].map(buildFurnaceCard);
