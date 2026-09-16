import { describe, expect, it } from 'vitest';
import { getHomeProductionLines, homeLineMotionCopyEn } from './home-products-localized';
import { getStaticProductBySlug } from '@/constants/static-products';
import { isZhOnlyPath } from '@/lib/i18n/zh-only';

describe('locale-specific homepage production line selection', () => {
  it('keeps the approved Chinese spotlights without advertising unpublished English details', () => {
    const chinese = getHomeProductionLines('zh');
    expect(chinese.map((line) => line.id)).toEqual([
      'track-shoe-press-quench-line',
      'forging-waste-heat-qt-line',
      'fastener-quench-temper-line',
    ]);
    for (const line of chinese) {
      expect(isZhOnlyPath(line.href)).toBe(true);
    }
    expect(getHomeProductionLines('en').map((line) => line.id)).toEqual([
      'roller-mesh-belt-line',
      'copper-wire-annealing-line',
      'annealing-solution-line',
    ]);
  });

  it('gives every English spotlight a published English detail and matching animation captions', () => {
    for (const line of getHomeProductionLines('en')) {
      expect(line.href).toBe(`/en/products/detail/${line.id}`);
      expect(isZhOnlyPath(line.href)).toBe(false);
      expect(getStaticProductBySlug(line.id)).toBeDefined();
      const motion = homeLineMotionCopyEn[line.id];
      expect(motion).toBeDefined();
      expect(motion.stages).toHaveLength(line.steps.length);
      expect([line.title, line.applicable, line.summary, line.imageAlt, ...line.steps,
        ...motion.stages, motion.note].join(' ')).not.toMatch(/[\u3400-\u9fff]/);
    }
  });
});
