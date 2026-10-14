// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { NavigationLink } from './NavigationLink';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
vi.mock('next/link', () => ({
  default: ({ prefetch, ...props }: ComponentProps<'a'> & { prefetch?: boolean | null }) =>
    createElement('a', { ...props, 'data-prefetch': String(prefetch) }),
}));
let root: Root | undefined;
let container: HTMLDivElement;
afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  root = undefined;
  container?.remove();
});
async function render(props: ComponentProps<typeof NavigationLink> = { href: '/zh/news' }) {
  if (!root) {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  }
  await act(async () => root?.render(createElement(NavigationLink, props, 'Read')));
  return container.querySelector('a')!;
}
describe('navigation destination loading', () => {
  it.each(['mouseover', 'focusin', 'touchstart'])('waits for %s intent without replacing native links', async (event) => {
    const link = await render();
    expect(link.getAttribute('href')).toBe('/zh/news');
    expect(link.dataset.prefetch).toBe('false');
    await act(async () => { link.dispatchEvent(new Event(event, { bubbles: true })); });
    expect(link.dataset.prefetch).toBe('null');
    expect(link.getAttribute('href')).toBe('/zh/news');
  });
  it('retains caller handlers and explicit prefetch opt-out', async () => {
    const onMouseEnter = vi.fn();
    const onFocus = vi.fn();
    const onTouchStart = vi.fn();
    const link = await render({ href: '/zh/news', prefetch: false, onMouseEnter, onFocus, onTouchStart });
    for (const type of ['mouseover', 'focusin', 'touchstart']) {
      await act(async () => { link.dispatchEvent(new Event(type, { bubbles: true })); });
    }
    expect(onMouseEnter).toHaveBeenCalledOnce();
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onTouchStart).toHaveBeenCalledOnce();
    expect(link.dataset.prefetch).toBe('false');
  });
  it('waits for fresh intent if a destination changes', async () => {
    const link = await render();
    await act(async () => { link.dispatchEvent(new Event('focusin', { bubbles: true })); });
    expect(link.dataset.prefetch).toBe('null');
    const updated = await render({ href: '/en/news' });
    expect(updated.getAttribute('href')).toBe('/en/news');
    expect(updated.dataset.prefetch).toBe('false');
  });
  it('retains an explicit prefetch choice', async () => {
    expect((await render({ href: '/zh/news', prefetch: true })).dataset.prefetch).toBe('true');
  });
});
