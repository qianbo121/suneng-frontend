import type { FurnacePageConfig, IndustryFurnaceSlug } from './industry-furnace-data/types';
import { boxFurnacePageConfig } from './industry-furnace-data/box-furnace';
import { trolleyFurnacePageConfig } from './industry-furnace-data/trolley-furnace';
import { bellFurnacePageConfig } from './industry-furnace-data/bell-furnace';
import { meshBeltFurnacePageConfig } from './industry-furnace-data/mesh-belt-furnace';
import { pusherFurnacePageConfig } from './industry-furnace-data/pusher-furnace';
import { rollerHearthFurnacePageConfig } from './industry-furnace-data/roller-hearth-furnace';
import { rotaryHearthFurnacePageConfig } from './industry-furnace-data/rotary-hearth-furnace';

export type { FurnaceImage, IndustryFurnaceSlug } from './industry-furnace-data/types';
export { relatedArticles } from './industry-furnace-data/shared';

export const industryFurnacePageConfigs: Record<IndustryFurnaceSlug, FurnacePageConfig> = {
  'box-furnace': boxFurnacePageConfig,
  'trolley-furnace': trolleyFurnacePageConfig,
  'bell-furnace': bellFurnacePageConfig,
  'mesh-belt-furnace': meshBeltFurnacePageConfig,
  'pusher-furnace': pusherFurnacePageConfig,
  'roller-hearth-furnace': rollerHearthFurnacePageConfig,
  'rotary-hearth-furnace': rotaryHearthFurnacePageConfig,
};

export function isIndustryFurnaceSlug(slug: string): slug is IndustryFurnaceSlug {
  return slug in industryFurnacePageConfigs;
}
