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
const danglingGuidance = '历史方案如何划分改造范围，以及能源测算有哪些条件，可参考某不锈钢企业的连续退火/退洗线节能改造案例（见文末）。';
const expectedBlock = (id: number) => id === 20
  ? `<p>完整案例可参考：</p><p>${targetUrl}</p>`
  : `<p>某不锈钢企业 1250mm 三线节能改造案例：${targetUrl}</p>`;

function expectedChineseContent(id: number, contentZh: string): string {
  const cleanedReference = contentZh.replace(expectedBlock(id), '');
  return id === 26 ? cleanedReference.replace(danglingGuidance, '') : cleanedReference;
}

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
  it.each(ids)('removes only the approved block and guidance from the full reviewed article %i', (id) => {
    const item = reviewedItem(id);
    const before = item.contentZh!;
    const block = expectedBlock(id);
    expect(before.split(block)).toHaveLength(2);
    const result = applyNewsReferenceCleanup(item);
    expect(result).toEqual({ ...item, contentZh: expectedChineseContent(id, before) });
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
    expect(result).toEqual({ ...translated, contentZh: expectedChineseContent(id, translated.contentZh!) });
  });

  it('removes article 26’s exact guidance while retaining the adjacent conditions and fields', () => {
    const item = {
      ...reviewedItem(26),
      contentEn: '<p>The English text stays unchanged.</p>',
      sourceFingerprint: 'unchanged-source-fingerprint',
    };
    const before = item.contentZh!;
    expect(before.split(danglingGuidance)).toHaveLength(2);
    const result = applyNewsReferenceCleanup(item);
    expect(result).toEqual({ ...item, contentZh: expectedChineseContent(26, before) });
    expect(result.contentZh).not.toContain(danglingGuidance);
    expect(result.contentZh).toContain('先做能耗诊断（搞清损失主要在哪）');
    expect(result.contentZh).toContain('具体能省多少，要用你的炉型、工况和运行数据测算，不能脱离实际工况承诺固定比例。');
    expect(applyNewsReferenceCleanup(result)).toBe(result);
    expect(item.contentZh).toBe(before);
  });

  it('keeps the guidance for a different identity, nonpublic state or later wording', () => {
    const guidanceOnly = { ...reviewedItem(26), contentZh: `<p>${danglingGuidance}</p>` };
    for (const change of [
      { id: 999999 }, { slug: 'changed-after-publication' },
      { status: 'draft' as const }, { status: 'offline' as const },
      { isPublished: false }, { isPublished: undefined },
      { contentZh: `<p>${danglingGuidance.replace('可参考', '可以参考')}</p>` },
    ]) {
      const item = { ...guidanceOnly, ...change };
      expect(applyNewsReferenceCleanup(item)).toBe(item);
    }
    const otherApprovedArticle = { ...reviewedItem(23), contentZh: guidanceOnly.contentZh };
    expect(applyNewsReferenceCleanup(otherApprovedArticle)).toBe(otherApprovedArticle);
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
      const expectedChinese = expectedChineseContent(source.id, reviewedItem(source.id).contentZh!);
      const expectedEnglish = translations[String(source.id) as keyof typeof translations];
      expect(detail.data?.contentZh).toBe(expectedChinese);
      expect(detail.data?.contentEn).toBe(expectedEnglish.contentEn);
      expect(detail.data?.titleEn).toBe(expectedEnglish.titleEn);
      expect(list.data?.items[index]).toEqual(detail.data);
    }
    expect(original20.contentZh).toContain(targetUrl);
  });
});
