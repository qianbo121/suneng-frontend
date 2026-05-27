import { DEFAULT_KEYWORDS, PAGE_KEYWORDS } from '@/lib/seo/keyword-data';

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

export function buildKeywords(pageKey?: string, keywords?: string | string[] | null) {
  const pageKeywords = pageKey ? PAGE_KEYWORDS[pageKey] : undefined;

  return mergeKeywords(normalizeKeywords(keywords), pageKeywords, DEFAULT_KEYWORDS).slice(0, 8);
}
