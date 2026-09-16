import { additionalFurnaces } from './additional-furnaces';
import productionLineHeroImages from './production-line-hero-images.json';

export type HomeProductionLine = {
  id: string;
  title: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
  applicable: string;
  summary: string;
  steps: readonly string[];
  accentSteps: readonly string[];
  temperatureNote?: string;
  typicalTemperature: number;
  minimumTemperature: number;
  maximumTemperature: number;
  href: string;
};

export type HomeSingleFurnace = {
  id: string;
  animationKind: FurnaceAnimationKind;
  englishName: string;
  nameEn: string;
  name: string;
  description: string;
  descriptionEn: string;
  image: string;
  imageAlt: string;
  href: string;
};

export type FurnaceAnimationKind =
  | 'box'
  | 'trolley'
  | 'pit'
  | 'bell'
  | 'pusher'
  | 'mesh'
  | 'roller'
  | 'rotary'
  | 'shovel'
  | 'walking'
  | 'elevator'
  | 'nitriding';

export const homeProductionLines = [
  {
    id: 'roller-mesh-belt-line',
    title: '网带式连续退火与回火生产线',
    image: productionLineHeroImages['roller-mesh-belt-line'].src,
    imageAlt: productionLineHeroImages['roller-mesh-belt-line'].alt,
    imagePosition: 'center',
    applicable: '可稳定铺料的中小型钢件',
    summary: '连续退火或已淬火件回火',
    steps: ['上料布料', '加热', '保温', '受控冷却', '下料', '检验'],
    accentSteps: ['加热', '保温'],
    typicalTemperature: 950,
    temperatureNote: '温度按材料与工艺确认',
    minimumTemperature: 0,
    maximumTemperature: 1300,
    href: '/zh/products/detail/roller-mesh-belt-line',
  },
  {
    id: 'copper-wire-annealing-line',
    title: '铜丝连续退火生产线',
    image: productionLineHeroImages['copper-wire-annealing-line'].src,
    imageAlt: productionLineHeroImages['copper-wire-annealing-line'].alt,
    imagePosition: 'center',
    applicable: '铜及适用铜合金线材',
    summary: '连续退火 · 保护冷却',
    steps: ['放线', '导向牵引', '连续退火', '保护冷却', '按需干燥', '收线'],
    accentSteps: ['连续退火'],
    typicalTemperature: 650,
    temperatureNote: '温度按材料与工艺确认',
    minimumTemperature: 0,
    maximumTemperature: 1300,
    href: '/zh/products/detail/copper-wire-annealing-line',
  },
  {
    id: 'annealing-solution-line',
    title: '带材退火与固溶生产线',
    image: productionLineHeroImages['annealing-solution-line'].src,
    imageAlt: productionLineHeroImages['annealing-solution-line'].alt,
    imagePosition: 'center',
    applicable: '不锈钢及适用合金带材',
    summary: '退火或固溶 · 受控冷却',
    steps: ['开卷', '前处理', '加热', '保温', '受控冷却', '收卷'],
    accentSteps: ['加热', '保温'],
    typicalTemperature: 1050,
    temperatureNote: '温度按材料与工艺确认',
    minimumTemperature: 0,
    maximumTemperature: 1300,
    href: '/zh/products/detail/annealing-solution-line',
  },
] as const satisfies readonly HomeProductionLine[];

