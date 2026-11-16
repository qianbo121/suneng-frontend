import { createHash } from 'node:crypto';
import { expect, it } from 'vitest';
import legacySources from '../../tests/fixtures/news-migration-public-sources-20260910.json';
import sourceFields from '../../tests/fixtures/english-news-chinese-source-fields.json';
import translations from './english-news-copy.json';
import sourceIndex from './english-news-index.json';
import reviews from './news-reviewed-copy.json';

const fields = ['titleZh', 'summaryZh', 'contentZh', 'seoTitleZh', 'seoDescriptionZh'] as const;
type Source = Partial<Record<typeof fields[number], string | null>>;
const supplementalSources: Record<string, Source> = sourceFields;
const reviewedCopies: Record<string, Source & { slug: string; sourceFingerprint: string }> = reviews;
const rawIndex: Record<string, { slug: string; rawSourceFingerprint: string }> = sourceIndex;

// Use the current reviewed fields directly. Only fields supplied by the CMS
// are frozen in fixtures, so editing reviewed Chinese text exercises this test.
it.each(Object.entries(translations))('matches English supplement %s to its approved Chinese source', (id, copy) => {
  const raw = supplementalSources[id] ?? legacySources.find(item => String(item.id) === id);
  const index = rawIndex[id];
  expect(index.slug).toBe(copy.slug);
  const revision = reviewedCopies[id];
  const usesReviewedCopy = revision && revision.sourceFingerprint === index.rawSourceFingerprint;
  let source: Source | undefined = raw;
  if (usesReviewedCopy) {
    expect(revision.slug).toBe(copy.slug);
    source = { ...raw, ...revision, seoTitleZh: revision.titleZh ?? raw?.seoTitleZh };
  }
  for (const key of fields) expect(source, `${id}: missing source field ${key}`).toHaveProperty(key);
  const serialized = JSON.stringify(fields.map(key => source?.[key] ?? null));
  const actual = createHash('sha256').update(serialized).digest('hex');
  if (!usesReviewedCopy) expect(actual).toBe(index.rawSourceFingerprint);
  expect(actual).toBe(copy.sourceFingerprint);
});
