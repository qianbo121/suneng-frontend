import { describe, expect, it } from 'vitest';
import { productionLinePages } from '@/lib/production-line-content';
import { getLineProcessSteps, productionLineProcessMaps } from '@/lib/production-line-process-map';
import { getProcessAnnotation } from './production-line-annotations';

describe('equipment silhouette coverage', () => {
  it.each(productionLinePages)('$pageId has a usable contour for every linked device', (page) => {
    const steps = getLineProcessSteps(page);
    const zones = productionLineProcessMaps[page.pageId].zones.filter((zone) =>
      steps.some((step) => step.zone === zone.id),
    );
    for (const zone of zones) {
      const outlines = getProcessAnnotation(page.pageId, zone).outlines;
      expect(outlines, `${page.pageId}/${zone.id}`).toBeDefined();
      expect(outlines!.length).toBeGreaterThan(0);
      for (const outline of outlines!) {
        expect(outline.length).toBeGreaterThan(3);
        for (const point of outline) {
          expect(point).toHaveLength(2);
          for (const coordinate of point) {
            expect(Number.isFinite(coordinate)).toBe(true);
            expect(coordinate).toBeGreaterThanOrEqual(0);
            expect(coordinate).toBeLessThanOrEqual(100);
          }
        }
        const area =
          Math.abs(
            outline.reduce((sum, [x, y], index) => {
              const next = outline[(index + 1) % outline.length];
              return sum + x * next[1] - next[0] * y;
            }, 0),
          ) / 2;
        expect(area).toBeGreaterThan(1);
      }
    }
  });
});
