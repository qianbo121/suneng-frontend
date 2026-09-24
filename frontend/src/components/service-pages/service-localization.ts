import translations from './service-translations-en.json';
import type { Locale } from '@/types/site';

export function serviceHref(path: string, locale: Locale) {
  if (locale !== 'en') return path;
  if (path === '/zh/inquiry') return '/en/contact';
  // News translations are independently reviewed; retain the actual Chinese article.
  if (path.startsWith('/zh/news/')) return path;
  return path.replace(/^\/zh(?=\/|$)/, '/en');
}

export function serviceText(text: string, locale: Locale) {
  if (locale !== 'en') return text;
  return serviceHref((translations as Record<string, string>)[text] ?? text, locale);
}

export function localizeServiceContent<T>(value: T, locale: Locale): T {
  if (locale !== 'en') return value;
  if (typeof value === 'string') return serviceText(value, locale) as T;
  if (Array.isArray(value)) return value.map((item) => localizeServiceContent(item, locale)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localizeServiceContent(item, locale)])) as T;
  }
  return value;
}
