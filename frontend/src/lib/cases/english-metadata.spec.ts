import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({ ...(await original<typeof import('react')>()), cache: (fn: unknown) => fn }));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NEXT_NOT_FOUND'); } }));
import { englishCaseMetadata } from '@/components/case-studies/EnglishCasePages';
import { getEnglishCase } from './english';
import { buildNewsListMetadata, getNewsListDocumentTitles } from '../news-list-metadata';

describe('English search copy', () => {
  it('uses concise case metadata while retaining the full heading and evidence conditions', () => {
    const slug = 'stainless-strip-annealing-supply-scope';
    const item = getEnglishCase(slug)!;
    const metadata = englishCaseMetadata(slug);
    expect(item.title).toBe('Stainless steel strip annealing: Suneng supplied the furnace and cooling equipment');
    expect(item.summary).toContain('not actual output or acceptance results');
    expect(metadata.title).toEqual({ absolute: 'Furnace and cooling equipment for stainless strip annealing | Suneng Industrial Furnace' });
    expect(metadata.description).toBe(item.seoDescription);
    expect(metadata.openGraph).toMatchObject({ publishedTime: '2026-09-18T01:00:00+08:00', modifiedTime: '2026-11-17' });
    expect(metadata.description).toContain('not verified output or acceptance results');
    expect(metadata.openGraph).toMatchObject({ title: 'Furnace and cooling equipment for stainless strip annealing | Suneng Industrial Furnace', description: item.seoDescription });
    expect(metadata.alternates?.languages).toHaveProperty('zh-CN');
    expect(() => englishCaseMetadata('not-approved')).toThrow('NEXT_NOT_FOUND');
  });
  it('keeps list server metadata and client pagination titles consistent', () => {
    const client = getNewsListDocumentTitles('en', 3);
    for (let page = 1; page <= 3; page++) {
      const metadata = buildNewsListMetadata('en', page, false);
      expect(metadata.title).toEqual({ absolute: client.pageTitles[page - 1] });
      expect(client.pageTitles[page - 1]).toContain('Industrial Furnace Resources | Suneng');
    }
    const filtered = buildNewsListMetadata('en', 1, true);
    expect(filtered.title).toEqual({ absolute: client.filteredTitle });
    expect(filtered.robots).toEqual({ index: false, follow: true });
  });
});
