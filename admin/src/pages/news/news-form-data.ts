import dayjs, { Dayjs } from 'dayjs';

import type { NewsPayload } from '@/services/news';
import type { NewsEntity } from '@/types/news';
import type { PublishStatus } from '@/types/product';
import reviewedCopies from '../../../../frontend/src/lib/news-reviewed-copy.json';
import englishIndex from '../../../../frontend/src/lib/english-news-index.json';

export class NewsContentProtectionError extends Error {}

export type SimpleNewsFormValues = {
  titleZh: string;
  coverImage: string;
  contentZh: string;
  publishDate: Dayjs | null;
  status: PublishStatus;
};

export function stripNewsHtml(value?: string | null) {
  if (!value) return '';
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function toNewsHtmlContent(value: string) {
  const lines = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return '';

  return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('');
}

export function resolveNewsInitialValues(record: NewsEntity | null): SimpleNewsFormValues {
  return {
    titleZh: record?.titleZh || '',
    coverImage: record?.coverImage || '',
    contentZh: stripNewsHtml(record?.contentZh || record?.summaryZh),
    publishDate: record?.publishDate ? dayjs(record.publishDate) : dayjs(),
    status: record?.status || 'published',
  };
}

export function buildNewsCreatePayload(values: SimpleNewsFormValues): NewsPayload {
  const contentText = values.contentZh.trim();
  const summary = contentText.slice(0, 140);
  const title = values.titleZh.trim();
  const coverImage = values.coverImage || undefined;

  return {
    titleZh: title,
    titleEn: undefined,
    slug: undefined,
    coverImage,
    summaryZh: summary || undefined,
    summaryEn: undefined,
    contentZh: toNewsHtmlContent(contentText) || undefined,
    contentEn: undefined,
    publishDate: values.publishDate ? values.publishDate.toISOString() : undefined,
    isPublished: values.status === 'published',
    seoTitleZh: title || undefined,
    seoTitleEn: undefined,
    seoDescriptionZh: summary || undefined,
    seoDescriptionEn: undefined,
    seoKeywordsZh: undefined,
    seoKeywordsEn: undefined,
    ogImage: coverImage,
    sortOrder: 0,
  };
}

export function buildNewsUpdatePayload(
  values: SimpleNewsFormValues,
  record: NewsEntity,
): Partial<NewsPayload> {
  const payload: Partial<NewsPayload> = {};
  const title = values.titleZh.trim();
  const coverImage = values.coverImage || '';
  const contentText = values.contentZh.trim();
  const originalContentText = stripNewsHtml(record.contentZh || record.summaryZh);
  const originalSummary = stripNewsHtml(record.summaryZh);
  const originalDerivedSummary = originalContentText.slice(0, 140);
  const nextSummary = contentText.slice(0, 140);

  const changesTitle = title !== record.titleZh;
  const changesBody = contentText !== originalContentText;
  // This plain-text editor cannot round-trip the public reviewed/bilingual copy.
  // Keep the original source guard; do not save an older CMS draft over it.
  if (
    (changesTitle || changesBody) &&
    (Object.prototype.hasOwnProperty.call(reviewedCopies, String(record.id)) ||
      Object.prototype.hasOwnProperty.call(englishIndex, String(record.id)) ||
      Boolean(record.titleEn?.trim() && stripNewsHtml(record.contentEn)))
  ) {
    throw new NewsContentProtectionError(
      '这篇文章有官网审核稿或英文版，不能用极简编辑覆盖。请走原址双语更新流程，核对正式正文后再同步；本次未保存。',
    );
  }
  if (
    changesBody &&
    /<(?:h[1-6]|img|figure|table|a|ul|ol|blockquote|strong|em|video|iframe)\b/i.test(
      record.contentZh ?? '',
    )
  ) {
    throw new NewsContentProtectionError(
      '原文含标题、图片、链接或其他排版，纯文字保存会丢失这些内容。请使用保留原排版的更新流程；本次未保存。',
    );
  }

  if (title !== record.titleZh) {
    payload.titleZh = title;
    if (!record.seoTitleZh || record.seoTitleZh === record.titleZh) {
      payload.seoTitleZh = title || undefined;
    }
  }

  if (coverImage !== (record.coverImage || '')) {
    payload.coverImage = coverImage || undefined;
    if (!record.ogImage || record.ogImage === record.coverImage) {
      payload.ogImage = coverImage || undefined;
    }
  }

  if (contentText !== originalContentText) {
    payload.contentZh = toNewsHtmlContent(contentText) || undefined;

    if (!record.summaryZh || originalSummary === originalDerivedSummary) {
      payload.summaryZh = nextSummary || undefined;
    }

    if (
      !record.seoDescriptionZh ||
      stripNewsHtml(record.seoDescriptionZh) === originalSummary ||
      stripNewsHtml(record.seoDescriptionZh) === originalDerivedSummary
    ) {
      payload.seoDescriptionZh = nextSummary || undefined;
    }
  }

  const originalPublishTime = record.publishDate ? dayjs(record.publishDate).valueOf() : null;
  const nextPublishTime = values.publishDate?.valueOf() ?? null;
  if (nextPublishTime !== originalPublishTime) {
    payload.publishDate = values.publishDate?.toISOString();
  }

  return payload;
}
