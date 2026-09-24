// A local, read-only content service for browser tests, including server rendering.
// It never contacts production or accepts inquiry/analytics writes.
import { createServer } from 'node:http';

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
    data = { items: page === 1 ? [article] : [], total: 1, page, pageSize: Number(url.searchParams.get('pageSize') || 10) };
  } else if (url.pathname === `/api/v1/news/${article.slug}`) data = article;
  else if (url.pathname === `/api/v1/news/${article.id}/prev-next`) data = { prev: null, next: null };
  else {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ code: 0, data, message: 'ok' }));
}).listen(Number(process.env.VISUAL_NEWS_PORT || 3103), '127.0.0.1');
