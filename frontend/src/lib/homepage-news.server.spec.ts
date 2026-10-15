import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ts from 'typescript';
import { getNewsDecisionCenterData } from '@/lib/news-decision-center.server';
import { getHomepageNewsData } from './homepage-news.server';
import type { NewsListCardItem } from '@/types/news';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/news-decision-center.server', () => ({ getNewsDecisionCenterData: vi.fn() }));

type NewsResult = Awaited<ReturnType<typeof getNewsDecisionCenterData>>;
const success: NewsResult = { data: [{ id: 1 } as NewsListCardItem], error: null };

function pendingRead() {
  let resolve!: (value: NewsResult) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<NewsResult>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(getNewsDecisionCenterData).mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('homepage article wait budget', () => {
  it.each(['zh', 'en'] as const)('keeps available %s data and the shared cache', async (locale) => {
    vi.mocked(getNewsDecisionCenterData).mockResolvedValue(success);
    await expect(getHomepageNewsData(locale)).resolves.toBe(success);
    expect(getNewsDecisionCenterData).toHaveBeenCalledWith(locale);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('waits for a normal response arriving before the one-second deadline', async () => {
    const read = pendingRead();
    vi.mocked(getNewsDecisionCenterData).mockReturnValue(read.promise);
    let settled = false;
    const result = getHomepageNewsData('zh').then((value) => { settled = true; return value; });
    await vi.advanceTimersByTimeAsync(999);
    expect(settled).toBe(false);
    read.resolve(success);
    await expect(result).resolves.toBe(success);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('returns the existing unavailable state after one second without cancelling the read', async () => {
    const read = pendingRead();
    vi.mocked(getNewsDecisionCenterData).mockReturnValue(read.promise);
    const result = getHomepageNewsData('zh');
    await vi.advanceTimersByTimeAsync(1000);
    await expect(result).resolves.toMatchObject({ data: null, error: '资料暂时无法加载' });

    // The same shared work can still finish and satisfy a subsequent visit.
    read.resolve(success);
    await expect(getHomepageNewsData('zh')).resolves.toBe(success);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('handles a rejected read immediately without waiting for the deadline', async () => {
    vi.mocked(getNewsDecisionCenterData).mockRejectedValue(new Error('offline'));
    await expect(getHomepageNewsData('zh')).resolves.toMatchObject({ data: null });
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    { data: null, error: 'offline' },
    { data: [], error: null },
  ])('preserves unavailable or empty article results for the existing fallback: %j', async (result) => {
    vi.mocked(getNewsDecisionCenterData).mockResolvedValue(result);
    await expect(getHomepageNewsData('zh')).resolves.toBe(result);
  });

  it('handles a late rejection after timeout and allows the next request to recover', async () => {
    const read = pendingRead();
    vi.mocked(getNewsDecisionCenterData).mockReturnValueOnce(read.promise).mockResolvedValue(success);
    const result = getHomepageNewsData('zh');
    await vi.advanceTimersByTimeAsync(1000);
    await expect(result).resolves.toMatchObject({ data: null });
    read.reject(new Error('late failure'));
    await vi.advanceTimersByTimeAsync(0);
    await expect(getHomepageNewsData('zh')).resolves.toBe(success);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('fixes the homepage rendering mode independently of build-time article availability', () => {
    const source = ts.createSourceFile(
      'page.tsx',
      readFileSync(new URL('../app/[locale]/page.tsx', import.meta.url), 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const routeConfig = new Map<string, string>();
    for (const statement of source.statements) {
      if (!ts.isVariableStatement(statement)
        || !statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.initializer) {
          routeConfig.set(declaration.name.text, declaration.initializer.getText(source));
        }
      }
    }
    expect(routeConfig.get('dynamic')).toBe("'force-dynamic'");
    // Do not disable the explicit shared article cache along with whole pages.
    expect(routeConfig.has('fetchCache')).toBe(false);
    expect(routeConfig.has('revalidate')).toBe(false);
  });
});
