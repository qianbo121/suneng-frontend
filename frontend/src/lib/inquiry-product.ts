import { additionalFurnaces } from '@/lib/additional-furnaces';
import type { Locale } from '@/types/site';

// Only known catalogue entries may prefill a form. Keep earlier name-based links working.
export function resolveInquiryProduct(value: string | string[] | undefined, locale: Locale) {
  if (typeof value !== 'string') return undefined;
  const lookupValue = value === '铲齿炉' ? 'shovel-furnace' : value;
  const furnace = additionalFurnaces.find(
    (item) => item.id === lookupValue || item.name === lookupValue || item.nameEn === lookupValue,
  );
  return furnace ? (locale === 'en' ? furnace.nameEn : furnace.name) : undefined;
}
