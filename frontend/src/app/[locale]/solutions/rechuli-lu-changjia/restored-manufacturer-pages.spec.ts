import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { getStaticProductBySlug } from '@/constants/static-products';
import reviewedNews from '@/lib/news-reviewed-copy.json';
import { isWithdrawnTechnicalPath } from '@/lib/publication-scope';
import ManufacturerPage, { generateMetadata as manufacturerMetadata } from './page';
import { generateStaticParams as strengthParams } from '../../strength/[categorySlug]/page';
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
    projectBoundary: '记录未公布实测能耗、产量或验收成果',
  },
  {
    slug: 'jiangsu-gongye-lu-changjia',
    Page: JiangsuPage,
    metadata: jiangsuMetadata,
    projectBoundary: '不能代替旧炉改造的实测效果',
  },
];

describe.each(pages)('restored Chinese manufacturer page: $slug', ({ slug, Page, metadata, projectBoundary }) => {
  const pagePath = `/zh/solutions/${slug}`;
  const params = (locale: string) => ({ params: Promise.resolve({ locale }) });

  it('serves the approved Chinese page with its own canonical and no English edition', async () => {
    const html = renderToStaticMarkup(await Page(params('zh')));
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('江苏泰州');
    expect(html).toContain('成立于 2006 年');
    expect(html).toContain('提交工况，咨询方案');
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
    expect(html).toContain('id="cases"');
    expect(html).toContain('/zh/case/henan-annealing-solution-line');
    expect(html).toContain(projectBoundary);
    for (const match of html.matchAll(/href="#([^"]+)"/g)) {
      expect(html).toContain(`id="${match[1]}"`);
    }
  });

  it('links only to existing public routes and real product entries', async () => {
    const html = renderToStaticMarkup(await Page(params('zh')));
    const hrefs = [...html.matchAll(/href="(?:https:\/\/www\.jssngyl\.cn)?(\/zh[^"?#]*)(?:[?#][^"]*)?"/g)].map((match) => match[1]);
    expect(hrefs).toContain('/zh/inquiry');
    expect(hrefs).toContain('/zh/articles/gongye-lu-baojia-canshu');
    for (const href of new Set(hrefs)) {
      expect(isWithdrawnTechnicalPath(href), href).toBe(false);
      if (href.startsWith('/zh/products/detail/')) {
        expect(getStaticProductBySlug(href.split('/').at(-1)!), href).toBeDefined();
      } else if (href.startsWith('/zh/news/')) {
        expect(Object.values(reviewedNews).some((article) => article.slug === href.split('/').at(-1)), href).toBe(true);
      } else if (href === '/zh/strength/honors') {
        expect(strengthParams()).toContainEqual({ locale: 'zh', categorySlug: 'honors' });
      } else {
        const route = href.replace(/^\/zh\/?/, '');
        const file = fileURLToPath(new URL(`../../${route ? `${route}/` : ''}page.tsx`, import.meta.url));
        expect(existsSync(file), href).toBe(true);
      }
    }
  });
});
