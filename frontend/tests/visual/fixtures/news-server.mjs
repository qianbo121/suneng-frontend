// A local, read-only content service for browser tests, including server rendering.
// It never contacts production or accepts inquiry/analytics writes.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

const category = { id: 900001, nameZh: '设备选型', nameEn: 'Equipment Selection', slug: 'selection' };
const article = {
  id: 900001, categoryId: category.id, category,
  slug: 'visual-test-annealing-selection',
  titleZh: '退火炉选型：工件与产能如何确认？',
  titleEn: 'Annealing furnace selection: confirm workpieces and capacity',
  summaryZh: '浏览器测试资料，用于验证列表、筛选和详情页跳转。',
  summaryEn: 'Browser test content for resource filtering and article navigation.',
  contentZh: '<p>选型前确认工件尺寸、材质和产能。</p>',
  contentEn: '<p>Confirm workpiece dimensions, material and capacity before selecting an annealing furnace.</p>',
  publishDate: '2026-09-01T00:00:00Z', status: 'published', isPublished: true,
};

// Keep production-independent fixtures for pagination, exact reviewed snippets,
// seven resource entry links and articles without an English counterpart.
const reviewedSources = JSON.parse(readFileSync(new URL('../../fixtures/news-seo-title-sources-20260920.json', import.meta.url), 'utf8'));
const reviewedSlugs = [
  'atmosphere-furnace-pressure-fluctuation-process-or-equipment',
  'heat-treatment-furnace-loading-rack-fixture-selection',
  'multi-product-heat-treatment-furnace-changeover-boundaries',
];
const prioritySlugs = [
  'dian-jia-re-tai-che-lu-he-ran-qi-tai-che-lu-zen-me-xuan-xian-bi-jiao-7-xiang-tiao-jian',
  'shuju-news-16', 'shuju-news-21', 'shuju-news-17', 'shuju-news-34',
  'heat-treatment-line-batch-traceability',
  'heat-treatment-line-capacity-bottleneck-troubleshooting',
];
const untranslatedSlugs = [
  'gas-cylinder-curing-oven-slow-heating',
  'heat-treatment-basket-turnover-quantity',
  'multi-station-curing-oven-independent-operation',
];
const articles = [
  article,
  ...reviewedSlugs.map(slug => {
    const source = reviewedSources.cms.find(item => item.slug === slug);
    if (!source) throw new Error(`Missing reviewed browser fixture: ${slug}`);
    return { ...article, ...source };
  }),
  ...prioritySlugs.map((slug, index) => ({ ...article, id: 900100 + index, slug })),
  ...untranslatedSlugs.map((slug, index) => ({
    ...article, id: 900200 + index, slug, titleEn: '', summaryEn: '', contentEn: '',
  })),
  ...Array.from({ length: 12 }, (_, index) => ({
    ...article, id: 900300 + index, slug: `visual-test-annealing-page-${index + 1}`,
  })),
];

createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  let data;
  if (request.method !== 'GET') {
    response.writeHead(405).end();
    return;
  }
  if (url.pathname === '/health') data = { ready: true };
  else if (url.pathname === '/api/v1/news/categories') data = [category];
  else if (url.pathname === '/api/v1/news') {
    const page = Number(url.searchParams.get('page') || 1);
    const pageSize = Number(url.searchParams.get('pageSize') || 10);
    data = { items: articles.slice((page - 1) * pageSize, page * pageSize), total: articles.length, page, pageSize };
  } else if (url.pathname.startsWith('/api/v1/news/')) {
    const slug = decodeURIComponent(url.pathname.slice('/api/v1/news/'.length));
    data = /^\d+\/prev-next$/.test(slug)
      ? { prev: null, next: null }
      : articles.find(item => item.slug === slug);
    if (!data) {
      response.writeHead(404).end();
      return;
    }
  }
  else {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ code: 0, data, message: 'ok' }));
}).listen(Number(process.env.VISUAL_NEWS_PORT || 3103), '127.0.0.1');
