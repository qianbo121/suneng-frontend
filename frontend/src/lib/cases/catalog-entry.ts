import 'server-only';
import entries from './catalog-entries.json';

export function caseCatalogEntry(slug: string, locale: 'zh' | 'en') {
  if (!Object.hasOwn(entries, slug)) return undefined;
  const item = entries[slug as keyof typeof entries];
  return { title: item[locale].title, cover: { src: item.src, alt: item[locale].alt, fit: 'contain' as const } };
}
