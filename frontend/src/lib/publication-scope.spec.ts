import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({ ...(await original<typeof import('react')>()), cache: (fn: unknown) => fn }));
import { isWithdrawnTechnicalPath } from './publication-scope';
import { getLocalizedNavigation } from '@/mock/navigation';
import { readCaseDirectory } from './cases/server';
import { readEnglishCases } from './cases/english';
import { prepareNewsArticleHtml } from './sanitize';

describe('prelaunch content withdrawal', () => {
  it('closes both languages and unprefixed guide routes without matching news, products or external sources', () => {
    for (const prefix of ['', '/zh', '/en']) {
      for (const route of ['/case', '/case/example?from=2', '/articles/example', '/solutions', '/solutions/example'])
        expect(isWithdrawnTechnicalPath(prefix + route)).toBe(true);
      for (const route of ['/news/example', '/products/detail/annealing-solution-line', '/service', '/about'])
        expect(isWithdrawnTechnicalPath(prefix + route)).toBe(false);
    }
    expect(isWithdrawnTechnicalPath('https://another.example/case/project')).toBe(false);
  });
  it('keeps source drafts while exposing no Chinese or English case record', () => {
    const root = path.join(process.cwd(), 'content');
    expect(fs.readdirSync(path.join(root, 'cases')).some((file) => file.endsWith('.md'))).toBe(true);
    expect(readCaseDirectory(path.join(root, 'cases'))).toEqual([]);
    expect(readEnglishCases(root)).toEqual([]);
  });
  it('keeps news and equipment navigation without withdrawn destinations', () => {
    for (const locale of ['zh', 'en'] as const) {
      const entries = getLocalizedNavigation(locale);
      expect(entries.map((item) => item.href)).toEqual(['/', '/products', '/service', '/news', '/about']);
      expect(entries.flatMap((item) => [item.href, ...(item.children ?? []).map((child) => child.href)]).some(isWithdrawnTechnicalPath)).toBe(false);
    }
  });
  it('preserves news text and live links while removing withdrawn inline links', () => {
    const html = prepareNewsArticleHtml('<p>正文 <a href="/zh/case/old">项目参数</a> <a href="https://www.jssngyl.cn/en/solutions/old">Guide</a> <a href="/zh/news/live">新闻</a> <a href="/zh/products">产品</a></p>');
    expect(html).toContain('正文 项目参数 Guide');
    expect(html).not.toContain('/case/old');
    expect(html).not.toContain('/solutions/old');
    expect(html).toContain('href="/zh/news/live"');
    expect(html).toContain('href="/zh/products"');
  });
});
