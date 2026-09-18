import { NextRequest, NextResponse } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/middleware', () => ({ default: () => () => NextResponse.next() }));
vi.mock('@/lib/news-route-guard', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/news-route-guard')>();
  return { ...original, getNewsRouteAvailability: vi.fn().mockResolvedValue('available') };
});

import middleware from '../../middleware';
import { PUBLIC_CASE_SLUGS, PUBLIC_ENGLISH_CASE_SLUGS } from './public-case-allowlist';
import { CASE_PAGE_SIZE } from './types';

const run = (path: string) => middleware(new NextRequest(`https://www.jssngyl.cn${path}`));
const lastPage = (approved: number) => Math.max(1, Math.ceil(approved / CASE_PAGE_SIZE));

describe('case list pagination boundary', () => {
  // An unbounded ?page= used to answer 200 with "index, follow" and a self
  // canonical, which mints one distinct thin page per number.
  it.each([
    ['/zh/case?page=2', 'zh'],
    ['/zh/case?page=50', 'zh'],
    ['/zh/case?page=999999', 'zh'],
    ['/en/case?page=7', 'en'],
    ['/zh/case/?page=3', 'zh'],
  ])('answers %s with a real 404', async (path, locale) => {
    const response = await run(path);
    expect(response.status).toBe(404);
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.text()).toContain(locale === 'en' ? 'lang="en"' : 'lang="zh-CN"');
  });

  it.each(['/zh/case?page=0', '/zh/case?page=01', '/zh/case?page=abc', '/zh/case?page=', '/en/case?page=1&page=2'])(
    'answers the misspelled page value %s with a 404 as well',
    async (path) => {
      const response = await run(path);
      expect(response.status).toBe(404);
    },
  );

  it.each(['/zh/case', '/en/case', '/zh/case?page=1', '/zh/case/'])(
    'lets the real list page %s through',
    async (path) => {
      const response = await run(path);
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-next')).toBe('1');
    },
  );

  // Filtered and search views are already excluded from the index and may
  // legitimately be empty, so they keep answering from the page itself.
  it.each([
    '/zh/case?q=%E5%8F%B0%E8%BD%A6%E7%82%89&page=9',
    '/zh/case?equipment=%E5%8F%B0%E8%BD%A6%E7%82%89&page=4',
    '/zh/case?sort=updated&page=8',
    '/zh/case?type=proposal&page=5',
  ])('does not intercept the filtered view %s', async (path) => {
    const response = await run(path);
    expect(response.status).toBe(200);
  });

  it('keeps the boundary tied to the approved case lists', () => {
    // If a later batch adds cases, this is the number the middleware allows.
    expect(lastPage(PUBLIC_CASE_SLUGS.size)).toBeGreaterThanOrEqual(1);
    expect(lastPage(PUBLIC_ENGLISH_CASE_SLUGS.size)).toBeGreaterThanOrEqual(1);
    expect(PUBLIC_CASE_SLUGS.size).toBeLessThanOrEqual(CASE_PAGE_SIZE * lastPage(PUBLIC_CASE_SLUGS.size));
  });
});
