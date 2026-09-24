import { describe, expect, it } from 'vitest';
import { englishProductionLines } from './english-production-lines';
import { getProductionLineContent } from './production-line-content';
import { getEnglishLineProcess, getEnglishProductionLineContent, translateLineValue } from './production-line-content-en';
import { getLineProcessSteps, productionLineProcessMaps } from './production-line-process-map';
import { productCenterProductionLines } from './products-landing-data';

// Text can change language; assets, anchors, IDs, dimensions and structure cannot.
function expectSameStructure(source: unknown, english: unknown) {
  if (typeof source === 'string') {
    expect(typeof english).toBe('string');
    expect(english).not.toMatch(/[\u3400-\u9fff]/);
    if (!/[\u3400-\u9fff]/.test(source)) {
      expect(english).toBe(source.replace(/^\/zh(?=\/|$)/, '/en').replace(/^\/downloads\/heat-treatment-lines\/([^/]+\.txt)$/, '/downloads/heat-treatment-lines/en/$1'));
    }
  } else if (Array.isArray(source)) {
    expect(english).toHaveLength(source.length);
    source.forEach((value, i) => expectSameStructure(value, (english as unknown[])[i]));
  } else if (source && typeof source === 'object') {
    expect(Object.keys(english as object)).toEqual(Object.keys(source));
    Object.entries(source).forEach(([key, value]) => expectSameStructure(value, (english as Record<string, unknown>)[key]));
  } else {
    expect(english).toEqual(source);
  }
}

describe('English production pages preserve the Chinese page structure', () => {
  it.each(englishProductionLines)('$slug preserves every section, table, image and control binding', ({ slug }) => {
    const source = getProductionLineContent(slug)!;
    const snapshot = JSON.stringify(source);
    expectSameStructure(source, getEnglishProductionLineContent(slug));
    const process = getEnglishLineProcess(slug);
    expectSameStructure(productionLineProcessMaps[slug], process.model);
    expectSameStructure(getLineProcessSteps(source), process.steps);
    expect(JSON.stringify(source)).toBe(snapshot);
  });

  it('retains all eleven carousel cards and their complete process flows', () => {
    expectSameStructure(productCenterProductionLines, translateLineValue(productCenterProductionLines));
  });

  it('keeps optional post-quench cleaning in the fastener process before tempering', () => {
    const steps = getEnglishLineProcess('fastener-quench-temper-line').steps;
    expect(steps.slice(2, 5).map((step) => step.zone)).toEqual(['quench', 'wash', 'temper']);
    expect(steps[3].optional).toBe(true);
  });
});
