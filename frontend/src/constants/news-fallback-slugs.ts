// These routes intentionally keep serving bundled fallback content even when
// the CMS does not have a matching row. Keep this lightweight list separate
// so the request middleware does not bundle every fallback article body.
export const FALLBACK_NEWS_SLUGS = new Set([
  'company-delivery-batch-1',
  'large-trolley-furnace-delivery',
  'industry-technology-exchange',
  'intelligent-control-system-upgrade',
  'equipment-upgrade-production-stability',
  'international-heat-treatment-expo',
  'industrial-furnace-maintenance-sharing',
]);
