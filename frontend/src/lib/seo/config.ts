import { existsSync } from 'node:fs';
import path from 'node:path';

export { DEFAULT_KEYWORDS } from '@/lib/seo/keyword-data';

const FALLBACK_SITE_URL = 'https://www.jssngyl.cn';

function normalizeSiteUrl(value?: string) {
  const cleaned = value?.trim().replace(/\/+$/, '');

  if (!cleaned || /localhost|127\.0\.0\.1/i.test(cleaned)) {
    return FALLBACK_SITE_URL;
  }

  return cleaned;
}

export function publicPathExists(publicPath?: string) {
  if (!publicPath || !publicPath.startsWith('/')) return false;

  return existsSync(path.join(process.cwd(), 'public', publicPath));
}

function firstExistingPublicPath(paths: string[]) {
  return paths.find(publicPathExists) || '';
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const SITE_NAME = '江苏苏能工业炉有限公司官网';

export const COMPANY_NAME = '江苏苏能工业炉有限公司';

export const SHORT_NAME = '苏能工业炉';

export const ALTERNATE_NAMES = ['苏能工业炉', '江苏苏能工业炉', 'Suneng Industrial Furnace'];

export const COMPANY_PHONE = '+86-13052986814';

export const DEFAULT_TITLE = '江苏苏能工业炉有限公司｜工业炉与热处理设备厂家';

export const DEFAULT_DESCRIPTION =
  '江苏苏能工业炉有限公司专注工业炉、热处理炉及非标热处理设备制造，提供主要炉型、热处理生产线、节能改造与售后服务支持。';

export const SITE_LOGO_IMAGE = firstExistingPublicPath([
  '/images/brand/sn-logo-full.png',
  '/images/brand/sn-logo-header.png',
  '/images/brand/sn-logo-header-cropped.png',
]);

export const DEFAULT_OG_IMAGE = firstExistingPublicPath([
  '/images/og/suneng-og.jpg',
  SITE_LOGO_IMAGE,
  '/images/home/hero-industrial-furnace-banner-hd.png',
  '/images/home/hero-industrial-factory-daylight-banner.png',
]);

export const BAIDU_SITE_VERIFICATION = process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION?.trim() || '';
export const BING_SITE_VERIFICATION = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() || '';
export const SITE_360_VERIFICATION = process.env.NEXT_PUBLIC_360_SITE_VERIFICATION?.trim() || '';
export const SOGOU_SITE_VERIFICATION = process.env.NEXT_PUBLIC_SOGOU_SITE_VERIFICATION?.trim() || '';
export const BAIDU_APP_ID = process.env.NEXT_PUBLIC_BAIDU_APP_ID?.trim() || '';
