import { describe, expect, it, vi } from 'vitest';
import { isPublicNewsView, registerNewsSessionView } from './news-view-session';
function store() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) || null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
  };
}

describe('news view session receipt', () => {
  it('counts a real detail opening once across concurrent effects and repeat visits', async () => {
    const storage = store();
    const send = vi.fn(async () => true);
    await Promise.all([
      registerNewsSessionView(10001, storage, send),
      registerNewsSessionView(10001, storage, send),
    ]);
    await registerNewsSessionView(10001, storage, send);
    expect(send).toHaveBeenCalledTimes(1);
    vi.resetModules();
    const reloaded = await import('./news-view-session');
    await reloaded.registerNewsSessionView(10001, storage, send);
    expect(send).toHaveBeenCalledTimes(1);
  });
  it('retries failed statistics without marking them as counted', async () => {
    const storage = store();
    const send = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    await registerNewsSessionView(10002, storage, send);
    await registerNewsSessionView(10002, storage, send);
    expect(send).toHaveBeenCalledTimes(2);
  });
  it('does not register lists, hidden/pre-rendered documents or admin previews', () => {
    expect(isPublicNewsView('/zh/news/77', '', true)).toBe(true);
    expect(isPublicNewsView('/zh/news', '', true)).toBe(false);
    expect(isPublicNewsView('/zh/news/77', '', false)).toBe(false);
    expect(isPublicNewsView('/zh/news/77', '', true, true)).toBe(false);
    expect(isPublicNewsView('/zh/news/77', '?preview=1', true)).toBe(false);
    expect(isPublicNewsView('/admin/news/77', '', true)).toBe(false);
  });
});
