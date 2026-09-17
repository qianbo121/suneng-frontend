// @vitest-environment jsdom
import { act, createElement as h, Fragment, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode; prefetch?: boolean }) => {
    const attributes: Record<string, unknown> = { ...rest };
    delete attributes.prefetch;
    return h('a', { href, ...attributes }, children);
  },
}));
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => h('img', { src, alt }),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { NewsListFilterControls, NewsListResults, NewsListScope } from './NewsListInteractive';
import type { NewsListCardItem } from '@/types/news';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const card = (id: number, topic: string) =>
  ({
    id,
    slug: `article-${id}`,
    image: '/x.webp',
    title: { zh: `标题${id}`, en: '' },
    summary: { zh: `摘要${id}`, en: '' },
    category: { zh: '', en: '' },
    date: `2026-09-${String(10 + id).padStart(2, '0')}`,
    updatedAt: null,
    listTopic: topic,
    listFurnaces: [],
    listDisplayDate: '2026-09-01',
  }) as unknown as NewsListCardItem;

// Each call builds fresh props, as a router navigation does when it renders the page again.
const page = () =>
  h(NewsListScope, {
    locale: 'zh',
    cards: [card(1, 'procurement'), card(2, 'quality'), card(3, 'quality'), card(4, 'operations')],
    initialState: { topic: 'all', furnace: 'all', sort: 'recommended', page: 1 },
    pageSize: 10,
    pageTitles: ['第 1 页'],
    filteredTitle: '筛选结果',
    className: 'scope',
    children: h(Fragment, null, h(NewsListFilterControls), h(NewsListResults)),
  });

let container: HTMLDivElement;
let root: Root;
const shown = () => [...container.querySelectorAll('[data-news-id]')].map((node) => node.getAttribute('data-news-id'));
const activeTopic = () => container.querySelector('nav a[aria-current="page"]')?.getAttribute('href');
const click = (href: string) =>
  act(async () => {
    const link = [...container.querySelectorAll('a')].find((anchor) => anchor.getAttribute('href') === href);
    link?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, detail: 1 }));
  });

beforeEach(async () => {
  window.history.replaceState(null, '', '/zh/news');
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(page()));
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

describe('news list switching in the browser', () => {
  it('filters in place and follows back navigation', async () => {
    expect(shown()).toEqual(['4', '3', '2', '1']);
    await click('/zh/news?topic=procurement');
    expect(window.location.search).toBe('?topic=procurement');
    expect(shown()).toEqual(['1']);

    await act(async () => {
      window.history.replaceState(null, '', '/zh/news');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(shown()).toEqual(['4', '3', '2', '1']);
  });

  it('resets to the address bar when a link outside the list opens the plain list', async () => {
    await click('/zh/news?topic=procurement');
    expect(shown()).toEqual(['1']);

    // The site header link is a router navigation: the router records the new
    // address (no popstate) and renders the same page with fresh props.
    await act(async () => {
      window.history.pushState({ __NA: true }, '', '/zh/news');
      root.render(page());
    });
    expect(window.location.search).toBe('');
    expect(shown()).toEqual(['4', '3', '2', '1']);
    expect(activeTopic()).toBe('/zh/news');
  });
});
