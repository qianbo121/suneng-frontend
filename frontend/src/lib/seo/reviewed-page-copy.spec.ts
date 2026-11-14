import { describe, expect, it } from 'vitest';
import revisions from './reviewed-page-copy.json';
import { getReviewedPageCopy } from './reviewed-page-copy';
import { buildMetadata } from './metadata';

describe('reviewed page search copy', () => {
  const copy = revisions as Record<string, { title?: { source: string; value: string }; description?: { source: string; value: string } }>;

  it.each([
    ['trolley-furnace', '台车炉厂家'],
    ['mesh-belt-furnace', '网带炉厂家'],
    ['roller-hearth-furnace', '辊底炉厂家'],
    ['rotary-hearth-furnace', '转底炉厂家'],
  ])('retains the manufacturer search phrase for %s', (slug, phrase) => {
    expect(copy[`/zh/products/detail/${slug}`].title?.value).toContain(phrase);
  });

  it('retains recommendation and comparison questions wherever the reviewed Chinese source used them', () => {
    for (const [path, revision] of Object.entries(copy)) {
      if (!path.startsWith('/zh/') || !revision.title) continue;
      for (const phrase of ['哪家好', '推荐', '多少钱', '网带调质线']) {
        if (revision.title.source.includes(phrase)) {
          expect(revision.title.value, path).toContain(phrase);
        }
      }
    }
  });

  it('keeps the standard number and both editions in the version-selection question', () => {
    const title = copy['/zh/news/gb-t-30825-2026-heat-treatment-furnace-procurement'].title!.value;
    for (const phrase of ['GB/T 30825', '2014版还是2026版']) expect(title).toContain(phrase);
  });

  it('retains full brand suffixes in every reviewed title', () => {
    for (const [path, revision] of Object.entries(copy)) {
      if (!revision.title) continue;
      expect(revision.title.value, path).toMatch(path.startsWith('/zh/') ? /｜苏能工业炉$/ : / \| Suneng Industrial Furnace$/);
    }
  });

  it('keeps proposal parameters distinct from production and acceptance results', () => {
    const description = copy['/zh/case/henan-annealing-solution-line'].description!.value;
    expect(description).toContain('方案参数不代表实际产量或验收结果');
  });

  it('retains no-load trials, tempering ranges and the shared quench tank', () => {
    expect(copy['/en/service/furnace-relocation-restart'].description!.value).toContain('no-load and loaded trials');
    expect(copy['/en/products/detail/fastener-quench-temper-line'].description!.value).toContain('high-temperature tempering');
    expect(copy['/en/products/detail/mesh-belt-carbonitriding-line'].description!.value).toContain('low-temperature tempering');
    expect(copy['/en/products/detail/multi-furnace-quench-cell'].description!.value).toContain('share a manipulator and quench tank');
  });

  it('only replaces the exact reviewed route and source field', () => {
    const path = '/zh/articles/special-industrial-furnace-procurement-assessment';
    const revision = revisions[path];
    expect(getReviewedPageCopy(path, revision.title.source, 'New description')).toEqual({
      title: revision.title.value,
      description: 'New description',
    });
    expect(getReviewedPageCopy(path, 'A later editorial title', 'New description')).toEqual({
      title: 'A later editorial title', description: 'New description',
    });
    expect(getReviewedPageCopy(`${path}/another-page`, revision.title.source, 'Unchanged')).toEqual({
      title: revision.title.source, description: 'Unchanged',
    });
  });

  it('preserves later description edits independently of title edits', () => {
    const path = '/en/articles/special-industrial-furnace-procurement-assessment';
    const revision = revisions[path];
    expect(getReviewedPageCopy(path, 'New title', revision.description.source)).toEqual({
      title: 'New title', description: revision.description.value,
    });
    expect(getReviewedPageCopy(path, revision.title.source, 'New description')).toEqual({
      title: revision.title.value, description: 'New description',
    });
  });

  it('uses the reviewed copy in search and sharing without changing URL or language links', () => {
    const path = '/en/articles/special-industrial-furnace-procurement-assessment';
    const revision = revisions[path];
    const metadata = buildMetadata({
      title: revision.title.source,
      description: revision.description.source,
      path, locale: 'en',
      alternateLocales: { 'en-US': path, 'zh-CN': path.replace('/en/', '/zh/') },
    });
    expect(metadata.title).toEqual({ absolute: revision.title.value });
    expect(metadata.description).toBe(revision.description.value);
    expect(metadata.openGraph).toMatchObject({ title: revision.title.value, description: revision.description.value });
    expect(metadata.twitter).toMatchObject({ title: revision.title.value, description: revision.description.value });
    expect(metadata.alternates?.canonical).toBe(`https://www.jssngyl.cn${path}`);
    expect(metadata.alternates?.languages?.['en-US']).toBe(`https://www.jssngyl.cn${path}`);
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });
});
