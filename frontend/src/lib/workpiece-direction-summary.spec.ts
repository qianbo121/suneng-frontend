import { describe, expect, it } from 'vitest';
import { getWorkpieceBoundarySummary } from './workpiece-direction-summary';

describe('workpiece boundary display summaries', () => {
  it('keeps changed or unfamiliar engineering requirements fully visible', () => {
    const boundary = '仅在牌号和图纸允许时；新增冷却限制必须保留。';
    expect(getWorkpieceBoundarySummary(boundary)).toBe(boundary);
  });

  it('keeps the ageing prerequisite visible without opening the full conditions', () => {
    const summary = getWorkpieceBoundarySummary(
      '仅适用于经固溶淬火并按产品标准要求人工时效的铝合金气瓶。',
    );
    expect(summary).toContain('固溶淬火后');
    expect(summary).toContain('按产品标准要求');
  });

  it('does not turn a standard-dependent dehydrogenation process into a universal step', () => {
    const summary = getWorkpieceBoundarySummary(
      '仅适用于电镀工艺引入氢脆风险、且标准或客户规范要求去氢的钢制螺母。',
    );
    expect(summary).toContain('电镀引入氢脆风险');
    expect(summary).toContain('标准或客户规范要求');
  });
});
