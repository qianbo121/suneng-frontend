import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  cache: (fn: unknown) => fn,
}));
const override = vi.hoisted(() => ({ records: undefined as unknown[] | undefined }));
vi.mock('./query', async (original) => {
  const actual = await original<typeof import('./query')>();
  return {
    ...actual,
    filterCases: (...args: Parameters<typeof actual.filterCases>) =>
      actual.filterCases((override.records as typeof args[0] | undefined) ?? args[0], args[1]),
  };
});
import { getCaseResults, readCaseDirectory } from './server';
import { parseCaseQuery } from './query';
// A retired draft kept only as a test fixture. It lives outside content/cases
// so the case reader can never publish it, and it exercises the two-furnace
// summary rewriting that no surviving case happens to contain.
import comparison from './__fixtures__/list-presentation-case.json';

describe('case list wording', () => {
  it('rewrites list summaries on the server before cards reach the browser', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'suneng-case-summary-'));
    try {
      // A published copy of the draft that needs its list summary rewritten.
      fs.writeFileSync(
        path.join(directory, 'case.json'),
        JSON.stringify({ ...comparison, publicationStatus: 'published' }),
      );
      override.records = readCaseDirectory(directory, () => ({ html: '', toc: [], plainText: '' }));
      const [card] = getCaseResults(parseCaseQuery({})).items;
      expect(card.id).toBe(comparison.id);
      expect(card.summary).not.toBe(comparison.summary);
      expect(card.summary).toContain('棒料斜底加热炉采用端进侧出');
      expect(card.summary).toContain('板卷罩式退火炉采用行车装料');
    } finally {
      override.records = undefined;
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
});
