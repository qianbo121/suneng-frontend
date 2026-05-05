import { pinyin } from 'pinyin-pro';

export function slugifyText(input: string, fallback = 'item') {
  const normalized = pinyin(input, {
    toneType: 'none',
    type: 'array',
    nonZh: 'consecutive',
  })
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return normalized || `${fallback}-${Date.now()}`;
}
