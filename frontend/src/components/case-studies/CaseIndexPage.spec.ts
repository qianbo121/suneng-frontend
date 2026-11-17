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
import { getCaseResults, getCaseFilterOptions, getPublicCases } from '@/lib/cases/server';
import { parseCaseQuery } from '@/lib/cases/query';

const render = (params: Record<string, string>) =>
  renderToStaticMarkup(createElement(CaseIndexPage, { query: parseCaseQuery(params) }));

describe('case index filters', () => {
  it('counts each case once per workpiece group and respects the other filters', () => {
    const query = parseCaseQuery({ equipment: '网带炉' });
    const matches = getPublicCases().filter((item) => item.equipment.includes('网带炉'));
    const options = getCaseFilterOptions(query, 'workpiece');
    expect(options[0]).toEqual({ value: '', count: matches.length });
    expect(getCaseFilterOptions(parseCaseQuery({}), 'workpiece')).toEqual([
      {value: '', count: 11}, {value: '气瓶', count: 1}, {value: '轴杆齿轮', count: 1},
      {value: '板带卷材', count: 1}, {value: '紧固批量件', count: 2},
    ]);
    const result = getCaseResults(parseCaseQuery({ workpiece: '紧固批量件' }));
    expect(result.items.map(item => item.slug).sort()).toEqual(['fastener-mesh-belt-quenching-carburizing', 'standard-parts-capacity']);
    expect(options.some(option => option.value === '板带卷材')).toBe(false);
  });

  it('keeps bookmarked and empty filters visible and clearable', () => {
    const html = render({ type: 'proposal', equipment: '旧炉型' });
    expect(html).toContain('<h3>更多筛选</h3>');
    expect(html).toContain('<summary>发布时间</summary>');
    expect(html).toContain('<span>旧炉型</span><small>0</small>');
    expect(html).toContain('移除筛选：方案记录');
    expect(html).toContain('>清除</a>');
    expect(getCaseResults(parseCaseQuery({ workpiece: '曲轴' })).items.map(i => i.slug)).toEqual(['crankshaft-annual-output']);
  });
});
