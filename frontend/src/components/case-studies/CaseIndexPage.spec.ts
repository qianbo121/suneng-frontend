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
import { getCaseFilterOptions, getPublicCases } from '@/lib/cases/server';
import { parseCaseQuery } from '@/lib/cases/query';

const render = (params: Record<string, string>) =>
  renderToStaticMarkup(createElement(CaseIndexPage, { query: parseCaseQuery(params) }));

describe('case index filters', () => {
  it('counts each case once per workpiece group and respects the other filters', () => {
    const query = parseCaseQuery({ equipment: '网带炉' });
    const matches = getPublicCases().filter((item) => item.equipment.includes('网带炉'));
    const fasteners = matches.filter((item) => item.workpiece.some((value) => ['紧固件','螺丝钉','紧固批量件'].includes(value)));
    const options = getCaseFilterOptions(query, 'workpiece');
    expect(options[0]).toEqual({ value: '', count: matches.length });
    if (fasteners.length) expect(options).toContainEqual({ value: '紧固批量件', count: fasteners.length });
    expect(options.map((option) => option.value)).not.toContain('螺丝钉');
  });

  it('keeps bookmarked and empty filters visible and clearable', () => {
    const html = render({ type: 'proposal', equipment: '旧炉型' });
    expect(html).toContain('<details open=""><summary>炉型</summary>');
    expect(html).toContain('<span>旧炉型</span><small>0</small>');
    expect(html).toContain('重置筛选');
    expect(html).toContain('aria-label="内容类型"');
  });
});
