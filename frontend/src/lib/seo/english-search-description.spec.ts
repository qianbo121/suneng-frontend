import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import descriptions from './english-search-descriptions.json';
import { englishNewsSearchDescription } from './english-search-description';

describe('search-only English descriptions', () => {
  it('uses complete short descriptions only for the exact reviewed source', () => {
    for (const [title, copy] of Object.entries(descriptions)) {
      expect(englishNewsSearchDescription(title, copy.sourceDescription)).toBe(copy.description);
      expect(copy.description.length).toBeLessThanOrEqual(160);
      expect(copy.description).not.toMatch(/\.\.\.|…$/);
      expect(englishNewsSearchDescription(title, 'Newly approved summary.')).toBe(
        'Newly approved summary.',
      );
      expect(englishNewsSearchDescription('Changed title', copy.sourceDescription)).toBe(
        copy.sourceDescription,
      );
    }
  });
  it('does not change article display or replace the main title resolver', () => {
    const source = readFileSync(
      new URL('../../app/[locale]/news/[slug]/page.tsx', import.meta.url),
      'utf8',
    );
    const [metadata, visible] = source.split('export default async function NewsDetailPage');
    expect(metadata).toContain('await getNewsSeoTitle(currentLocale, article)');
    expect(metadata).toContain(
      'englishNewsSearchDescription(article.titleEn || article.titleZh, description)',
    );
    expect(visible).not.toContain('englishNewsSearchDescription');
    expect(visible).toContain('headline: title');
  });
});
