import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import copy from './english-news-search-copy.json';
import translations from '@/lib/english-news-copy.json';
import { englishCaseSearchMetadata, englishNewsSearchMetadata } from './english-search-metadata';
import { buildPageTitle } from './metadata';

describe('search-only English copy', () => {
  it('covers every existing local translation without changing its visible text', () => {
    for (const article of Object.values(translations)) {
      const before = structuredClone(article);
      const result = englishNewsSearchMetadata(article.titleEn, article.summaryEn);
      expect(buildPageTitle(result.title, 'en').length, article.slug).toBeLessThanOrEqual(60);
      expect(result.description.length, article.slug).toBeLessThanOrEqual(160);
      expect(article).toEqual(before);
    }
  });
  it('keeps reviewed titles distinct and complete, including recent CMS-only articles', () => {
    const titles = Object.values(copy).map((value) => value.title);
    expect(new Set(titles).size).toBe(titles.length);
    for (const [title, entry] of Object.entries(copy)) {
      expect(entry.title.length, title).toBeLessThanOrEqual(60);
      expect(entry.title).not.toMatch(/\.\.\.|…$/);
    }
  });
  it('preserves supplied copy for a new or changed article rather than truncating it', () => {
    const title = 'An entirely new article with specific process conditions';
    expect(
      englishNewsSearchMetadata(title, 'Unchanged full summary.', 'Reviewed search title'),
    ).toEqual({
      title: 'Reviewed search title | Suneng',
      description: 'Unchanged full summary.',
    });
  });
  it('uses short copy only in metadata generation, never in the visible article', () => {
    const source = readFileSync(
      new URL('../../app/[locale]/news/[slug]/page.tsx', import.meta.url),
      'utf8',
    );
    const [metadata, visible] = source.split('export default async function NewsDetailPage');
    expect(metadata).toContain('englishNewsSearchMetadata(title, description, article.seoTitleEn)');
    expect(visible).not.toContain('englishNewsSearchMetadata');
    expect(visible).toContain('headline: title');
  });
  it('respects a later CMS title edit even when the visible headline stays the same', () => {
    const headline = Object.keys(copy)[0];
    const result = englishNewsSearchMetadata(
      headline,
      'Current summary.',
      'A newly approved search title',
    );
    expect(result.title).toBe('A newly approved search title | Suneng');
  });
  it('shortens a previously reviewed custom CMS title without overriding later custom edits', () => {
    const headline =
      'How Long Should a Quench Tank Wait Between Batches? Calculating Recovery from the Quenchant Temperature Rise';
    const original = copy[headline].sourceTitle;
    expect(englishNewsSearchMetadata(headline, 'Summary.', original).title).toBe(
      copy[headline].title,
    );
    expect(
      englishNewsSearchMetadata(headline, 'Summary.', 'Updated recovery conditions').title,
    ).toBe('Updated recovery conditions | Suneng');
  });
  it('uses short descriptions only while their reviewed original text still matches', () => {
    for (const [headline, entry] of Object.entries(copy)) {
      if (!('sourceDescription' in entry)) continue;
      expect(englishNewsSearchMetadata(headline, entry.sourceDescription).description).toBe(
        entry.description,
      );
      expect(englishNewsSearchMetadata(headline, 'A newly approved summary.').description).toBe(
        'A newly approved summary.',
      );
    }
  });
  it('preserves a later case summary edit without changing the search title', () => {
    const headline =
      'An 850 mm stainless-steel annealing and pickling line: supply scope for the annealing and solution-treatment section';
    const result = englishCaseSearchMetadata(headline, 'Updated project scope and evidence.');
    expect(result.description).toBe('Updated project scope and evidence.');
    expect(result.title).toBe('Henan Strip Annealing & Solution Section | Suneng');
  });
});
