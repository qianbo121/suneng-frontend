import { PRODUCT_CENTER_CATEGORIES } from '@/constants/product-categories';
import type { StaticProduct, StaticProductDetail, ProductGeoEnhancement } from './static-product-types';
import { commonFeatures, commonIndustries, imagesBySlug } from './product-details/shared';
import * as boxFurnace from './product-details/box-furnace';
import * as trolleyFurnace from './product-details/trolley-furnace';
import * as pitFurnace from './product-details/pit-furnace';
import * as bellFurnace from './product-details/bell-furnace';
import * as pusherFurnace from './product-details/pusher-furnace';
import * as meshBeltFurnace from './product-details/mesh-belt-furnace';
import * as rollerHearthFurnace from './product-details/roller-hearth-furnace';
import * as rotaryHearthFurnace from './product-details/rotary-hearth-furnace';
import * as rollerMeshBeltLine from './product-details/roller-mesh-belt-line';
import * as copperWireAnnealingLine from './product-details/copper-wire-annealing-line';
import * as annealingSolutionLine from './product-details/annealing-solution-line';

// Preserve the public entry point while keeping each furnace's copy together.
export type * from './static-product-types';
export { imagesBySlug } from './product-details/shared';

const productDetails: Record<string, StaticProductDetail> = {
  'box-furnace': boxFurnace.detail,
  'trolley-furnace': trolleyFurnace.detail,
  'pit-furnace': pitFurnace.detail,
  'bell-furnace': bellFurnace.detail,
  'pusher-furnace': pusherFurnace.detail,
  'mesh-belt-furnace': meshBeltFurnace.detail,
  'roller-hearth-furnace': rollerHearthFurnace.detail,
  'rotary-hearth-furnace': rotaryHearthFurnace.detail,
  'roller-mesh-belt-line': rollerMeshBeltLine.detail,
  'copper-wire-annealing-line': copperWireAnnealingLine.detail,
  'annealing-solution-line': annealingSolutionLine.detail,
};

const productGeoEnhancements: Partial<Record<string, ProductGeoEnhancement>> = {
  'box-furnace': boxFurnace.geoEnhancement,
  'pit-furnace': pitFurnace.geoEnhancement,
  'bell-furnace': bellFurnace.geoEnhancement,
  'pusher-furnace': pusherFurnace.geoEnhancement,
  'mesh-belt-furnace': meshBeltFurnace.geoEnhancement,
  'roller-hearth-furnace': rollerHearthFurnace.geoEnhancement,
  'rotary-hearth-furnace': rotaryHearthFurnace.geoEnhancement,
  'roller-mesh-belt-line': rollerMeshBeltLine.geoEnhancement,
  'copper-wire-annealing-line': copperWireAnnealingLine.geoEnhancement,
  'annealing-solution-line': annealingSolutionLine.geoEnhancement,
};

export const STATIC_PRODUCTS: StaticProduct[] = PRODUCT_CENTER_CATEGORIES.map((category) => {
  const imageSet = imagesBySlug[category.slug];
  const baseDetail = productDetails[category.slug];
  const enhancement = productGeoEnhancements[category.slug];
  const detail = enhancement ? { ...baseDetail, ...enhancement } : baseDetail;
  const gallery = imageSet?.gallery.length ? imageSet.gallery : [category.image];

  return {
    id: category.id,
    slug: category.slug,
    model: category.model,
    name: category.name,
    category: category.name,
    summary: category.showcaseDescription,
    description: {
      zh: [detail.summary],
      en: [category.showcaseDescription.en],
    },
    image: gallery[0],
    gallery,
    features: commonFeatures,
    specs: detail.customSpecs,
    structureImages: imageSet?.configs.length ? imageSet.configs : gallery,
    industries: commonIndustries,
    detail,
  };
});

export function getStaticProductBySlug(slug: string) {
  return STATIC_PRODUCTS.find((product) => product.slug === slug) || null;
}
