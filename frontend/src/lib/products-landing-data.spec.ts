import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getAdditionalFurnace } from './additional-furnaces';
import { describe, expect, it } from 'vitest';

import { getHeatTreatmentLine } from './heat-treatment-lines';

import { PRODUCT_CENTER_CATEGORIES } from '@/constants/product-categories';

import {
  continuousFurnaceCards,
  periodicFurnaceCards,
  productCenterProductionLines,
} from './products-landing-data';

describe('Chinese product-center landing data', () => {
  it('connects every production-line card to reviewed detail content', () => {
    expect(productCenterProductionLines).toHaveLength(11);
    expect(new Set(productCenterProductionLines.map((card) => card.href)).size).toBe(11);
    for (const card of productCenterProductionLines) {
      const line = getHeatTreatmentLine(card.id);
      expect(line).toBeTruthy();
      expect(card.detailStatus).toBe('published');
      expect(card.href).toBe(`/zh/products/detail/${line!.slug}`);
      expect(card.title).toBe(line!.cardTitle);
      expect(card.imageLabel).toBe('设备场景示意');
      expect(card.temperatureNote).toBeTruthy();
      expect(card.applicable).toBeTruthy();
      expect(card.process).toBeTruthy();
      expect(card.compositionHref).toBe(`${card.href}#process`);
    }
    expect([
      ...productCenterProductionLines,
      ...periodicFurnaceCards,
      ...continuousFurnaceCards,
    ]).toHaveLength(23);
  });

  it('preserves existing line identities and furnace routes', () => {
    expect(productCenterProductionLines.map((card) => card.id)).toEqual([
      'track-shoe-press-quench-line',
      'forging-waste-heat-qt-line',
      'fastener-quench-temper-line',
      'mesh-belt-carbonitriding-line',
      'multi-furnace-quench-cell',
      'aluminum-solution-aging-line',
      'aluminum-forging-heating-line',
      'cylinder-curing-line',
      'roller-mesh-belt-line',
      'copper-wire-annealing-line',
      'annealing-solution-line',
    ]);
    const categories = new Set(PRODUCT_CENTER_CATEGORIES.map((product) => product.slug));
    for (const card of [...periodicFurnaceCards, ...continuousFurnaceCards]) {
      expect(categories.has(card.id) || Boolean(getAdditionalFurnace(card.id))).toBe(true);
      expect(card.workpiece).toBeTruthy();
      expect(card.handling).toContain(card.fieldValue);
      expect(card.href).toBe(`/zh/products/detail/${card.id}`);
    }
  });

  it('uses existing furnace images with descriptive alternatives', () => {
    for (const card of [...periodicFurnaceCards, ...continuousFurnaceCards]) {
      expect(existsSync(join(process.cwd(), 'public', card.image))).toBe(true);
      expect(card.imageAlt).toBeTruthy();
    }
  });

  it('keeps the requested furnace groups and order', () => {
    expect(continuousFurnaceCards[0].handling).toContain('连续处理');
    expect(continuousFurnaceCards[0].handling).not.toContain('批次');
    expect(periodicFurnaceCards.map((card) => card.name)).toEqual([
      '箱式炉',
      '台车炉',
      '井式炉',
      '罩式炉',
      '叉车炉',
      '升降式炉',
      '氮化炉',
    ]);
    expect(continuousFurnaceCards.map((card) => card.name)).toEqual([
      '网带炉',
      '推杆炉',
      '辊底炉',
      '转底炉',
      '步进炉',
    ]);
    const originalCards = [...periodicFurnaceCards.slice(0, 4), ...continuousFurnaceCards.slice(0, 4)];
    expect(originalCards.map((card) => card.fieldValue)).toEqual([
      '炉门装卸', '台车进出', '垂直吊装', '炉罩升降', '网带输送', '料盘推进', '辊道输送', '炉底旋转',
    ]);
  });
});
