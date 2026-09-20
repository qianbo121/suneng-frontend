import type { StaticProductGeoSection, StaticProductProcessStep, StaticProductFeature, StaticProductIndustry } from '../static-product-types';

export const commonParameterNote =
  '以上参数为常见配置范围，具体需结合工件尺寸、装炉量、工艺温度、温度均匀性要求、加热方式、生产节拍和现场条件确定，最终以双方确认的技术方案为准。';

export function buildGeoSections(
  applicableText: string,
  processText: string,
  focusItems: string[],
): StaticProductGeoSection[] {
  return [
    { title: '适用工件', text: applicableText },
    { title: '典型工艺', text: processText },
    { title: '选型关注点', items: focusItems },
  ];
}

export const defaultProcessSteps: StaticProductProcessStep[] = [
  { title: '需求沟通', text: '了解工艺及产能需求' },
  { title: '方案确认', text: '提供方案与配置清单' },
  { title: '方案设计', text: '确定结构与技术方案' },
  { title: '制造调试', text: '生产制造与出厂验收' },
  { title: '交付安装', text: '安装调试与售后跟踪' },
];

export const commonFeatures: StaticProductFeature[] = [
  { title: '定制化设计', text: '根据工件尺寸、工艺温度、节拍与产线条件进行非标定制。' },
  { title: '工艺稳定', text: '通过炉体结构、控温系统与热循环设计提升工艺重复性。' },
  { title: '节能高效', text: '优化加热段与保温结构，降低长期运行能耗。' },
  { title: '安全可靠', text: '关键部件与联锁保护按工业连续生产要求配置。' },
];

export const commonIndustries: StaticProductIndustry[] = [
  { title: '汽车零部件', text: '热处理工艺配套' },
  { title: '机械加工', text: '零件与结构件热处理' },
  { title: '模具制造', text: '模具、五金件热处理' },
  { title: '科研院所', text: '实验与工艺验证' },
];

export const imagesBySlug: Record<string, { gallery: string[]; configs: string[] }> = {
  'box-furnace': {
    gallery: [
      '/images/products/box-furnace/gallery/box-01.png',
      '/images/products/box-furnace/gallery/box-02.png',
    ],
    configs: [
      '/images/products/box-furnace/configs/config-01.png',
      '/images/products/box-furnace/configs/config-02.png',
    ],
  },
  'trolley-furnace': {
    gallery: [
      '/images/products/trolley-furnace/gallery/trolley-01.png',
      '/images/products/trolley-furnace/gallery/trolley-02.png',
      '/images/products/trolley-furnace/gallery/trolley-03.png',
    ],
    configs: [
      '/images/products/trolley-furnace/configs/config-01.png',
      '/images/products/trolley-furnace/configs/config-02.png',
      '/images/products/trolley-furnace/configs/config-03.png',
    ],
  },
  'pit-furnace': {
    gallery: [
      '/images/products/pit-furnace/gallery/pit-01.png',
      '/images/products/pit-furnace/gallery/pit-02.png',
      '/images/products/pit-furnace/gallery/pit-03.png',
    ],
    configs: [
      '/images/products/pit-furnace/configs/config-01.png',
      '/images/products/pit-furnace/configs/config-02.png',
      '/images/products/pit-furnace/configs/config-03.png',
    ],
  },
  'bell-furnace': {
    gallery: [
      '/images/products/bell-furnace/gallery/bell-01.png',
      '/images/products/bell-furnace/gallery/bell-02.png',
    ],
    configs: [
      '/images/products/bell-furnace/configs/config-01.png',
      '/images/products/bell-furnace/configs/config-02.png',
    ],
  },
  'pusher-furnace': {
    gallery: [
      '/images/products/pusher-furnace/gallery/pusher-01.png',
      '/images/products/pusher-furnace/gallery/pusher-02.png',
      '/images/products/pusher-furnace/gallery/pusher-03.png',
    ],
    configs: [
      '/images/products/pusher-furnace/configs/config-01.png',
      '/images/products/pusher-furnace/configs/config-02.png',
    ],
  },
  'mesh-belt-furnace': {
    gallery: [
      '/images/products/mesh-belt-furnace/gallery/mesh-01.png',
      '/images/products/mesh-belt-furnace/gallery/mesh-02.png',
      '/images/products/mesh-belt-furnace/gallery/mesh-03.png',
    ],
    configs: [
      '/images/products/mesh-belt-furnace/configs/config-01.png',
      '/images/products/mesh-belt-furnace/configs/config-02.png',
    ],
  },
  'roller-hearth-furnace': {
    gallery: [
      '/images/products/roller-hearth-furnace/gallery/roller-01.png',
      '/images/products/roller-hearth-furnace/gallery/roller-02.png',
      '/images/products/roller-hearth-furnace/gallery/roller-03.png',
    ],
    configs: [
      '/images/products/roller-hearth-furnace/configs/config-01.png',
      '/images/products/roller-hearth-furnace/configs/config-02.png',
    ],
  },
  'rotary-hearth-furnace': {
    gallery: [
      '/images/products/rotary-hearth-furnace/gallery/rotary-01.png',
      '/images/products/rotary-hearth-furnace/gallery/rotary-02.png',
    ],
    configs: [
      '/images/products/rotary-hearth-furnace/configs/config-01.png',
      '/images/products/rotary-hearth-furnace/configs/config-02.png',
    ],
  },
  'roller-mesh-belt-line': {
    gallery: [
      '/images/products/roller-mesh-belt-line/gallery/line-01.jpg',
      '/images/products/roller-mesh-belt-line/gallery/line-02.png',
    ],
    configs: [
      '/images/products/roller-mesh-belt-line/configs/config-01.png',
      '/images/products/roller-mesh-belt-line/configs/config-02.png',
    ],
  },
  'copper-wire-annealing-line': {
    gallery: [
      '/images/products/copper-wire-annealing-line/gallery/line-01.jpg',
      '/images/products/copper-wire-annealing-line/gallery/line-02.png',
    ],
    configs: [
      '/images/products/copper-wire-annealing-line/configs/config-01.png',
      '/images/products/copper-wire-annealing-line/configs/config-02.png',
    ],
  },
  'annealing-solution-line': {
    gallery: [
      '/images/products/annealing-solution-line/gallery/line-01.jpg',
      '/images/products/annealing-solution-line/gallery/line-02.png',
    ],
    configs: [
      '/images/products/annealing-solution-line/configs/config-01.png',
      '/images/products/annealing-solution-line/configs/config-02.png',
    ],
  },
};
