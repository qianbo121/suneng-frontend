import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import type { NewsEntity } from '@/types/news';

import {
  buildNewsCreatePayload,
  buildNewsUpdatePayload,
  NewsContentProtectionError,
  resolveNewsInitialValues,
} from './news-form-data';

const record: NewsEntity = {
  id: 99029,
  categoryId: 4,
  titleZh: '原始标题',
  titleEn: 'Original title',
  summaryZh: '人工摘要',
  summaryEn: 'English summary',
  contentZh: '<p>正文第一行</p><figure><img src="/kept.webp"></figure><p>第二行</p>',
  contentEn: '<p>English content</p>',
  coverImage: '/cover.webp',
  publishDate: '2026-08-30T08:00:00.000Z',
  viewCount: 19,
  slug: 'original-slug',
  isPublished: true,
  status: 'published',
  seoTitleZh: '定制搜索标题',
  seoTitleEn: 'Custom SEO title',
  seoDescriptionZh: '定制搜索说明',
  seoDescriptionEn: 'Custom description',
  seoKeywordsZh: '定制关键词',
  seoKeywordsEn: 'Custom keywords',
  ogImage: '/custom-og.webp',
  sortOrder: 8,
  baiduSubmittedAt: '2026-08-31T08:00:00.000Z',
  contentUpdatedAt: '2026-08-31T09:00:00.000Z',
  createdAt: '2026-08-01T08:00:00.000Z',
  updatedAt: '2026-08-31T09:00:00.000Z',
};

describe('simple news form data', () => {
  it('sends no article fields when an existing record is saved without edits', () => {
    const values = resolveNewsInitialValues(record);

    expect(buildNewsUpdatePayload(values, record)).toEqual({});
  });

  it('updates an unbound plain-text article without overwriting hidden CMS fields', () => {
    const plainRecord = { ...record, titleEn: null, contentEn: null, contentZh: '<p>原正文</p>' };
    const values = {
      ...resolveNewsInitialValues(plainRecord),
      titleZh: '修改后的标题',
      contentZh: '改后的正文',
      publishDate: dayjs('2026-09-01T08:00:00.000Z'),
    };

    const payload = buildNewsUpdatePayload(values, plainRecord);

    expect(payload).toEqual({
      titleZh: '修改后的标题',
      contentZh: '<p>改后的正文</p>',
      publishDate: '2026-09-01T08:00:00.000Z',
    });
    expect(payload).not.toHaveProperty('categoryId');
    expect(payload).not.toHaveProperty('titleEn');
    expect(payload).not.toHaveProperty('slug');
    expect(payload).not.toHaveProperty('sortOrder');
    expect(payload).not.toHaveProperty('seoKeywordsZh');
    expect(payload).not.toHaveProperty('isPublished');
  });

  it.each([73, 76])('blocks stale CMS text edits to reviewed article %i before a save', (id) => {
    const source = { ...record, id, titleEn: null, contentEn: null };
    for (const change of [{ titleZh: '改一个标题字' }, { contentZh: '改一个正文字' }]) {
      expect(() =>
        buildNewsUpdatePayload({ ...resolveNewsInitialValues(source), ...change }, source),
      ).toThrow(NewsContentProtectionError);
    }
  });

  it('does not silently invalidate a native English counterpart', () => {
    expect(() =>
      buildNewsUpdatePayload({ ...resolveNewsInitialValues(record), titleZh: '新标题' }, record),
    ).toThrow('英文版');
  });

  it.each(['h2', 'img', 'a', 'table', 'ul', 'strong'])(
    'does not flatten existing %s markup',
    (tag) => {
      const rich = {
        ...record,
        titleEn: null,
        contentEn: null,
        contentZh: `<${tag}>原正文</${tag}>`,
      };
      expect(() =>
        buildNewsUpdatePayload({ ...resolveNewsInitialValues(rich), contentZh: '新正文' }, rich),
      ).toThrow('纯文字保存会丢失');
    },
  );

  it('still permits a no-op or a cover-only change without touching reviewed/bilingual text', () => {
    const reviewed = { ...record, id: 76 };
    expect(buildNewsUpdatePayload(resolveNewsInitialValues(reviewed), reviewed)).toEqual({});
    expect(
      buildNewsUpdatePayload(
        { ...resolveNewsInitialValues(reviewed), coverImage: '/new.webp' },
        reviewed,
      ),
    ).toEqual({ coverImage: '/new.webp' });
  });

  it('still generates complete defaults for a new article', () => {
    const payload = buildNewsCreatePayload({
      titleZh: '新文章',
      coverImage: '/new-cover.webp',
      contentZh: '第一行\n第二行',
      publishDate: dayjs('2026-09-01T10:00:00.000Z'),
      status: 'published',
    });

    expect(payload).toMatchObject({
      titleZh: '新文章',
      coverImage: '/new-cover.webp',
      contentZh: '<p>第一行</p><p>第二行</p>',
      summaryZh: '第一行\n第二行',
      seoTitleZh: '新文章',
      seoDescriptionZh: '第一行\n第二行',
      ogImage: '/new-cover.webp',
      sortOrder: 0,
      isPublished: true,
    });
  });
});
