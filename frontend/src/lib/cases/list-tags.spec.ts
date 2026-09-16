import { describe, expect, it } from 'vitest';
import { caseFactTag, caseListPresentation } from './list-tags';
import { toCaseCard } from './query';
import type { CaseMeta } from './types';
import comparison from '../../../content/cases/alloy-bar-plate-handling-202607-proposal.json';

describe('case list feature tags', () => {
  it('keeps separate furnace meanings in the summary without changing source facts', () => {
    const item = toCaseCard(comparison as CaseMeta);
    const before = JSON.stringify(item);
    const display = caseListPresentation(item);
    expect(display.tags).toEqual(['端进侧出', '行车装料']);
    expect(display.summary).toContain('棒料斜底加热炉采用端进侧出');
    expect(display.summary).toContain('板卷罩式退火炉采用行车装料');
    expect(display.summary).toContain('讨论稿');
    expect(JSON.stringify(item)).toBe(before);
  });

  it('retains numerical objects, units and proposal limitations', () => {
    expect(caseFactTag({ label: '记录通道', value: '4', unit: '通道', attribute: '方案参数' }))
      .toBe('4通道记录（方案）');
    expect(caseFactTag({ label: '均匀性约定', value: '≤±3', unit: '℃', attribute: '方案参数' }))
      .toBe('均匀性约定 ≤±3℃');
  });

  it('does not strip optional equipment or customer supply boundaries', () => {
    expect(caseFactTag({ label: '选配出料方式', value: '行车装料', attribute: '方案参数' }))
      .toBe('方案选配出料方式 行车装料');
    expect(caseFactTag({ label: '冷却系统', value: '用户自备', attribute: '方案参数' }))
      .toBe('方案冷却系统 用户自备');
    expect(caseFactTag({ label: 'φ1100方案氮气范围', value: '苏能采购制氮机', attribute: '方案参数' }))
      .toBe('φ1100方案氮气范围 苏能采购制氮机');
  });
});
