import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
vi.mock('server-only', () => ({}));
vi.mock('next/navigation', async original => ({
  ...(await original<typeof import('next/navigation')>()),
  usePathname: () => '/zh/case/fastener-mesh-belt-quenching-carburizing',
}));
vi.mock('react', async original => ({ ...(await original<typeof import('react')>()), cache: (fn: unknown) => fn }));
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

describe('approved Chinese fastener case', () => {
  it('renders the three related links before the FAQ and identifies the published article', async () => {
    const { FastenerCase } = await import('@/components/case-studies/fastener-mesh-belt/FastenerCase');
    const { CarburisingAgreement } = await import('@/components/products/MeshBeltAgreement');
    const entry = await import('./fastener-case-entry');
    const html = renderToStaticMarkup(createElement(FastenerCase));
    const links = html.match(/<nav[^>]*aria-label="相关设备与资料"[^>]*>(.*?)<\/nav>/s);
    expect(links).not.toBeNull();
    expect(links!.index).toBeLessThan(html.indexOf('id="case-faq"'));
    expect([...links![1].matchAll(/href="([^"]+)"/g)].map((match) => match[1])).toEqual([
      '/zh/products/detail/mesh-belt-furnace#agreement-capacity',
      '/zh/products/detail/fastener-quench-temper-line',
      '/zh/news/mesh-belt-carburizing-throughput-process-limits',
    ]);
    const json = html.match(/<script[^>]*id="case-search-jsonld"[^>]*>(.*?)<\/script>/s);
    const article = JSON.parse(json![1])['@graph'].find((node: { '@type': string }) => node['@type'] === 'Article');
    expect(article.datePublished).toBe('2026-11-14T22:53:00+08:00');
    expect(article.publisher).toEqual({ '@id': 'https://www.jssngyl.cn/#organization' });
    const paragraph = () => renderToStaticMarkup(createElement(CarburisingAgreement));
    expect(paragraph()).toContain(`href="${entry.FASTENER_CASE_PATH}">RCWT-160/105-9/6</a>`);
    const hidden = vi.spyOn(entry, 'fastenerCaseVisible').mockReturnValue(false);
    try {
      expect(paragraph()).not.toContain('<a ');
      expect(paragraph()).toContain('RCWT-160/105-9/6 网带炉，技术协议列明渗碳150 kg/h');
    } finally { hidden.mockRestore(); }
  });

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
