import { describe, expect, it, vi } from 'vitest';

// No approvals: a JSON file marked published must still stay private.
vi.mock('./public-case-allowlist', () => ({
  REVIEWED_PUBLIC_CASES: [],
  PUBLIC_CASE_SLUGS: new Set<string>(),
  PUBLIC_ENGLISH_CASE_SLUGS: new Set<string>(),
}));
vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({ ...(await original<typeof import('react')>()), cache: (fn: unknown) => fn }));

import fs from 'node:fs';
import path from 'node:path';
import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import { getLocalizedNavigation } from '@/mock/navigation';
import { getCaseResults, getPublicCases } from './server';
import { getEnglishCaseResults, getEnglishCases } from './english';
import { parseCaseQuery } from './query';

describe('no approved cases', () => {
  it('hides published source files from every loader and search', () => {
    const henan = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content/cases/henan-annealing-solution.json'), 'utf8'));
    expect(henan.publicationStatus).toBe('published');
    expect(getPublicCases()).toEqual([]);
    expect(getEnglishCases()).toEqual([]);
    expect(getCaseResults(parseCaseQuery({})).total).toBe(0);
    expect(getEnglishCaseResults(parseCaseQuery({})).total).toBe(0);
  });

  it('withdraws the case hub in both languages and removes it from navigation', () => {
    for (const locale of ['zh', 'en'] as const) {
      expect(isWithdrawnTechnicalPath(`/${locale}/case`)).toBe(true);
      expect(getLocalizedNavigation(locale).some((item) => item.key === 'cases')).toBe(false);
    }
  });
});
