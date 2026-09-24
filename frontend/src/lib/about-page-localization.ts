import translations from './about-page-translations-en.json';
import type { Locale } from '@/types/site';

export function aboutPageText(text: string, locale: Locale): string {
  return locale === 'en' ? (translations as Record<string, string>)[text] ?? text : text;
}
