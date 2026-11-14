import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({ ...(await original<typeof import('react')>()), cache: (fn: unknown) => fn }));
vi.mock('next/navigation', () => ({ usePathname: () => '/en', notFound: () => { throw new Error('404'); } }));
import { generateMetadata as procurementMetadata } from '@/app/[locale]/articles/special-industrial-furnace-procurement-assessment/page';
import { generateMetadata as productMetadata } from '@/app/[locale]/products/detail/[slug]/page';

it.each(['zh', 'en'])('keeps procurement language codes consistent for %s', async (locale) => {
  const suffix = '/articles/special-industrial-furnace-procurement-assessment';
  const meta = await procurementMetadata({ params: Promise.resolve({ locale }) });
  expect(meta.alternates?.canonical).toBe(`https://www.jssngyl.cn/${locale}${suffix}`);
  expect(meta.alternates?.languages).toEqual({
    'zh-CN': `https://www.jssngyl.cn/zh${suffix}`,
    'en-US': `https://www.jssngyl.cn/en${suffix}`,
    'x-default': `https://www.jssngyl.cn/zh${suffix}`,
  });
});

describe('pit furnace share image', () => {
  it.each(['zh', 'en'])('uses a real, existing image for %s sharing', async (locale) => {
    const meta = await productMetadata({ params: Promise.resolve({ locale, slug: 'pit-furnace' }) });
    const images = meta.openGraph?.images as Array<{ url: string }>;
    expect(images[0].url).toBe('https://www.jssngyl.cn/images/products/pit-furnace/gallery/pit-01.png');
    expect(existsSync(path.join(process.cwd(), 'public', new URL(images[0].url).pathname))).toBe(true);
    expect(meta.twitter?.images).toEqual([images[0].url]);
  });
});
