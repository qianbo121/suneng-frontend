import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({ ...(await original<typeof import('react')>()), cache: (fn: unknown) => fn }));
import { isWithdrawnTechnicalPath } from './publication-scope';
import { getLocalizedNavigation } from '@/mock/navigation';
import { readCaseDirectory } from './cases/server';
import { readEnglishCases } from './cases/english';
import { PUBLIC_CASE_SLUGS, PUBLIC_ENGLISH_CASE_SLUGS } from './cases/public-case-allowlist';
import { prepareNewsArticleHtml } from './sanitize';

const approved = 'henan-annealing-solution-line';

describe('launch publication scope', () => {
  it('keeps guides and solutions withdrawn in both languages and on unprefixed routes', () => {
    for (const prefix of ['', '/zh', '/en']) {
      for (const route of ['/articles', '/articles/example', '/solutions', '/solutions/example'])
        expect(isWithdrawnTechnicalPath(prefix + route), prefix + route).toBe(true);
      for (const route of ['/news/example', '/products/detail/annealing-solution-line', '/service', '/about'])
        expect(isWithdrawnTechnicalPath(prefix + route), prefix + route).toBe(false);
    }
    expect(isWithdrawnTechnicalPath('https://another.example/case/project')).toBe(false);
  });

  it('sees through percent-escapes and letter case that the router would still resolve', () => {
    for (const path of [
      '/zh/%73olutions/continuous-heat-treatment-line',
      '/zh/%61rticles/gongye-lu-baojia-canshu',
      '/zh/%63ase/jining-support-roller-heat-treatment-line',
      '/en/%63%61%73%65/jining-support-roller-heat-treatment-line',
      '/%7A%68/solutions',
      '/zh/SOLUTIONS/x',
      '/ZH/Articles',
      `/zh/case/${approved.toUpperCase()}`,
      `/zh/case/${approved}%2Fextra`,
      '/zh/%E0%A4%A/solutions',
    ])
      expect(isWithdrawnTechnicalPath(path), path).toBe(true);
    expect(isWithdrawnTechnicalPath(`/zh/%63ase/${approved}`)).toBe(false);
    expect(isWithdrawnTechnicalPath('/zh/news/%E5%B7%A5%E4%B8%9A%E7%82%89')).toBe(false);
  });

  it('opens the case hub and only owner-approved case pages per locale', () => {
    for (const prefix of ['', '/zh', '/en']) {
      expect(isWithdrawnTechnicalPath(`${prefix}/case`), `${prefix}/case`).toBe(false);
      expect(isWithdrawnTechnicalPath(`${prefix}/case/`), `${prefix}/case/`).toBe(false);
      expect(isWithdrawnTechnicalPath(`${prefix}/case/${approved}`), prefix).toBe(false);
      expect(isWithdrawnTechnicalPath(`${prefix}/case/${approved}?returnTo=%2Fzh%2Fcase`), prefix).toBe(false);
      // Unapproved drafts, nested paths and look-alike slugs stay withdrawn.
      for (const route of [
        '/case/example?from=2',
        '/case/jining-support-roller-heat-treatment-line',
        '/case/alloy-eight-furnaces-acceptance-supply-boundaries-proposal',
        `/case/${approved}/extra`,
        `/case/${approved}-copy`,
      ])
        expect(isWithdrawnTechnicalPath(prefix + route), prefix + route).toBe(true);
    }
    expect(isWithdrawnTechnicalPath(`https://www.jssngyl.cn/en/case/${approved}`)).toBe(false);
    expect(isWithdrawnTechnicalPath('https://www.jssngyl.cn/zh/cases')).toBe(false);
  });

  it('exposes only approved Chinese and English case records', () => {
    const root = path.join(process.cwd(), 'content');
    expect(readCaseDirectory(path.join(root, 'cases'), undefined, PUBLIC_CASE_SLUGS).map((item) => item.slug)).toEqual([...PUBLIC_CASE_SLUGS]);
    expect(readEnglishCases(root, undefined, PUBLIC_ENGLISH_CASE_SLUGS).map((item) => item.slug)).toEqual([...PUBLIC_ENGLISH_CASE_SLUGS]);
    expect(readCaseDirectory(path.join(root, 'cases'), undefined, new Set())).toEqual([]);
    expect(readEnglishCases(root, undefined, new Set())).toEqual([]);
  });

  it('shows the case hub in navigation without any withdrawn destination', () => {
    for (const locale of ['zh', 'en'] as const) {
      const entries = getLocalizedNavigation(locale);
      expect(entries.map((item) => item.href)).toEqual(['/', '/products', '/service', '/case', '/news', '/about']);
      const hrefs = entries.flatMap((item) => [item.href, ...(item.children ?? []).map((child) => child.href)]);
      expect(hrefs.some((href) => isWithdrawnTechnicalPath(href === '/' ? `/${locale}` : `/${locale}${href}`))).toBe(false);
    }
  });

  it('preserves news text and live links while removing withdrawn inline links', () => {
    const html = prepareNewsArticleHtml(`<p>正文 <a href="/zh/case/old">项目参数</a> <a href="https://www.jssngyl.cn/en/solutions/old">Guide</a> <a href="/zh/case/${approved}">河南项目</a> <a href="/zh/news/live">新闻</a> <a href="/zh/products">产品</a></p>`);
    expect(html).toContain('正文 项目参数 Guide');
    expect(html).not.toContain('/case/old');
    expect(html).not.toContain('/solutions/old');
    expect(html).toContain(`href="/zh/case/${approved}"`);
    expect(html).toContain('href="/zh/news/live"');
    expect(html).toContain('href="/zh/products"');
  });
});
