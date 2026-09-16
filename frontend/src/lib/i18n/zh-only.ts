import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import englishCaseSlugs from '@/lib/cases/english-slugs.json';
import type { Locale } from '@/types/site';

/**
 * Pages that exist only in Chinese — their /en/* routes 404 by design (either
 * an app/en/<path>/route.ts stub or a notFound() in the [locale] page). Paths
 * are locale-agnostic (no /zh or /en prefix). Keep in sync with the zh-only
 * entries in app/sitemap.ts.
 */
export const ZH_ONLY_PATHS = new Set<string>([
  '/products/detail/copper-wire-annealing-line/inquiry-checklist',
  '/products/detail/track-shoe-press-quench-line',
  '/products/detail/forging-waste-heat-qt-line',
  '/products/detail/fastener-quench-temper-line',
  '/products/detail/mesh-belt-carbonitriding-line',
  '/products/detail/multi-furnace-quench-cell',
  '/products/detail/aluminum-solution-aging-line',
  '/products/detail/aluminum-forging-heating-line',
  '/products/detail/cylinder-curing-line',
  '/inquiry',
  '/service/furnace-renovation-overhaul',
  '/service/installation-after-sales',
  '/service/furnace-relocation-restart',
  '/articles/gongye-lu-baojia-canshu',
  '/articles/laojiu-rechuli-lu-daxiu-haishi-maixin',
]);

function stripLocale(path: string): string {
  const stripped = path.replace(/^\/(zh|en)(?=\/|$)/, '');
  return stripped === '' ? '/' : stripped;
}

/** True if the path (with or without a locale prefix) is a Chinese-only page. */
export function isZhOnlyPath(path: string): boolean {
  const pathname = stripLocale(path.split(/[?#]/, 1)[0]).replace(/\/+$/, '') || '/';
  // This routing index lists completed English counterparts; the server also
  // checks source publication and fingerprints before serving any English body.
  return ZH_ONLY_PATHS.has(pathname) || (pathname.startsWith('/case/') && !englishCaseSlugs.includes(pathname.slice('/case/'.length)));
}

/**
 * Localize an internal href to the current locale, or return null when the
 * target only exists in Chinese and we are rendering English — so callers can
 * hide the link instead of emitting a /en/* URL that 404s or a /zh/* URL that
 * bounces an English user back into Chinese. External hrefs and in-page anchors
 * are returned unchanged.
 */
export function localizeOrHideHref(rawPath: string, locale: Locale): string | null {
  if (!rawPath.startsWith('/')) {
    return rawPath;
  }
  if (isWithdrawnTechnicalPath(rawPath)) return null;
  const normalized = stripLocale(rawPath);
  if (locale === 'en' && isZhOnlyPath(normalized)) {
    return null;
  }
  return normalized === '/' ? `/${locale}` : `/${locale}${normalized}`;
}
