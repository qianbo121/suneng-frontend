import { describe, expect, it } from 'vitest';
import { getHomeProductionLines, homeLineMotionCopyEn } from './home-products-localized';
import { getStaticProductBySlug } from '@/constants/static-products';
import { isZhOnlyPath } from '@/lib/i18n/zh-only';
import { productCenterProductionLines } from './products-landing-data';
import { productionLineAnimationConfig } from './production-line-animation-config';

describe('locale-specific homepage production line selection', () => {
  it('provides every product-list animation with all English stages and its process note', () => {
    for (const line of productCenterProductionLines) {
      const motion = homeLineMotionCopyEn[line.id];
      expect(motion, `Missing English animation captions for ${line.id}`).toBeDefined();
      expect(motion.stages).toHaveLength(line.steps.length);
      expect(motion.stages).toHaveLength(productionLineAnimationConfig[line.id].stages.length);
      for (const text of [...motion.stages, motion.note]) {
        expect(text.trim()).not.toBe('');
        expect(text).not.toMatch(/[\u3400-\u9fff]/);
      }
    }
  });
  it('keeps approved homepage selections while allowing their completed English details', () => {
    const chinese = getHomeProductionLines('zh');
    expect(chinese.map((line) => line.id)).toEqual([
      'track-shoe-press-quench-line',
      'forging-waste-heat-qt-line',
      'fastener-quench-temper-line',
    ]);
    for (const line of chinese) {
      expect(isZhOnlyPath(line.href)).toBe(false);
    }
    expect(getHomeProductionLines('en').map((line) => line.id)).toEqual([
      'track-shoe-press-quench-line',
      'forging-waste-heat-qt-line',
      'fastener-quench-temper-line',
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
