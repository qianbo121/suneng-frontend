import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({ ...(await original<typeof import('react')>()), cache: (fn: unknown) => fn }));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('NEXT_NOT_FOUND'); } }));
import { englishCaseMetadata } from '@/components/case-studies/EnglishCasePages';
import { getEnglishCase } from './english';
import { buildNewsListMetadata, getNewsListDocumentTitles } from '../news-list-metadata';

describe('English search copy', () => {
  it('uses concise case metadata while retaining the full heading and evidence conditions', () => {
    const slug = 'henan-annealing-solution-line';
    const item = getEnglishCase(slug)!;
    const metadata = englishCaseMetadata(slug);
    expect(item.title).toContain('annealing and pickling line');
    expect(item.summary).toContain('not actual output or acceptance results');
    expect(metadata.title).toEqual({ absolute: '850 mm Strip Annealing Supply Scope | Suneng' });
    expect(metadata.description).toBe(item.seoDescription);
    expect(metadata.description).toContain('not verified output or acceptance results');
    expect(metadata.openGraph).toMatchObject({ title: '850 mm Strip Annealing Supply Scope | Suneng', description: item.seoDescription });
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
