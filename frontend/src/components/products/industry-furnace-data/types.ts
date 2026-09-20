import type { FurnaceCutawayCallout } from '../FurnaceCutawayDiagram';

export type IndustryFurnaceSlug =
  | 'box-furnace'
  | 'trolley-furnace'
  | 'bell-furnace'
  | 'mesh-belt-furnace'
  | 'pusher-furnace'
  | 'roller-hearth-furnace'
  | 'rotary-hearth-furnace';

export type FurnaceImage = {
  src: string;
  alt: string;
  caption: string;
  unoptimized?: boolean;
};

type OptionGroup = {
  title: string;
  options: string[];
};

type Solution = {
  title: string;
  image?: string;
  alt?: string;
  eyebrow: string;
  text: string;
  suitable: string;
  advantage: string;
  verify: string;
  noPromise: string;
};

export type FurnacePageConfig = {
  slug: IndustryFurnaceSlug;
  name: string;
  englishName: string;
  title: string;
  description: string;
  gallery: FurnaceImage[];
  tags: string[];
  heroInfo: Array<[string, string]>;
  productProperties: Array<{ name: string; value: string }>;
  heroNotice: string;
  workpieces: Array<{
    status: string;
    tone: 'positive' | 'caution';
    title: string;
    text: string;
  }>;
  suitableConditions: string[];
  requiredConditions: string[];
  workpieceWarning: string;
  optionGroups: OptionGroup[];
  solutions: Solution[];
  equations: Array<[string, string, string]>;
  boundaryImage: FurnaceImage;
  boundaryFacts: Array<[string, string]>;
  requiredData: Array<[string, string]>;
  standards: Array<{ group: string; items: string[] }>;
  structureImage: FurnaceImage;
  structureCallouts: FurnaceCutawayCallout[];
  structureParameters: Array<[string, string]>;
  structureSystems: Array<[string, string]>;
  faqs: Array<{ question: string; answer: string }>;
  related: Array<{
    title: string;
    image: string;
    alt: string;
    text: string;
    href: string;
  }>;
};