export const homeSingleFurnaces = [
  {
    id: 'box-furnace',
    animationKind: 'box',
    englishName: 'BOX FURNACE',
    nameEn: 'Box Furnace',
    name: '箱式炉',
    description: '中小型件 · 小批量处理',
    descriptionEn:
      'General heat treatment for small and medium workpieces and short production runs.',
    image: '/images/home/product-center/reviewed-20260909/box-furnace-v1.png',
    imageAlt: '箱式热处理炉设备',
    href: '/zh/products/detail/box-furnace',
  },
  {
    id: 'trolley-furnace',
    animationKind: 'trolley',
    englishName: 'TROLLEY FURNACE',
    nameEn: 'Trolley Furnace',
    name: '台车炉',
    description: '大型重件 · 周期式处理',
    descriptionEn: 'Batch heat treatment for large and heavy workpieces with trolley loading.',
    image: '/images/home/product-center/reviewed-20260909/trolley-furnace-v1.png',
    imageAlt: '台车式热处理炉设备',
    href: '/zh/products/detail/trolley-furnace',
  },
  {
    id: 'pit-furnace',
    animationKind: 'pit',
    englishName: 'PIT FURNACE',
    nameEn: 'Pit Furnace',
    name: '井式炉',
    description: '轴杆长件 · 竖向装炉',
    descriptionEn: 'Vertical heat treatment for shafts, rods and other long workpieces.',
    image: '/images/home/product-center/reviewed-20260909/pit-furnace-v2.png',
    imageAlt: '井式热处理炉设备',
    href: '/zh/products/detail/pit-furnace',
  },
  {
    id: 'bell-furnace',
    animationKind: 'bell',
    englishName: 'BELL FURNACE',
    nameEn: 'Bell Furnace',
    name: '罩式炉',
    description: '卷材线材 · 整体热处理',
    descriptionEn:
      'Batch and protective-atmosphere heat treatment for coils, wire and stacked loads.',
    image: '/images/home/product-center/reviewed-20260909/bell-furnace-v2.png',
    imageAlt: '罩式热处理炉设备',
    href: '/zh/products/detail/bell-furnace',
  },
  {
    id: 'pusher-furnace',
    animationKind: 'pusher',
    englishName: 'PUSHER FURNACE',
    nameEn: 'Pusher Furnace',
    name: '推杆炉',
    description: '批量工件 · 节拍式处理',
    descriptionEn: 'Continuous heat treatment with paced tray or carrier pushing.',
    image: '/images/home/product-center/reviewed-20260909/pusher-furnace-v1.png',
    imageAlt: '推杆式热处理炉设备',
    href: '/zh/products/detail/pusher-furnace',
  },
  {
    id: 'mesh-belt-furnace',
    animationKind: 'mesh',
    englishName: 'MESH BELT FURNACE',
    nameEn: 'Mesh Belt Furnace',
    name: '网带炉',
    description: '小型零件 · 连续处理',
    descriptionEn: 'Continuous annealing and tempering for small parts and standard components.',
    image: '/images/home/product-center/reviewed-20260909/mesh-belt-furnace-v1.png',
    imageAlt: '网带式热处理炉设备',
    href: '/zh/products/detail/mesh-belt-furnace',
  },
  {
    id: 'roller-hearth-furnace',
    animationKind: 'roller',
    englishName: 'ROLLER HEARTH FURNACE',
    nameEn: 'Roller Hearth Furnace',
    name: '辊底炉',
    description: '板材棒材 · 连续输送',
    descriptionEn: 'Continuous roller conveying heat treatment for plates, bars and regular loads.',
    image: '/images/home/product-center/reviewed-20260909/roller-hearth-furnace-v1.png',
    imageAlt: '辊底式热处理炉设备',
    href: '/zh/products/detail/roller-hearth-furnace',
  },
  {
    id: 'rotary-hearth-furnace',
    animationKind: 'rotary',
    englishName: 'ROTARY HEARTH FURNACE',
    nameEn: 'Rotary Hearth Furnace',
    name: '转底炉',
    description: '环形炉底 · 节拍加热',
    descriptionEn: 'Rhythmic and uniform heating on a rotating hearth for compact process flow.',
    image: '/images/home/product-center/reviewed-20260909/rotary-hearth-furnace-v3.png',
    imageAlt: '转底式热处理炉设备',
    href: '/zh/products/detail/rotary-hearth-furnace',
  },
  ...additionalFurnaces,
] as const satisfies readonly HomeSingleFurnace[];
