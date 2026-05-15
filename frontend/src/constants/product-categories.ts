import { LocalizedText } from '@/types/site';

export type ProductCategoryDefinition = {
  id: number;
  key: string;
  slug: string;
  name: LocalizedText;
  image: string;
  model: string;
  showcaseDescription: LocalizedText;
};

export const PRODUCT_CENTER_CATEGORIES: ProductCategoryDefinition[] = [
  {
    id: 9,
    key: 'roller-mesh-belt-line',
    slug: 'roller-mesh-belt-line',
    name: { zh: '托辊型网带式电阻炉生产线', en: 'Roller Mesh Belt Heat Treatment Line' },
    image: '/images/products/roller-mesh-belt-line/gallery/line-01.jpg',
    model: 'SN-LINE-MESH',
    showcaseDescription: {
      zh: '适用于中小型工件连续退火、回火、正火等工艺，适合批量化连续生产。',
      en: 'Continuous roller-supported mesh belt line for batch heat treatment of small and medium workpieces.',
    },
  },
  {
    id: 10,
    key: 'copper-wire-annealing-line',
    slug: 'copper-wire-annealing-line',
    name: { zh: '铜丝自动化退火生产线', en: 'Copper Wire Automatic Annealing Line' },
    image: '/images/products/copper-wire-annealing-line/gallery/line-01.jpg',
    model: 'SN-LINE-COPPER',
    showcaseDescription: {
      zh: '面向铜丝连续退火处理，集放线、加热、冷却、收线于一体。',
      en: 'Automatic production line for continuous copper wire annealing and winding processes.',
    },
  },
  {
    id: 11,
    key: 'annealing-solution-line',
    slug: 'annealing-solution-line',
    name: { zh: '退火固溶生产线', en: 'Annealing and Solution Treatment Line' },
    image: '/images/products/annealing-solution-line/gallery/line-01.jpg',
    model: 'SN-LINE-SOLUTION',
    showcaseDescription: {
      zh: '适用于金属材料退火、固溶等热处理工艺，温区控制精准、升温稳定。',
      en: 'Continuous line for annealing and solution treatment of metal strip and related materials.',
    },
  },
  {
    id: 1,
    key: 'box-furnace',
    slug: 'box-furnace',
    name: { zh: '箱式炉', en: 'Box Furnace' },
    image: '/images/products/box-furnace/gallery/box-01.png',
    model: 'SN-BOX',
    showcaseDescription: {
      zh: '适用于科研实验、小批量零件及模具热处理，控温精确、重复性好。',
      en: 'Compact heat treatment furnace for small and medium workpieces with stable temperature uniformity.',
    },
  },
  {
    id: 2,
    key: 'trolley-furnace',
    slug: 'trolley-furnace',
    name: { zh: '台车炉', en: 'Trolley Furnace' },
    image: '/images/products/trolley-furnace/gallery/trolley-01.png',
    model: 'SN-TROLLEY',
    showcaseDescription: {
      zh: '适合大型零件、模具及轴类件热处理，炉膛尺寸和控温系统可定制。',
      en: 'Designed for large workpieces with strong loading capacity and efficient operation.',
    },
  },
  {
    id: 3,
    key: 'pit-furnace',
    slug: 'pit-furnace',
    name: { zh: '井式炉', en: 'Pit Furnace' },
    image: '/images/products/pit-furnace/gallery/pit-01.png',
    model: 'SN-PIT',
    showcaseDescription: {
      zh: '适用于零件、模具及长轴类工件热处理，占地紧凑、炉温均匀。',
      en: 'Vertical furnace for shaft and rod parts, offering stable control and compact footprint.',
    },
  },
  {
    id: 4,
    key: 'bell-furnace',
    slug: 'bell-furnace',
    name: { zh: '罩式炉', en: 'Bell Furnace' },
    image: '/images/products/bell-furnace/gallery/bell-01.png',
    model: 'SN-BELL',
    showcaseDescription: {
      zh: '适用于小型零件、模具及五金件热处理，炉体紧凑、运行稳定。',
      en: 'Bell furnace for protective-atmosphere heat treatment with stable and efficient performance.',
    },
  },
  {
    id: 5,
    key: 'pusher-furnace',
    slug: 'pusher-furnace',
    name: { zh: '推杆炉', en: 'Pusher Furnace' },
    image: '/images/products/pusher-furnace/gallery/pusher-01.png',
    model: 'SN-PUSHER',
    showcaseDescription: {
      zh: '适用于零件、五金件及模具连续热处理，匹配生产线节拍。',
      en: 'Continuous furnace for batch production with stable rhythm and automation.',
    },
  },
  {
    id: 6,
    key: 'mesh-belt-furnace',
    slug: 'mesh-belt-furnace',
    name: { zh: '网带炉', en: 'Mesh Belt Furnace' },
    image: '/images/products/mesh-belt-furnace/gallery/mesh-01.png',
    model: 'SN-MESH',
    showcaseDescription: {
      zh: '适用于小件零件、五金件连续热处理，适配流水线批量生产。',
      en: 'Continuous mesh belt furnace for small parts and scaled production.',
    },
  },
  {
    id: 7,
    key: 'roller-hearth-furnace',
    slug: 'roller-hearth-furnace',
    name: { zh: '辊底炉', en: 'Roller Hearth Furnace' },
    image: '/images/products/roller-hearth-furnace/gallery/roller-01.png',
    model: 'SN-ROLLER',
    showcaseDescription: {
      zh: '适用于钢材板材、条材等连续热处理，适合中大型工业生产。',
      en: 'Roller hearth furnace for continuous heating with stable loading and precise zones.',
    },
  },
  {
    id: 8,
    key: 'rotary-hearth-furnace',
    slug: 'rotary-hearth-furnace',
    name: { zh: '转底炉', en: 'Rotary Hearth Furnace' },
    image: '/images/products/rotary-hearth-furnace/gallery/rotary-01.png',
    model: 'SN-ROTARY',
    showcaseDescription: {
      zh: '适用于模具、五金零件和航空零件热处理，旋转底部实现均匀加热。',
      en: 'Rotary hearth furnace for rhythmic heating and compact production layouts.',
    },
  },
];

export const PRODUCT_CENTER_CATEGORY_NAMES_ZH = PRODUCT_CENTER_CATEGORIES.map((item) => item.name.zh);
