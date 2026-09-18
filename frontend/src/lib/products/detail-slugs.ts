/**
 * Every slug that /products/detail/<slug> resolves to.
 *
 * Middleware needs this to refuse unknown slugs with a real 404, and the
 * product catalogue behind generateStaticParams is ~174 KB — far too large for
 * the middleware bundle. So the slugs are listed here, and detail-slugs.spec.ts
 * asserts the list still equals what the catalogue produces: adding a product
 * without listing it fails that test instead of silently 404ing its own page.
 *
 * Chinese-only production lines are included. Refusing /en/* for those is
 * ZH_ONLY_PATHS' job, not this module's.
 */
export const PRODUCT_DETAIL_SLUGS: ReadonlySet<string> = new Set([
  'annealing-solution-line',
  'bell-furnace',
  'box-furnace',
  'copper-wire-annealing-line',
  'elevator-hearth-furnace',
  'gas-nitriding-furnace',
  'mesh-belt-furnace',
  'pit-furnace',
  'pusher-furnace',
  'roller-hearth-furnace',
  'roller-mesh-belt-line',
  'rotary-hearth-furnace',
  'shovel-furnace',
  'trolley-furnace',
  'walking-beam-furnace',
  'aluminum-forging-heating-line',
  'aluminum-solution-aging-line',
  'cylinder-curing-line',
  'fastener-quench-temper-line',
  'forging-waste-heat-qt-line',
  'mesh-belt-carbonitriding-line',
  'multi-furnace-quench-cell',
  'track-shoe-press-quench-line',
]);

// Exactly one segment after /detail: nested routes such as the inquiry
// checklist keep their own handling.
const DETAIL_PATH = /^\/(?:zh|en)\/products\/detail\/([^/]+)\/?$/i;

/** True for a /products/detail/<slug> address no product answers. */
export function isUnknownProductDetailPath(pathname: string): boolean {
  const slug = pathname.match(DETAIL_PATH)?.[1];
  return slug !== undefined && !PRODUCT_DETAIL_SLUGS.has(slug);
}
