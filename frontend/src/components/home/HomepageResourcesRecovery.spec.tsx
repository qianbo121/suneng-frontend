// @vitest-environment jsdom
import { act, createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HomepageResourcesRecovery } from './HomepageResourcesRecovery';

const router = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('next/link', () => ({
  default: ({ children, ...props }: { children: ReactNode; href: string }) =>
    createElement('a', props, children),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root;
let host: HTMLDivElement;

beforeEach(() => {
  vi.useFakeTimers();
  router.refresh.mockReset();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.useRealTimers();
});

describe('homepage resources recovery', () => {
  it('automatically retries a slow initial read and stops when the resources arrive', async () => {
    await act(async () => root.render(<HomepageResourcesRecovery locale="zh" />));
    expect(host.querySelector('[role="status"]')?.textContent).toContain('正在加载');
    await act(async () => vi.advanceTimersByTimeAsync(1499));
    expect(router.refresh).not.toHaveBeenCalled();
    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(router.refresh).toHaveBeenCalledTimes(1);

    // A successful server refresh replaces only the fallback component.
    await act(async () => root.render(<div>已加载的资料卡片</div>));
    await act(async () => vi.advanceTimersByTimeAsync(30000));
    expect(host.textContent).toBe('已加载的资料卡片');
    expect(router.refresh).toHaveBeenCalledTimes(1);
  });

  it('caps automatic retries and offers a manual retry without navigating away', async () => {
    await act(async () => root.render(<HomepageResourcesRecovery locale="zh" />));
    for (const delay of [1500, 4000, 8000]) {
      await act(async () => vi.advanceTimersByTimeAsync(delay));
    }
    expect(router.refresh).toHaveBeenCalledTimes(3);
    expect(host.querySelector('[role="status"]')?.textContent).toContain('请重试');
    await act(async () => vi.advanceTimersByTimeAsync(60000));
    expect(router.refresh).toHaveBeenCalledTimes(3);
    await act(async () => host.querySelector('button')!.click());
    expect(router.refresh).toHaveBeenCalledTimes(4);
    expect(host.querySelector('[role="status"]')?.textContent).toContain('正在加载');
  });

  it('cancels pending work when leaving the page', async () => {
    await act(async () => root.render(<HomepageResourcesRecovery locale="zh" />));
    await act(async () => root.render(null));
    await act(async () => vi.advanceTimersByTimeAsync(30000));
    expect(router.refresh).not.toHaveBeenCalled();
  });

  it('retains the English resource entry and loading copy', async () => {
    await act(async () => root.render(<HomepageResourcesRecovery locale="en" />));
    expect(host.querySelector('[role="status"]')?.textContent).toBe('Loading technical resources…');
    expect(host.querySelector('a')?.getAttribute('href')).toBe('/en/news');
  });
});
