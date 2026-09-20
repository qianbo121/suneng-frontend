import detail0 from './product-details-en/box-furnace';
import detail1 from './product-details-en/trolley-furnace';
import detail2 from './product-details-en/pit-furnace';
import detail3 from './product-details-en/bell-furnace';
import detail4 from './product-details-en/pusher-furnace';
import detail5 from './product-details-en/mesh-belt-furnace';
import detail6 from './product-details-en/roller-hearth-furnace';
import detail7 from './product-details-en/rotary-hearth-furnace';
import detail8 from './product-details-en/roller-mesh-belt-line';
import detail9 from './product-details-en/copper-wire-annealing-line';
import detail10 from './product-details-en/annealing-solution-line';
// English overrides are maintained per product under product-details-en/.
// Each entry is a Partial<StaticProductDetail>; missing fields fall back to the
// Chinese source at render time via pickDetail(). The Chinese source of truth
// lives in constants/static-products.ts; this registry preserves the public API.
import type { StaticProductDetail } from '@/constants/static-products';
import type { Locale } from '@/types/site';

export type ProductDetailEnOverride = Partial<StaticProductDetail>;

export const productDetailEn: Partial<Record<string, ProductDetailEnOverride>> = {
  'box-furnace': detail0,
  'trolley-furnace': detail1,
  'pit-furnace': detail2,
  'bell-furnace': detail3,
  'pusher-furnace': detail4,
  'mesh-belt-furnace': detail5,
  'roller-hearth-furnace': detail6,
  'rotary-hearth-furnace': detail7,
  'roller-mesh-belt-line': detail8,
  'copper-wire-annealing-line': detail9,
  'annealing-solution-line': detail10,
};

export function getProductDetailEn(slug: string): ProductDetailEnOverride | undefined {
  return productDetailEn[slug];
}

// en fields override zh; any field absent in `en` falls back to zh (whole-field, not deep-merge).
export function pickDetail(
  zh: StaticProductDetail,
  en: ProductDetailEnOverride | undefined,
  locale: Locale,
): StaticProductDetail {
  if (locale !== 'en' || !en) return zh;
  return { ...zh, ...en };
}
