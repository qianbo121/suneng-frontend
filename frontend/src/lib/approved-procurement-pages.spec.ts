import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { approvedProcurementPages } from './approved-procurement-pages';
import { APPROVED_GUIDE_PATHS, APPROVED_PROCUREMENT_PATHS, isPublishedProcurementPage, isWithdrawnRequestPath } from './publication-scope';
import { isZhOnlyPath, localizeOrHideHref } from './i18n/zh-only';
import { ApprovedProcurementPage } from '@/components/procurement/ApprovedProcurementPage';
import { ChineseProductsLanding } from '@/components/products/ChineseProductsLanding';
import { ServiceHero } from '@/components/service-pages/ServicePageShared';
import * as EquipmentRoute from '@/app/[locale]/articles/special-industrial-furnace-procurement-assessment/page';
import * as PartsRoute from '@/app/[locale]/service/industrial-furnace-parts-purchasing/page';

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'zh' }),
  usePathname: () => '/zh',
  notFound: () => { throw Object.assign(new Error('not found'), { withdrawn: true }); },
}));

const load = createRequire(import.meta.url);
const { JSDOM }: { JSDOM: new (html: string) => { window: { document: Document } } } =
  createRequire(load.resolve('isomorphic-dompurify'))('jsdom');
const documentOf = (html: string) => new JSDOM(html).window.document;
const approvedCases = [
  ['equipment', EquipmentRoute, 'bd3636cd05c8f4c0018dd010381cb1b9b817c6abc746a77f2b207f4e4f662ebf', [
    'room-gas-forging-regenerative-assessment', 'solution-nitriding-atmosphere-assessment',
    'large-bell-assessment', 'oven-preheat-curing-assessment', 'spheroidizing-assessment',
    'gas-furnace-assessment', 'electric-resistance-furnace-assessment', 'drying-furnace-assessment', 'stainless-annealing-pickling-assessment',
  ]],
  ['parts', PartsRoute, '06ce11f1417de21a421e601b32603fa259e41208d332c57d5a9153a4ffa4d9ea', [
    'parts-heating', 'parts-baskets-welded', 'parts-fans-shafts', 'parts-cover-motor-guide',
    'parts-mesh-belt', 'parts-trays-baskets', 'parts-gas-radiant', 'parts-brand-fit', 'parts-pusher-column-beam', 'parts-guide-chain', 'parts-heat-resistant-identity',
  ]],
] as const;

