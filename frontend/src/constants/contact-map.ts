import { SUNENG_CONTACT } from './contact';
import type { Locale } from '@/types/site';

type FactoryMap = {
  provider: 'baidu' | 'google';
  href: string;
  label: string;
  preview?: { kind: 'image' | 'iframe'; src: string; title: string };
};

// Factory point separately verified on Baidu (BD-09); not Google coordinates.
const baiduFactoryPoint = { lng: 120.038631, lat: 32.448097 };

// Google point confirmed by the user. Never copy these coordinates into Baidu.
const googlePlace = 'https://www.google.com/maps/place/%E5%A7%9C%E5%A0%B0%E5%B8%82%E8%8B%8F%E8%83%BD%E5%B7%A5%E4%B8%9A%E7%82%89%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8/@32.4421099,120.0321985,17z/data=!4m6!3m5!1s0x35b6c9b829bb1abf:0xd918870dad7f2234!8m2!3d32.4421099!4d120.0321985!16s%2Fg%2F1v46ydry?hl=en';
const googleEmbed = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3367.142888168346!2d120.03219849999999!3d32.4421099!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x35b6c9b829bb1abf%3A0xd918870dad7f2234!2z5aec5aCw5biC6IuP6IO95bel5Lia54KJ5pyJ6ZmQ5YWs5Y-4!5e0!3m2!1sen!2sus!4v1792395437004!5m2!1sen!2sus';

export function getContactFactoryMap(locale: Locale): FactoryMap {
  if (locale === 'en') {
    return {
      provider: 'google', href: googlePlace, label: 'View factory on Google Maps',
      preview: { kind: 'iframe', src: googleEmbed, title: 'Suneng factory location on Google Maps' },
    };
  }

  const { lng, lat } = baiduFactoryPoint;
  const marker = new URL('https://api.map.baidu.com/marker');
  marker.search = new URLSearchParams({ location: `${lat},${lng}`, title: SUNENG_CONTACT.company, content: '江苏省泰州市姜堰区俞张线蔡官工业园区内', coord_type: 'bd09ll', output: 'html', src: 'webapp.jssngyl.contact' }).toString();
  return {
    provider: 'baidu', href: marker.href, label: '百度地图查看厂区',
    preview: {
      kind: 'image', src: '/images/contact/factory-location.svg?v=2',
      title: '苏能厂区周边示意图：位于俞张线（205县道）西侧、三兴路交叉口以北，北侧为神龙电气、南侧为润程机械。点击打开百度地图查看准确位置。',
    },
  };
}
