import { DEFAULT_KEYWORDS, EN_DEFAULT_KEYWORDS, EN_PAGE_KEYWORDS, PAGE_KEYWORDS } from '@/lib/seo/keyword-data';

const KEYWORD_SPLIT_PATTERN = /[，,、;；\n\r]+/;

export function normalizeKeywords(value?: string | string[] | null) {
  const rawItems = Array.isArray(value) ? value : value ? value.split(KEYWORD_SPLIT_PATTERN) : [];

  return rawItems
    .map((item) => item.trim())
    .filter(Boolean);
}

export function mergeKeywords(...groups: Array<string[] | undefined>) {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const group of groups) {
    for (const keyword of group || []) {
      const normalized = keyword.trim();
      const key = normalized.toLowerCase();

      if (!normalized || seen.has(key)) continue;

      seen.add(key);
      merged.push(normalized);
    }
  }

  return merged;
}

type KeywordLocale = 'zh' | 'en';

export function buildKeywords(pageKey?: string, keywords?: string | string[] | null, locale: KeywordLocale = 'zh') {
  const pageKeywords = pageKey ? (locale === 'en' ? EN_PAGE_KEYWORDS[pageKey] : PAGE_KEYWORDS[pageKey]) : undefined;
  const defaultKeywords = locale === 'en' ? EN_DEFAULT_KEYWORDS : DEFAULT_KEYWORDS;

  return mergeKeywords(normalizeKeywords(keywords), pageKeywords, defaultKeywords).slice(0, 8);
}
