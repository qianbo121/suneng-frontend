import { describe, expect, it, vi } from 'vitest';
import type { NewsApiItem } from '@/types/news';
import originalSources from '../../tests/fixtures/news-migration-public-sources-20260910.json';
import revisions from './news-reviewed-copy.json';
import translations from './english-news-copy.json';
import { applyEnglishNewsCopy } from './english-news';
import { applyNewsReferenceCleanup } from './news-reference-cleanup';
import { getNewsDetail, getNewsList } from './api/news';
import { safeApiGet } from './api/client';

vi.mock('./api/client', () => ({ safeApiGet: vi.fn() }));

const ids = [20, 22, 23, 24, 25, 26, 27, 29, 30];
const targetUrl = 'https://www.jssngyl.cn/zh/case/anonymous-tsingshan-1250-renovation';
const expectedBlock = (id: number) => id === 20
  ? `<p>完整案例可参考：</p><p>${targetUrl}</p>`
  : `<p>某不锈钢企业 1250mm 三线节能改造案例：${targetUrl}</p>`;

function reviewedItem(id: number): NewsApiItem {
  const revision = revisions[String(id) as keyof typeof revisions];
  const titleZh = 'titleZh' in revision ? revision.titleZh : '';
  return {
    id, categoryId: 1, publishDate: '2026-09-01', status: 'published', isPublished: true,
    slug: revision.slug,
    titleZh,
    seoTitleZh: titleZh,
    summaryZh: revision.summaryZh,
    seoDescriptionZh: revision.seoDescriptionZh,
    contentZh: revision.contentZh,
  };
}

describe('approved Chinese news reference cleanup', () => {
  it.each(ids)('preserves cleaned copy and removes only a reintroduced legacy block: %i', (id) => {
    const reviewed = reviewedItem(id);
    expect(reviewed.contentZh).not.toContain(targetUrl);
    expect(applyNewsReferenceCleanup(reviewed)).toBe(reviewed);
    const block = expectedBlock(id);
    // The reviewed source is now clean; a later CMS copy may still carry the old block.
    const before = reviewed.contentZh!.replace('</p>', `</p>${block}`);
    const item = { ...reviewed, contentZh: before };
    expect(before.split(block)).toHaveLength(2);
    const start = before.indexOf(block);
    const result = applyNewsReferenceCleanup(item);
    expect(result).toEqual({ ...item, contentZh: before.slice(0, start) + before.slice(start + block.length) });
    expect(result).toEqual(reviewed);
    expect(result.contentZh).not.toContain(targetUrl);
    expect(item.contentZh).toBe(before);
    expect(applyNewsReferenceCleanup(result)).toBe(result);
    if (id === 20) expect(result.contentZh).not.toContain('<p>完整案例可参考：</p>');
  });

  it.each(ids)('keeps the real English overlay and all English fields for article %i', async (id) => {
    const translated = await applyEnglishNewsCopy(reviewedItem(id));
    const expected = translations[String(id) as keyof typeof translations];
    expect(translated.contentEn).toBe(expected.contentEn);
    expect(translated.titleEn).toBe(expected.titleEn);
    const result = applyNewsReferenceCleanup(translated);
    expect(result).toEqual({ ...translated, contentZh: translated.contentZh!.replace(expectedBlock(id), '') });
  });

  it('does not touch article 21 or a different article identity', () => {
    const excluded = reviewedItem(21);
    expect(excluded.contentZh).toContain('/zh/case/anonymous-tsingshan-1250-renovation');
    expect(excluded.contentZh).toContain('/zh/case/jining-support-roller-heat-treatment-line');
    expect(applyNewsReferenceCleanup(excluded)).toBe(excluded);
    for (const change of [{ id: 999999 }, { slug: 'changed-after-publication' }]) {
      const item = { ...reviewedItem(20), ...change };
      expect(applyNewsReferenceCleanup(item)).toBe(item);
    }
  });

  it.each([
    { status: 'offline' as const }, { status: 'draft' as const },
    { isPublished: false }, { isPublished: undefined }, { contentZh: null },
  ])('leaves unavailable or nonpublic content untouched: %j', (change) => {
    const item = { ...reviewedItem(20), ...change };
    expect(applyNewsReferenceCleanup(item)).toBe(item);
  });

  it.each([20, 23])('preserves later CMS changes except an unchanged exact reference block: %i', (id) => {
    const item = reviewedItem(id);
    const block = expectedBlock(id);
    const laterCopy = `<p>后来增加的正文。</p>${block}<p>独立的新结论。</p>`;
    expect(applyNewsReferenceCleanup({ ...item, contentZh: laterCopy }).contentZh)
      .toBe('<p>后来增加的正文。</p><p>独立的新结论。</p>');
    for (const contentZh of [
      laterCopy.replace('<p>', '<p class="new-format">').replace(block, block.replace('<p>', '<p class="new-reference">')),
      laterCopy.replace(targetUrl, `${targetUrl}?revised=1`),
      laterCopy.replace(block, block.replace('</p>', ' 新增说明</p>')),
      '<p>后来已自行删除引用的正文。</p>',
    ]) {
      const newer = { ...item, contentZh };
      expect(applyNewsReferenceCleanup(newer)).toBe(newer);
    }
  });

  it('cleans list and detail consistently after both real Chinese and English overlays', async () => {
    const original20 = originalSources.find((item) => item.id === 20) as NewsApiItem;
    const items = ids.map((id) => id === 20 ? original20 : reviewedItem(id));
    vi.mocked(safeApiGet).mockResolvedValueOnce({
      data: { items, page: 1, pageSize: 10, total: items.length }, error: null,
    });
    const list = await getNewsList();
    for (const [index, source] of items.entries()) {
      vi.mocked(safeApiGet).mockResolvedValueOnce({ data: source, error: null });
      const detail = await getNewsDetail(source.slug);
      const expectedChinese = reviewedItem(source.id).contentZh!.replace(expectedBlock(source.id), '');
      const expectedEnglish = translations[String(source.id) as keyof typeof translations];
      expect(detail.data?.contentZh).toBe(expectedChinese);
      expect(detail.data?.contentEn).toBe(expectedEnglish.contentEn);
      expect(detail.data?.titleEn).toBe(expectedEnglish.titleEn);
      expect(list.data?.items[index]).toEqual(detail.data);
    }
    expect(original20.contentZh).toContain(targetUrl);
  });
});
