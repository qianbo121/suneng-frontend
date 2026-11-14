import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('react', async original => ({ ...(await original<typeof import('react')>()), cache: (fn: unknown) => fn }));
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

describe('approved Chinese fastener case', () => {
  it.each(['production', 'test', 'development'])('opens the approved case once in %s', async env => {
    vi.stubEnv('NODE_ENV', env);
    vi.resetModules();
    const entry = await import('./fastener-case-entry');
    const { getPublicCases, getCaseResults } = await import('./server');
    const { isWithdrawnTechnicalPath, isHiddenCaseEntry } = await import('../publication-scope');
    const { parseCaseQuery } = await import('./query');
    expect(entry.fastenerCasePublished()).toBe(true);
    expect(entry.fastenerCaseVisible()).toBe(true);
    const records = getPublicCases().filter(c => c.slug === entry.FASTENER_CASE_SLUG);
    expect(records).toHaveLength(1);
    expect(records[0].publicationStatus).toBe('published');
    expect(getCaseResults(parseCaseQuery({ q: 'RCWT-160/105' })).items.filter(c => c.slug === entry.FASTENER_CASE_SLUG)).toHaveLength(1);
    expect(isHiddenCaseEntry(entry.FASTENER_CASE_PATH)).toBe(false);
    expect(isWithdrawnTechnicalPath(entry.FASTENER_CASE_PATH)).toBe(false);
    expect(isWithdrawnTechnicalPath(entry.FASTENER_CASE_PATH.replace('/zh/', '/en/'))).toBe(true);
    expect(isWithdrawnTechnicalPath('/zh/case/fastener-quench-carburising')).toBe(true);
  });
});
