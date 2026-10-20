import { SUNENG_CONTACT } from './contact';
import type { Locale } from '@/types/site';

type BaiduFactoryConfig = { browserKey?: string; point?: string };
type FactoryMap = {
  provider: 'baidu' | 'google';
  href: string;
  label: string;
  preview?: { kind: 'image' | 'iframe'; src: string; title: string };
};

export function parseBaiduFactoryPoint(value?: string): { lng: number; lat: number } | undefined {
  if (!value || !/^\d+(?:\.\d+)?,\d+(?:\.\d+)?$/.test(value.trim())) return undefined;
  const [lng, lat] = value.trim().split(',').map(Number);
  // The confirmed factory is in Taizhou, Jiangsu. Reject reversed or unrelated points.
  if (lng < 119 || lng > 121 || lat < 31.5 || lat > 33.5) return undefined;
  return { lng, lat };
}

// Google point confirmed by the user. Never copy these coordinates into Baidu.
const googlePlace = 'https://www.google.com/maps/place/%E5%A7%9C%E5%A0%B0%E5%B8%82%E8%8B%8F%E8%83%BD%E5%B7%A5%E4%B8%9A%E7%82%89%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8/@32.4421099,120.0321985,17z/data=!4m6!3m5!1s0x35b6c9b829bb1abf:0xd918870dad7f2234!8m2!3d32.4421099!4d120.0321985!16s%2Fg%2F1v46ydry?hl=en';
const googleEmbed = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3367.142888168346!2d120.03219849999999!3d32.4421099!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x35b6c9b829bb1abf%3A0xd918870dad7f2234!2z5aec5aCw5biC6IuP6IO95bel5Lia54KJ5pyJ6ZmQ5YWs5Y-4!5e0!3m2!1sen!2sus!4v1792395437004!5m2!1sen!2sus';

export function getContactFactoryMap(locale: Locale, baidu: BaiduFactoryConfig = {}): FactoryMap {
  if (locale === 'en') {
    return {
      provider: 'google', href: googlePlace, label: 'View factory on Google Maps',
      preview: { kind: 'iframe', src: googleEmbed, title: 'Suneng factory location on Google Maps' },
    };
  }

  const search = new URL('https://api.map.baidu.com/place/search');
  search.search = new URLSearchParams({ query: SUNENG_CONTACT.company, region: '泰州市', output: 'html', src: 'webapp.jssngyl.contact' }).toString();
  const map: FactoryMap = { provider: 'baidu', href: search.href, label: '百度地图查找厂区' };
  // Only accept a separately verified Baidu BD-09 point, in longitude,latitude order.
  const point = parseBaiduFactoryPoint(baidu.point);
  if (!point) return map;
  const { lng, lat } = point;

  const marker = new URL('https://api.map.baidu.com/marker');
  marker.search = new URLSearchParams({ location: `${lat},${lng}`, title: SUNENG_CONTACT.company, content: SUNENG_CONTACT.address, coord_type: 'bd09ll', output: 'html', src: 'webapp.jssngyl.contact' }).toString();
  map.href = marker.href;
  map.label = '百度地图查看厂区';
  if (baidu.browserKey?.trim()) {
    map.preview = { kind: 'iframe', src: '/baidu-factory-map.html', title: '江苏苏能工业炉厂区位置（百度地图）' };
  }
  return map;
}
