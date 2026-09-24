import translations from './core-page-translations-en.json';
import lineTranslations from './production-line-translations-en.json';
import serviceTranslations from '@/components/service-pages/service-translations-en.json';
import type { Locale } from '@/types/site';

const copy: Record<string, string> = { ...serviceTranslations, ...lineTranslations, ...translations };

// Keep IDs, geometry and asset paths unchanged; translate current source text and routes.
export function corePageText(text: string, locale: Locale): string {
  if (locale !== 'en') return text;
  return (copy[text] ?? text).replace(/^\/zh(?=\/|$)/, '/en');
}
export function localizeCoreValue<T>(value: T, locale: Locale): T {
  if (locale !== 'en') return value;
  if (typeof value === 'string') return corePageText(value, locale) as T;
  if (Array.isArray(value)) return value.map((item) => localizeCoreValue(item, locale)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localizeCoreValue(item, locale)])) as T;
  }
  return value;
}
