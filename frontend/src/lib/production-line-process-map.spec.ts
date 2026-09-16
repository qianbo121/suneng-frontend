import { describe, expect, it } from 'vitest';
import { productionLinePages } from './production-line-content';
import { getLineProcessSteps, productionLineProcessMaps } from './production-line-process-map';

describe('production line process / equipment correspondence', () => {
  it('covers all eleven public lines', () => {
    expect(productionLinePages).toHaveLength(11);
    expect(Object.keys(productionLineProcessMaps).sort()).toEqual(
      productionLinePages.map((page) => page.pageId).sort(),
    );
  });

  it.each(productionLinePages)(
    '$pageId retains its reviewed route and matches its exact source image',
    (page) => {
      const map = productionLineProcessMaps[page.pageId];
      const process = page.sections.process;
      const source =
        process.mode === 'linear'
          ? process.stages.map((stage) => stage.title)
          : process.routes![0].steps;
      const steps = getLineProcessSteps(page);
      expect(map.steps).toHaveLength(source.length);
      expect(page.images[process.imageAssetId!].src.split('/').at(-1)).toBe(map.imageFile);
      expect(
        steps.filter((item) => item.id !== 'post-quench-cleaning').map((item) => item.title),
      ).toEqual(source);
      expect(new Set(steps.map((item) => item.id)).size).toBe(steps.length);
      expect(map.initial).toBeLessThan(steps.length);
      for (const item of steps) {
        expect(item.description.length).toBeGreaterThan(8);
        if (item.zone) expect(map.zones.some((zone) => zone.id === item.zone)).toBe(true);
        else expect(item.locationNote).toBeTruthy();
      }
      for (const {
        box: [x, y, width, height],
      } of map.zones) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(width).toBeGreaterThan(0);
        expect(height).toBeGreaterThan(0);
        expect(x + width).toBeLessThanOrEqual(100);
        expect(y + height).toBeLessThanOrEqual(100);
      }
    },
  );

  it('places optional fastener post-quench cleaning before tempering', () => {
    const page = productionLinePages.find((item) => item.pageId === 'fastener-quench-temper-line')!;
    const steps = getLineProcessSteps(page);
    expect(steps.slice(2, 5).map((item) => item.zone)).toEqual(['quench', 'wash', 'temper']);
    expect(steps[3].optional).toBe(true);
    expect(page.sections.process.note).toContain('清洗');
  });

  it('keeps shared-furnace scheduling and unpictured work off the equipment hotspots', () => {
    const map = productionLineProcessMaps['multi-furnace-quench-cell'];
    expect(map.movement).toContain('不依次通过每台炉');
    expect([0, 3, 6, 7].every((index) => map.steps[index].zone === undefined)).toBe(true);
    expect(map.steps[5].zone).toBe('quench');
  });

  it('keeps vertical quenching and independent aging distinct', () => {
    const map = productionLineProcessMaps['aluminum-solution-aging-line'];
    expect(map.movement).toContain('向下转移');
    expect(map.steps[1].zone).toBe('solution');
    expect(map.steps[3].zone).toBe('quench');
    expect(map.steps[4].zone).toBe('quench');
    expect(map.steps[6].zone).toBe('aging');
  });
});
