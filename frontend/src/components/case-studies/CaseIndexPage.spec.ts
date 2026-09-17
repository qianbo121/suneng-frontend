import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  cache: (fn: () => unknown) => {
    let value: unknown;
    return () => (value ??= fn());
  },
}));
import { CaseIndexPage } from './CaseIndexPage';
import { getCaseOptions, getPublicCases } from '@/lib/cases/server';
import { parseCaseQuery } from '@/lib/cases/query';

const render = (params: Record<string, string>) =>
  renderToStaticMarkup(createElement(CaseIndexPage, { query: parseCaseQuery(params) }));
const shortcuts = (html: string) =>
  [...html.split('aria-label="常用炉型"')[1].split('</nav>')[0].matchAll(/<a [^>]*>([^<]*)<\/a>/g)].map(
    (match) => match[1],
  );

describe('case index filters', () => {
  it('offers only filters and furnace shortcuts that can narrow the public records', () => {
    const html = render({});
    const types = new Set(getPublicCases().map((item) => item.contentType));
    expect(html.includes('name="type"')).toBe(types.size > 1);
    const labels = shortcuts(html);
    expect(labels[0]).toBe('全部炉型');
    for (const label of labels.slice(1)) expect(getCaseOptions().equipment).toContain(label);
  });

  it('keeps an active filter visible so the reader can clear it', () => {
    const html = render({ type: 'proposal', equipment: '台车炉' });
    expect(html).toContain('name="type"');
    expect(shortcuts(html)).toContain('台车炉');
  });
});
