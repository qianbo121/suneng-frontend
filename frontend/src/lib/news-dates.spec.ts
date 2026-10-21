import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getNewsContentModifiedTime } from './news-dates';

const article = {
  publishDate: '2026-10-05T11:28:54.133Z',
  contentUpdatedAt: '2026-10-10T07:11:23Z',
};

describe('article attribution revision dates', () => {
  beforeEach(() => vi.useFakeTimers().setSystemTime(new Date('2026-10-21T16:00:00Z')));
  afterEach(() => vi.useRealTimers());

  it.each(['zh', 'en'] as const)('backfills the shared byline revision for old %s articles', (locale) => {
    const source = Object.freeze({ ...article, englishContentUpdatedAt: '2026-10-08T09:00:00Z' });
    expect(getNewsContentModifiedTime(source, locale)).toBe('2026-10-19T13:53:16Z');
    expect(source.publishDate).toBe(article.publishDate);
    expect(source.contentUpdatedAt).toBe(article.contentUpdatedAt);
  });

  it('also records the revision when the original article had only a publication date', () => {
    expect(getNewsContentModifiedTime({ publishDate: article.publishDate })).toBe('2026-10-19T13:53:16Z');
  });

  it('preserves later content changes independently in each language', () => {
    const source = {
      ...article,
      contentUpdatedAt: '2026-10-20T08:00:00Z',
      englishContentUpdatedAt: '2026-10-20T10:00:00Z',
    };
    expect(getNewsContentModifiedTime(source, 'zh')).toBe(source.contentUpdatedAt);
    expect(getNewsContentModifiedTime(source, 'en')).toBe(source.englishContentUpdatedAt);
  });

  it('keeps articles published after the byline revision at their own publication date', () => {
    const source = { publishDate: '2026-10-20T08:00:00Z' };
    expect(getNewsContentModifiedTime(source)).toBe(source.publishDate);
  });

  it.each(['not-a-date', '2999-01-01T00:00:00Z'])('does not replace an invalid or future source date: %s', (date) => {
    expect(getNewsContentModifiedTime({ ...article, contentUpdatedAt: date })).toBeUndefined();
  });

  it('does not advertise a future attribution revision', () => {
    vi.setSystemTime(new Date('2026-10-18T00:00:00Z'));
    expect(getNewsContentModifiedTime(article)).toBe(article.contentUpdatedAt);
  });

  it('keeps missing articles without a revision date', () => {
    expect(getNewsContentModifiedTime()).toBeUndefined();
    expect(getNewsContentModifiedTime(null)).toBeUndefined();
  });
});