describe('the two owner-approved Chinese procurement pages', () => {
  it.each(approvedCases)('%s renders the exact approved body and legacy target anchors', (id, _route, bodySha, anchors) => {
    const page = approvedProcurementPages[id];
    expect(createHash('sha256').update(page.html).digest('hex')).toBe(bodySha);
    const doc = documentOf(renderToStaticMarkup(createElement(ApprovedProcurementPage, { id })));
    expect([...doc.querySelectorAll('h1')].map((node) => node.textContent)).toEqual([page.heading]);
    const body = doc.querySelector('.news-article')!;
    const approvedBody = documentOf(page.html).body;
    const normalizedBody = body.cloneNode(true) as HTMLElement;
    normalizedBody.querySelectorAll('h2').forEach((heading) => heading.removeAttribute('id'));
    expect(normalizedBody.innerHTML).toBe(approvedBody.innerHTML);
    expect([...body.querySelectorAll('h2')].map((heading) => heading.id)).toEqual(
      [...approvedBody.querySelectorAll('h2')].map((_, index) => `procurement-${id}-body-section-${index + 1}`),
    );
    expect([...body.querySelectorAll('section[id]')].map((node) => node.id)).toEqual(anchors);
    expect(doc.querySelector('time')).toBeNull();
    expect(body.querySelector('img, form, script, style, h1')).toBeNull();
    expect(doc.body.textContent).not.toMatch(/待审核|未上线|整页新增/);
    const phone = doc.querySelector('a[href^="tel:"]')!;
    expect(phone.textContent).toContain('130-5298-6814');
    expect(phone.getAttribute('href')?.replace(/^tel:(?:\+86)?/, '')).toBe('13052986814');
    expect([...doc.querySelectorAll('button')].some((node) => node.textContent === '微信联系' && node.getAttribute('aria-haspopup') === 'dialog')).toBe(true);
    expect(body.querySelector('a[href="/zh/inquiry"]')).not.toBeNull();
  });

  it.each(approvedCases)('%s server-renders its own page identity and the visible breadcrumb hierarchy', (id) => {
    const page = approvedProcurementPages[id];
    const doc = documentOf(renderToStaticMarkup(createElement(ApprovedProcurementPage, { id })));
    const scripts = doc.querySelectorAll(`#procurement-${id}-page-jsonld`);
    expect(scripts).toHaveLength(1);
    expect(scripts[0].getAttribute('type')).toBe('application/ld+json');
    const [webpage, breadcrumb] = JSON.parse(scripts[0].textContent!) as Array<Record<string, unknown>>;
    const canonical = 'https://www.jssngyl.cn' + page.path;
    expect(webpage).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': canonical + '#webpage',
      url: canonical,
      name: doc.querySelector('h1')?.textContent,
      description: page.description,
      isPartOf: { '@id': 'https://www.jssngyl.cn/#website' },
      about: { '@id': 'https://www.jssngyl.cn/#organization' },
      inLanguage: 'zh-CN',
    });
    expect(breadcrumb).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: 'https://www.jssngyl.cn/zh' },
        { '@type': 'ListItem', position: 2, name: page.parentLabel, item: 'https://www.jssngyl.cn' + page.parentPath },
        { '@type': 'ListItem', position: 3, name: page.heading, item: canonical },
      ],
    });
    const parent = doc.querySelector(`nav[aria-label="Breadcrumb"] a[href="${page.parentPath}"]`);
    expect(parent?.textContent).toBe(page.parentLabel);
    expect(webpage).not.toHaveProperty('datePublished');
    expect(webpage).not.toHaveProperty('dateModified');
    expect(webpage).not.toHaveProperty('author');
    expect(webpage).not.toHaveProperty('reviewedBy');
  });

  it.each(approvedCases)('%s has a self canonical, Chinese-only metadata and no invented news date', async (id, route) => {
    const page = approvedProcurementPages[id];
    const metadata = await route.generateMetadata({ params: Promise.resolve({ locale: 'zh' }) });
    expect(metadata.alternates?.canonical).toBe('https://www.jssngyl.cn' + page.path);
    expect(metadata.alternates?.languages).toEqual({
      'zh-CN': 'https://www.jssngyl.cn' + page.path,
      'x-default': 'https://www.jssngyl.cn' + page.path,
    });
    expect(metadata.openGraph).toMatchObject({ type: 'website' });
    expect(metadata.openGraph).not.toHaveProperty('publishedTime');
    expect(metadata.openGraph).not.toHaveProperty('modifiedTime');
    expect(route.generateStaticParams()).toEqual([{ locale: 'zh' }]);
    const html = renderToStaticMarkup(await route.default({ params: Promise.resolve({ locale: 'zh' }) }));
    expect(documentOf(html).querySelector('h1')?.textContent).toBe(page.heading);
    for (const locale of ['en', 'fr']) {
      const props = { params: Promise.resolve({ locale }) };
      await expect(route.default(props)).rejects.toMatchObject({ withdrawn: true });
      await expect(route.generateMetadata(props)).rejects.toMatchObject({ withdrawn: true });
    }
  });

  it('opens only the approved new article while the original eleven-guide scope stays frozen', () => {
    expect(APPROVED_GUIDE_PATHS.size).toBe(11);
    expect(APPROVED_PROCUREMENT_PATHS.size).toBe(2);
    for (const page of Object.values(approvedProcurementPages)) {
      expect(isPublishedProcurementPage('zh', page.path)).toBe(true);
      expect(isPublishedProcurementPage('en', page.path)).toBe(false);
      expect(isWithdrawnRequestPath(page.path)).toBe(false);
      expect(isZhOnlyPath(page.path)).toBe(true);
      expect(localizeOrHideHref(page.path, 'en')).toBeNull();
      expect(localizeOrHideHref(page.path, 'zh')).toBe(page.path);
    }
    const equipment = approvedProcurementPages.equipment.path;
    expect(isWithdrawnRequestPath(equipment.replace('/zh/', '/en/'))).toBe(true);
    expect(isWithdrawnRequestPath(equipment.replace('special-', '%73pecial-'))).toBe(true);
    expect(isWithdrawnRequestPath(equipment + '/unapproved')).toBe(true);
    expect(isWithdrawnRequestPath('/zh/articles/unapproved-parts-page')).toBe(true);
  });
});

describe('only the two approved entry placements change', () => {
  it('retains the original three Chinese purchase references in order, followed by the new fourth link', () => {
    const doc = documentOf(renderToStaticMarkup(createElement(ChineseProductsLanding, { locale: 'zh' })));
    const section = doc.querySelector('#selection-purchase-reference')!;
    expect([...section.querySelectorAll('a')].map((node) => [node.textContent?.trim(), node.getAttribute('href')])).toEqual([
      ['连续生产线规划', '/zh/solutions/continuous-heat-treatment-line'],
      ['厂家能力核对', '/zh/solutions/rechuli-lu-changjia'],
      ['江苏及华东项目配套', '/zh/solutions/jiangsu-gongye-lu-changjia'],
      ['专项工业炉采购评估', approvedProcurementPages.equipment.path],
    ]);
    const english = documentOf(renderToStaticMarkup(createElement(ChineseProductsLanding, { locale: 'en' })));
    expect(english.querySelector('a[href="' + approvedProcurementPages.equipment.path + '"]')).toBeNull();
  });

  it('inserts the exact parts paragraph between the existing installation Hero and pathbar', () => {
    const doc = documentOf(renderToStaticMarkup(createElement(ServiceHero, { kind: 'installation', locale: 'zh' })));
    const entry = doc.querySelector('[data-parts-purchase-entry]')!;
    expect(doc.querySelectorAll('[data-parts-purchase-entry]')).toHaveLength(1);
    expect(entry.querySelector('p')?.textContent?.trim()).toBe('工业炉配件可独立采购，也可评估其他厂家设备配套。 查看配件采购范围');
    expect(entry.querySelector('a')?.getAttribute('href')).toBe(approvedProcurementPages.parts.path);
    expect(entry.previousElementSibling?.getAttribute('aria-labelledby')).toBe('service-title');
    expect(entry.nextElementSibling?.querySelector('nav[aria-label="面包屑"]')).not.toBeNull();
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
    for (const props of [
      { kind: 'installation', locale: 'en' },
      { kind: 'overview', locale: 'zh' },
      { kind: 'relocation', locale: 'zh' },
    ] as const) {
      const unchanged = documentOf(renderToStaticMarkup(createElement(ServiceHero, props)));
      expect(unchanged.querySelector('[data-parts-purchase-entry]')).toBeNull();
    }
  });
});
