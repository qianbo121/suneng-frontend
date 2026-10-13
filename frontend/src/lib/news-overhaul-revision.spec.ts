import { describe, expect, it } from 'vitest';
import source from '../../tests/fixtures/news-overhaul-source-20261013.json';
import translations from './english-news-copy.json';
import type { NewsApiItem } from '@/types/news';
import { applyReviewedNewsCopy } from './news-reviewed-copy';
import { applyEnglishNewsCopy } from './english-news';
import { getNewsContentModifiedTime } from './news-dates';

const original = source as NewsApiItem;

describe('approved overhaul revision', () => {
  it('keeps the existing English supplement available after the Chinese revision', async () => {
    const reviewed = await applyReviewedNewsCopy(original);
    expect(reviewed.contentZh).not.toBe(original.contentZh);
    const result = await applyEnglishNewsCopy(reviewed);
    expect(result.contentEn).toBe(translations['22'].contentEn);
    expect(result.titleEn).toBe(translations['22'].titleEn);
    expect(getNewsContentModifiedTime(result, 'en')).toBe(translations['22'].translatedAt);
    for (const key of ['slug', 'publishDate', 'coverImage', 'id'] as const) {
      expect(result[key]).toBe(original[key]);
    }
  });

  it('lets a later source edit win and never restores an offline article', async () => {
    for (const item of [
      { ...original, contentZh: '<p>Later editorial revision</p>' },
      { ...original, status: 'offline' as const, isPublished: false },
    ]) {
      expect(await applyReviewedNewsCopy(item)).toBe(item);
      expect(await applyEnglishNewsCopy(item)).toBe(item);
    }
  });
});
