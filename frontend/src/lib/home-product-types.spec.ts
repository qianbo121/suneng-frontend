import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { homeProductionLines, homeSingleFurnaces } from './home-product-types';
import { productCenterProductionLines } from './products-landing-data';

describe('homepage product types data', () => {
  it('keeps the homepage production-line copy and flows aligned with the reviewed product list', () => {
    for (const home of homeProductionLines) {
      const listed = productCenterProductionLines.find((line) => line.id === home.id);
      expect(listed).toBeTruthy();
      expect(home.title).toBe(listed!.title);
      expect(home.applicable).toBe(listed!.applicable);
      expect(home.summary).toBe(listed!.process);
      expect(home.steps).toEqual(listed!.steps);
      expect(home.accentSteps).toEqual(listed!.accentSteps);
    }
  });

  it('uses the three existing production-line detail routes', () => {
    expect(homeProductionLines.map((item) => item.id)).toEqual([
      'roller-mesh-belt-line',
      'copper-wire-annealing-line',
      'annealing-solution-line',
    ]);

    for (const item of homeProductionLines) {
      expect(item.href).toBe(`/zh/products/detail/${item.id}`);
      expect(item.image).toContain(`/images/products/${item.id}/`);
      expect(item.steps.length).toBeGreaterThanOrEqual(5);
      expect(item.accentSteps.length).toBeGreaterThan(0);
      expect(
        item.accentSteps.every((accentStep) => item.steps.some((step) => step === accentStep)),
      ).toBe(true);
      expect(item.typicalTemperature).toBeGreaterThan(item.minimumTemperature);
      expect(item.typicalTemperature).toBeLessThanOrEqual(item.maximumTemperature);
    }
  });

  it('keeps the approved single-furnace order and wording', () => {
    expect(homeSingleFurnaces.slice(0, 8).map(({ name, description }) => ({ name, description }))).toEqual([
      { name: '箱式炉', description: '中小型件 · 小批量处理' },
      { name: '台车炉', description: '大型重件 · 周期式处理' },
      { name: '井式炉', description: '轴杆长件 · 竖向装炉' },
      { name: '罩式炉', description: '卷材线材 · 整体热处理' },
      { name: '推杆炉', description: '批量工件 · 节拍式处理' },
      { name: '网带炉', description: '小型零件 · 连续处理' },
      { name: '辊底炉', description: '板材棒材 · 连续输送' },
      { name: '转底炉', description: '环形炉底 · 节拍加热' },
    ]);
  });

  it('preserves the original eight mappings and gives all four additions real assets and detail routes', () => {
    const original = ['box', 'trolley', 'pit', 'bell', 'pusher', 'mesh', 'roller', 'rotary'];
    expect(homeSingleFurnaces.slice(0, 8).map((item) => item.animationKind)).toEqual(original);
    expect(homeSingleFurnaces.map((item) => item.id)).toEqual([
      'box-furnace', 'trolley-furnace', 'pit-furnace', 'bell-furnace',
      'pusher-furnace', 'mesh-belt-furnace', 'roller-hearth-furnace', 'rotary-hearth-furnace',
      'shovel-furnace', 'walking-beam-furnace', 'elevator-hearth-furnace', 'gas-nitriding-furnace',
    ]);
    for (const item of homeSingleFurnaces) {
      expect(item.href).toBe(`/zh/products/detail/${item.id}`);
      expect(existsSync(join(process.cwd(), 'public', item.image))).toBe(true);
    }
  });

  it('keeps names, descriptions and image alternatives present for every furnace', () => {
    for (const item of homeSingleFurnaces) {
      expect(item.englishName).toBeTruthy();
      expect(item.nameEn).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(item.descriptionEn).toBeTruthy();
      expect(item.imageAlt).toBeTruthy();
    }
  });
});
