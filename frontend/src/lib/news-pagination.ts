import type { Locale } from '@/types/site';

export function normalizeNewsPage(value?: string) {
  const page = Number(value);

  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export function getNewsListCanonicalPath(locale: Locale, page: number) {
  return `/${locale}/news${page > 1 ? `?page=${page}` : ''}`;
}

export function getNewsListPageTitle(baseTitle: string, locale: Locale, page: number) {
  if (page <= 1) return baseTitle;
  return `${baseTitle}${locale === 'en' ? ` — Page ${page}` : `（第 ${page} 页）`}`;
}
