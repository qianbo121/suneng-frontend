import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({ ...(await original<typeof import('react')>()), cache: (fn: unknown) => fn }));
import { isWithdrawnRequestPath, isWithdrawnTechnicalPath, routablePathname, withdrawnPageLocale } from './publication-scope';
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
    // Every address of this site counts as this site.
    for (const href of ['https://jssngyl.cn/zh/solutions', 'http://localhost:3000/en/articles/x', 'http://127.0.0.1:3187/zh/case/foo'])
      expect(isWithdrawnTechnicalPath(href), href).toBe(true);
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
      '/zh/solutions/%E0%A4%A',
      '/zh/%73olutions/x%E0',
      '/en/%63ase/example',
      '/%73olutions',
    ])
      expect(isWithdrawnTechnicalPath(path), path).toBe(true);
    for (const path of [`/zh/%63ase/${approved}`, '/zh/%63ase', '/zh/%70roducts'])
      expect(isWithdrawnTechnicalPath(path), path).toBe(false);
    expect(isWithdrawnTechnicalPath('/zh/news/%E5%B7%A5%E4%B8%9A%E7%82%89')).toBe(false);
    expect(isWithdrawnTechnicalPath('/zh/news/%E8%B5%84%E6%96%99')).toBe(false);
  });

  it('refuses paths that URL parsing or next-intl would still route to a withdrawn page', () => {
    for (const path of [
      // next-intl drops tabs and line breaks after decoding.
      '/zh/sol%09utions/continuous-heat-treatment-line',
      '/zh/%0Asolutions/continuous-heat-treatment-line',
      '/en/solutions%0D/continuous-heat-treatment-line',
      '/zh/art%09icles/gongye-lu-baojia-canshu',
      '/zh/%09/solutions',
      `/zh/case/%0A${approved}x`,
      // URL parsing trims surrounding spaces and control characters.
      '/zh/solutions%20',
      '/en/solutions%1F',
      '/zh/solutions%00',
      // Dot segments, doubled escapes, slashes and backslashes.
      '/zh/products/%2e%2e/articles/gongye-lu-baojia-canshu',
      '/zh/products/%252e%252e/solutions/continuous-heat-treatment-line',
      '/zh/products/%252e%252e/solutions/x%25E0',
      '/zh/%2573olutions/continuous-heat-treatment-line',
      // Escapes are decoded until stable, beyond what any single layer does.
      '/zh/%252573olutions/continuous-heat-treatment-line',
      '/zh/solutions%2Fcontinuous-heat-treatment-line',
      '/zh/%2Fsolutions',
      '/zh//solutions',
      '//zh//solutions',
      '/zh\\solutions',
      '/zh/%5Csolutions',
      // A decoded "?" or "#" cannot hide the rest of the path.
      '/zh/case/%253F/%252e%252e/jining-support-roller-heat-treatment-line',
      '/zh/%3F/../solutions',
      '/zh/case/%23/../jining-support-roller-heat-treatment-line',
      // A case page must be named exactly: Next reads each of these as another slug.
      `/zh/case/%0A${approved}`,
      `/zh/case/${approved}%20`,
      `/zh/case/${approved}%2F`,
      `/zh/case/%2568${approved.slice(1)}`,
      `/zh/case/jining-support-roller-heat-treatment-line%2F%2e%2e%2F${approved}`,
      `/zh/case/%2e%2e%2Fcase%2F${approved}`,
      `/en/case/%5C${approved}`,
      `/zh/case/%2F${approved}`,
    ])
      expect(isWithdrawnRequestPath(path), JSON.stringify(path)).toBe(true);
  });

  it('leaves ordinary and undecodable non-withdrawn paths to the router', () => {
    for (const path of [
      '/zh/products/%E0%A4%A',
      '/zh/news/%E0%A4%A',
      // An undecodable segment is kept as written, so no layer can turn it into a locale.
      '/zh/%E0%A4%A/solutions',
      '/zh/news/100%25-quality',
      `/zh/%63ase/${approved}`,
      `/en/case/${approved}/`,
      '/zh/solutions%20x',
      // Next matches the once-decoded path exactly, so "solutions?" is not "solutions".
      '/zh/solutions%3F',
      '/zh/cases',
      '/zh/products/detail/annealing-solution-line',
    ])
      expect(isWithdrawnRequestPath(path), JSON.stringify(path)).toBe(false);
    // A protocol-relative link in content names another host.
    expect(isWithdrawnTechnicalPath('//zh//solutions')).toBe(false);
    expect(isWithdrawnTechnicalPath('//www.jssngyl.cn/zh/solutions')).toBe(true);
    expect(routablePathname('/zh/news/100%25-quality')).toBe('/zh/news/100%-quality');
    expect(routablePathname('/zh/products/%E0%A4%A')).toBe('/zh/products/%E0%A4%A');
  });

  it('answers a withdrawn request in the language the router would use', () => {
    for (const path of ['/en/solutions', '/EN/solutions', '/%65n/solutions', '/En/case/x', '/en', '/en%09/solutions', '/en/%E0/solutions'])
      expect(withdrawnPageLocale(path), path).toBe('en');
    for (const path of ['/solutions', '/zh/solutions', '/english/solutions', '/%E0%A4%A/en', '/enx/solutions'])
      expect(withdrawnPageLocale(path), path).toBe('zh');
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
