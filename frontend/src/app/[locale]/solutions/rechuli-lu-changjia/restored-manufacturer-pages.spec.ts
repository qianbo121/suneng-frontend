import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { getStaticProductBySlug } from '@/constants/static-products';
import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import ManufacturerPage, { generateMetadata as manufacturerMetadata } from './page';
import JiangsuPage, { generateMetadata as jiangsuMetadata } from '../jiangsu-gongye-lu-changjia/page';

vi.mock('server-only', () => ({}));
vi.mock('next/navigation', () => ({
  notFound: () => { throw new Error('404'); },
  usePathname: () => '/zh/solutions/rechuli-lu-changjia',
}));

const pages = [
  {
    slug: 'rechuli-lu-changjia',
    Page: ManufacturerPage,
    metadata: manufacturerMetadata,
    hasPublicCase: true,
  },
  {
    slug: 'jiangsu-gongye-lu-changjia',
    Page: JiangsuPage,
    metadata: jiangsuMetadata,
    hasPublicCase: false,
  },
];

describe.each(pages)('restored Chinese manufacturer page: $slug', ({ slug, Page, metadata, hasPublicCase }) => {
  const pagePath = `/zh/solutions/${slug}`;
  const params = (locale: string) => ({ params: Promise.resolve({ locale }) });

  it('serves the approved Chinese page with its own canonical and no English edition', async () => {
    const html = renderToStaticMarkup(await Page(params('zh')));
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('公司自报约14700㎡生产基地');
    expect(html).toContain('成立于 2006 年');
    expect(html).toContain('获取报价方案');
    expect((await metadata(params('zh'))).alternates).toEqual({
      canonical: `https://www.jssngyl.cn${pagePath}`,
      languages: {
        'zh-CN': `https://www.jssngyl.cn${pagePath}`,
        'x-default': `https://www.jssngyl.cn${pagePath}`,
      },
    });
    await expect(Page(params('en'))).rejects.toThrow('404');
    await expect(metadata(params('en'))).rejects.toThrow('404');
  });

  it('omits withdrawn project text and links, and has no empty case section', async () => {
    const html = renderToStaticMarkup(await Page(params('zh')));
    for (const withdrawn of [
      'anonymous-tsingshan-1250-renovation',
      'jining-support-roller-heat-treatment-line',
      '济宁支重轮热处理生产线',
      '某不锈钢深加工企业连续退洗线节能改造',
      '连续退洗线改造：核对现场能源与接口',
    ]) expect(html).not.toContain(withdrawn);
    expect(html.includes('id="cases"')).toBe(hasPublicCase);
    expect(html.includes('/zh/case/henan-annealing-solution-line')).toBe(hasPublicCase);
    if (hasPublicCase) expect(html).toContain('验收结果不作成果数字结论');
    for (const match of html.matchAll(/href="#([^"]+)"/g)) {
      expect(html).toContain(`id="${match[1]}"`);
    }
  });

  it('links only to existing public routes and real product entries', async () => {
    const html = renderToStaticMarkup(await Page(params('zh')));
    const hrefs = [...html.matchAll(/href="(\/zh[^"?#]*)(?:[?#][^"]*)?"/g)].map((match) => match[1]);
    expect(hrefs).toContain('/zh/contact');
    expect(hrefs).toContain('/zh/articles/gongye-lu-baojia-canshu');
    for (const href of new Set(hrefs)) {
      expect(isWithdrawnTechnicalPath(href), href).toBe(false);
      if (href.startsWith('/zh/products/detail/')) {
        expect(getStaticProductBySlug(href.split('/').at(-1)!), href).toBeDefined();
      } else {
        const route = href.replace(/^\/zh\/?/, '');
        const file = fileURLToPath(new URL(`../../${route ? `${route}/` : ''}page.tsx`, import.meta.url));
        expect(existsSync(file), href).toBe(true);
      }
    }
  });
});
