import { beforeAll, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Layout from '../layout';
import RelatedCaseLayout from './layout';
import Page, { generateMetadata } from './page';
import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import { isZhOnlyPath, localizeOrHideHref } from '@/lib/i18n/zh-only';

vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  cache: (fn: unknown) => fn,
}));
vi.mock('next/navigation', () => ({
  notFound: () => { throw new Error('404'); },
  usePathname: () => '/zh/solutions/continuous-heat-treatment-line',
}));

const pagePath = '/zh/solutions/continuous-heat-treatment-line';
const props = (locale: string) => ({ params: Promise.resolve({ locale }) });
let html: string;
beforeAll(async () => {
  const page = await Page(props('zh'));
  const related = await RelatedCaseLayout({ ...props('zh'), children: page });
  html = renderToStaticMarkup(await Layout({ ...props('zh'), children: related }));
});

describe('restored Chinese production-line entry', () => {
  it('renders through both layouts without withdrawn links or missing anchors', () => {
    expect(html).toContain('连续热处理生产线');
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((match) => match[1]);
    expect(links).toContain('#fit');
    for (const href of links) {
      expect(isWithdrawnTechnicalPath(href), href).toBe(false);
      if (href.startsWith('#')) expect(html).toContain(`id="${href.slice(1)}"`);
    }
  });

  it('does not expose or advertise the still-withdrawn English counterpart', async () => {
    expect(isZhOnlyPath(pagePath)).toBe(true);
    expect(localizeOrHideHref(pagePath, 'en')).toBeNull();
    const metadata = await generateMetadata(props('zh'));
    expect(metadata.alternates?.languages).not.toHaveProperty('en-US');
    expect(metadata.alternates?.canonical).toBe(`https://www.jssngyl.cn${pagePath}`);
    await expect(Page(props('en'))).rejects.toThrow('404');
    await expect(generateMetadata(props('en'))).rejects.toThrow('404');
    await expect(RelatedCaseLayout({ ...props('en'), children: null })).rejects.toThrow('404');
  });
});
