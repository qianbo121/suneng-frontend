import { getContactFactoryMap, parseBaiduFactoryPoint } from '@/constants/contact-map';
import { renderBaiduFactoryMap } from '@/lib/baidu-factory-map-html';

export const dynamic = 'force-dynamic';

export function GET() {
  const browserKey = process.env.BAIDU_MAP_BROWSER_KEY?.trim();
  const rawPoint = process.env.BAIDU_FACTORY_BD09_POINT;
  const point = parseBaiduFactoryPoint(rawPoint);
  const headers = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
  if (!browserKey || !point) {
    return new Response('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>厂区位置</title><p>厂区地图暂不可用，请使用页面上的百度地图入口。</p></html>', { status: 503, headers });
  }
  const map = getContactFactoryMap('zh', { browserKey, point: rawPoint });
  return new Response(renderBaiduFactoryMap({ browserKey, point, href: map.href }), { headers });
}
