import type { FurnaceCutawayCallout, FurnaceCutawayLabelPosition } from '../FurnaceCutawayDiagram';
import type { IndustryFurnaceSlug } from './types';

export const commonStandards = {
  effectiveZone: ['GB/T 9452-2023'],
  resistance: ['GB/T 10067.1-2019', 'GB/T 10067.4-2005', 'GB/T 10066.4-2004'],
  resistanceSafety: [
    'GB/T 5959.1-2019（仅适用于电热装置）',
    'GB 5959.4-2008（仅适用于电阻加热装置）',
  ],
  generalSafety: ['GB/T 37752.1-2019', 'GB/T 5226.1-2019'],
  burnerReference: ['GB/T 19839-2025（仅作为工业燃油燃气燃烧器参考）'],
} as const;

const relatedArticles = [
  ['工业炉报价需要哪些参数', '/zh/articles/gongye-lu-baojia-canshu'],
  ['热处理炉厂家选择时应核对哪些能力边界', '/zh/solutions/rechuli-lu-changjia'],
  ['旧炉维修、节能改造或控制系统升级', '/zh/service/furnace-renovation-overhaul'],
] as const;

export { relatedArticles };

type DetailImageRole =
  | 'main'
  | 'loading'
  | 'lining'
  | 'processLine'
  | 'gas'
  | 'control'
  | 'cutaway';

const detailImageFiles: Record<DetailImageRole, string> = {
  main: '01-main-scene.png',
  loading: '02-loading.png',
  lining: '03-lining-heating.png',
  processLine: '04-process-line.png',
  gas: '05-gas-fired.png',
  control: '06-control-record.png',
  cutaway: '07-structural-cutaway.png',
};

const trolleyReviewedImages: Record<DetailImageRole, string> = {
  main: '/images/products/trolley-furnace/reviewed-20260909/01-main-scene-b7225c291e71.png',
  loading: '/images/products/trolley-furnace/reviewed-20260909/02-loading-61638c6894bd.png',
  lining: '/images/products/trolley-furnace/reviewed-20260909/03-lining-heating-6a88eed493f6.png',
  processLine:
    '/images/products/trolley-furnace/reviewed-20260909/04-process-line-51580f06f2bc.png',
  gas: '/images/products/trolley-furnace/reviewed-20260909/05-gas-fired-9b785c9d8906.png',
  control: '/images/products/trolley-furnace/reviewed-20260909/06-control-record-511a4a755888.png',
  cutaway:
    '/images/products/trolley-furnace/reviewed-20260909/07-structural-cutaway-fa39c7cd6ff0.png',
};

export const detailImage = (slug: IndustryFurnaceSlug, role: DetailImageRole) =>
  slug === 'trolley-furnace'
    ? trolleyReviewedImages[role]
    : `/images/products/${slug}/detail/${detailImageFiles[role]}`;

const calloutLineOrigins: Record<
  FurnaceCutawayLabelPosition,
  Pick<FurnaceCutawayCallout['line'], 'x1' | 'y1'>
> = {
  leftTop: { x1: 21, y1: 15 },
  leftMiddle: { x1: 21, y1: 31 },
  leftBottom: { x1: 21, y1: 43 },
  rightTop: { x1: 79, y1: 17 },
  rightMiddle: { x1: 79, y1: 41 },
  rightBottom: { x1: 79, y1: 53 },
};

export const cutawayCallout = (
  position: FurnaceCutawayLabelPosition,
  target: string,
  label: string,
  x2: number,
  y2: number,
): FurnaceCutawayCallout => ({
  position,
  target,
  label,
  line: { ...calloutLineOrigins[position], x2, y2 },
});
