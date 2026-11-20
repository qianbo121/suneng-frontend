import 'server-only';
import entries from './catalog-entries.json';

type Cover = { src: string; alt: string; fit?: 'contain' | 'cover' };
export function caseCatalogCover(slug: string, locale: 'zh' | 'en', fallback?: Cover): Cover | undefined {
  if (!Object.hasOwn(entries, slug)) return fallback;
  const item = entries[slug as keyof typeof entries];
  const picture = item[locale];
  if (!picture) return undefined;
  return { src: 'src' in picture ? picture.src : item.src, alt: picture.alt, fit: 'contain' };
}
