import type { Locale } from '@/types/site';

export type AboutSearchParams = Record<string, string | string[] | undefined>;

export function getAboutSectionHref(locale: Locale, section: 'qualifications' | 'projects' | 'contact' | 'management-systems', params: AboutSearchParams = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
    else if (value !== undefined) query.set(key, value);
  }
  const search = query.toString();
  return `/${locale}/about${search ? `?${search}` : ''}#${section}`;
}
