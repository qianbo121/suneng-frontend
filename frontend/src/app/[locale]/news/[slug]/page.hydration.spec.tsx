// @vitest-environment jsdom
import { createRequire } from 'node:module';
import { Fragment, isValidElement, type ReactElement, type ReactNode } from 'react';
import { expect, it, vi } from 'vitest';
import type { NewsApiItem } from '@/types/news';
import NewsDetailPage from './page';
import { getNewsDetailPageData } from '@/lib/news';

vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({ ...(await original<typeof import('react')>()), cache: (fn: unknown) => fn }));
vi.mock('@/lib/news', async (original) => ({
  ...(await original<typeof import('@/lib/news')>()),
  getNewsDetailPageData: vi.fn(),
}));
vi.mock('@/lib/news-decision-center.server', () => ({
  getNewsDecisionCenterData: async () => ({ data: [], error: null }),
}));

// App Router uses Next's bundled renderer, not the root React 18 dependency.
const require = createRequire(import.meta.url);
const runtime = require('next/dist/compiled/react') as typeof import('react');
const { hydrateRoot } = require('next/dist/compiled/react-dom/client') as typeof import('react-dom/client');
const article: NewsApiItem = {
  id: 99007, categoryId: 1, slug: 'hydration-replay-fixture',
  titleZh: '文章加载验收', titleEn: 'Article loading acceptance',
  summaryZh: '验收用摘要', summaryEn: 'Acceptance summary',
  contentZh: '<p>验收用正文</p>', contentEn: '<p>Acceptance body</p>',
  publishDate: '2026-10-01T00:00:00Z', status: 'published', isPublished: true,
};

type Element = ReactElement<{ children?: ReactNode; className?: string }>;
function findMain(node: ReactNode): Element | undefined {
  if (Array.isArray(node)) return node.map(findMain).find(Boolean);
  if (!isValidElement<{ children?: ReactNode; className?: string }>(node)) return;
  if (node.type === 'main') return node;
  return findMain(node.props.children);
}

it.each(['zh', 'en'])('preserves the %s article DOM when its sidebar resolves during hydration replay', async (locale) => {
  vi.mocked(getNewsDetailPageData).mockResolvedValue({ article, error: null });
  const page = await NewsDetailPage({ params: Promise.resolve({ locale, slug: article.slug }) });
  const main = findMain(page);
  expect(main).toBeDefined();
  const container = document.createElement('div');
  container.innerHTML = '<main><article>Article fixture</article><aside>Sidebar fixture</aside></main>';
  document.body.append(container);
  const originalMain = container.querySelector('main');
  const originalArticle = container.querySelector('article');
  const errors: unknown[] = [];
  const side = runtime.createElement('aside', { key: 'sidebar-fixture' }, 'Sidebar fixture');
  const chunk = {
    status: 'pending', value: null as { default: ReactNode } | null,
    listeners: [] as ((value: { default: ReactNode }) => void)[],
    then(resolve: (value: { default: ReactNode }) => void) {
      if (this.status === 'fulfilled') resolve(this.value!);
      else this.listeners.push(resolve);
    },
  };
  let read = false;
  const lazySide = runtime.lazy(() => {
    read = true;
    queueMicrotask(() => {
      chunk.status = 'fulfilled'; chunk.value = { default: side };
      chunk.listeners.splice(0).forEach((resolve) => resolve(chunk.value!));
    });
    // Flight lazy nodes resolve to elements, unlike public lazy components.
    return chunk as unknown as Promise<{ default: React.ComponentType }>;
  }) as unknown as ReactNode;
  // Retain the real page's grouping and keys. Only its article/side contents
  // are replaced with a controlled late Flight child; no key is added here.
  function delayedChildren(node: ReactNode): ReactNode {
    if (Array.isArray(node)) return node.map(delayedChildren);
    if (!isValidElement<{ children?: ReactNode }>(node)) return node;
    if (node.type === 'article') return runtime.createElement('article', { key: node.key ?? 'article-fixture' }, 'Article fixture');
    if (node.type === 'aside') return lazySide;
    if (node.type !== Fragment) throw new Error('Unexpected article container; update the replay fixture');
    return runtime.createElement(runtime.Fragment, { key: node.key }, delayedChildren(node.props.children));
  }
  let committed = false;
  function CommitProbe() { runtime.useEffect(() => { committed = true; }, []); return null; }
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    runtime.startTransition(() => {
      root = hydrateRoot(container, runtime.createElement(runtime.Fragment, null,
        runtime.createElement('main', null, delayedChildren(main!.props.children)),
        runtime.createElement(CommitProbe)), { onRecoverableError: (error) => errors.push(error) });
    });
    await vi.waitFor(() => expect(committed).toBe(true));
    expect(read).toBe(true);
    expect(errors).toEqual([]);
    expect(container.querySelector('main')).toBe(originalMain);
    expect(container.querySelector('article')).toBe(originalArticle);
    expect(container.innerHTML).toBe('<main><article>Article fixture</article><aside>Sidebar fixture</aside></main>');
  } finally {
    root?.unmount(); container.remove();
  }
});
