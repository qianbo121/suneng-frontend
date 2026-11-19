import DOMPurify from 'isomorphic-dompurify';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ProductionLineDetailPage } from './ProductionLineDetailPage';
import { getProductionLineContent } from '@/lib/production-line-content';
import { prepareNewsArticleHtml } from '@/lib/sanitize';

vi.mock('@/components/home/HomepageLeadForm', () => ({ HomepageLeadForm: () => null }));
vi.mock('@/components/case-studies/CaseEvidenceLinks', () => ({ EntryCaseEvidence: () => null }));
vi.mock('@/components/layout/Breadcrumb', () => ({ Breadcrumb: () => null }));

const slug = 'gas-cylinder-curing-batch-oven-continuous-line-selection';
const productHref = '/zh/products/detail/cylinder-curing-line#workpieces';
const articleHref = `/zh/news/${slug}`;
const parse = (html: string) => DOMPurify.sanitize(html, { RETURN_DOM: true }) as HTMLElement;

describe('Chinese cylinder article and equipment links', () => {
  it.each(['<p>共用固化程序的瓶型可以一起比较。</p>', '<h2>修订后的选型说明</h2>'])(
    'keeps one product link when the article wording or structure changes: %s', (body) => {
      const options = { articleSlug: slug, locale: 'zh' as const };
      const html = prepareNewsArticleHtml(body, options);
      const root = parse(html);
      expect(root.querySelectorAll(`a[href="${productHref}"]`)).toHaveLength(1);
      expect(root.textContent).toContain(parse(body).textContent);
      expect(prepareNewsArticleHtml(html, options)).toBe(html);
    },
  );

  it('leaves English content and other Chinese articles alone', () => {
    const body = '<p>Article copy.</p>';
    expect(prepareNewsArticleHtml(body, { articleSlug: slug, locale: 'en' })).toBe(body);
    expect(prepareNewsArticleHtml(body, { articleSlug: 'other', locale: 'zh' })).toBe(body);
  });

  it.each([
    ['cylinder-curing-line', 'zh', 1],
    ['cylinder-curing-line', 'en', 0],
    ['fastener-quench-temper-line', 'zh', 0],
  ] as const)('renders the return link only in the Chinese cylinder workpieces section: %s / %s', (pageId, locale, count) => {
    const content = getProductionLineContent(pageId)!;
    const root = parse(renderToStaticMarkup(<ProductionLineDetailPage content={content} locale={locale} />));
    const selector = `a[href="${articleHref}"]`;
    expect(root.querySelectorAll(selector)).toHaveLength(count);
    expect(root.querySelector('#workpieces')?.querySelectorAll(selector)).toHaveLength(count);
  });
});
