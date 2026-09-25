import copy from './partner-copy-en.json';
import type { Locale } from '@/types/site';

export function partnerText(text: string, locale: Locale = 'zh') {
  return locale === 'en' ? (copy as Record<string, string>)[text] ?? text : text;
}
