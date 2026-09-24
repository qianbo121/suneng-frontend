import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { industryFurnacePageConfigs } from '@/components/products/industry-furnace-detail-data';
import { ABOUT_ANCHORS, ABOUT_BOUNDARIES, ABOUT_FAQS } from '@/components/about/about-page-data';
import { englishProductionLines } from './english-production-lines';
import { getEnglishProductionLineContent } from './production-line-content-en';
import { localizeCoreValue } from './core-page-localization';

function check(source: unknown, english: unknown) {
  if (typeof source === 'string') {
    expect(english).not.toMatch(/[\u3400-\u9fff]/);
    if (!/[\u3400-\u9fff]/.test(source)) expect(english).toBe(source.replace(/^\/zh(?=\/|$)/, '/en'));
  } else if (Array.isArray(source)) {
    expect(english).toHaveLength(source.length);
    source.forEach((v, i) => check(v, (english as unknown[])[i]));
  } else if (source && typeof source === 'object') {
    expect(Object.keys(english as object)).toEqual(Object.keys(source));
    Object.entries(source).forEach(([k, v]) => check(v, (english as Record<string, unknown>)[k]));
  } else expect(english).toEqual(source);
}

describe('Current core-page localization', () => {
  it('preserves furnace structure, assets, numbers and source objects while translating all source text', () => {
    const snapshot = JSON.stringify(industryFurnacePageConfigs);
    check(industryFurnacePageConfigs, localizeCoreValue(industryFurnacePageConfigs, 'en'));
    expect(localizeCoreValue(industryFurnacePageConfigs, 'zh')).toBe(industryFurnacePageConfigs);
    expect(JSON.stringify(industryFurnacePageConfigs)).toBe(snapshot);
  });
  it('keeps company navigation, scope and FAQ content aligned', () => {
    check([ABOUT_ANCHORS, ABOUT_BOUNDARIES, ABOUT_FAQS], localizeCoreValue([ABOUT_ANCHORS, ABOUT_BOUNDARIES, ABOUT_FAQS], 'en'));
  });
  it('provides an English file for every translated line download, preserving Chinese originals', () => {
    let downloads = 0;
    function walk(v: unknown) {
      if (typeof v === 'string' && v.startsWith('/downloads/')) {
        downloads++;
        expect(v).toContain('/heat-treatment-lines/en/');
        const file = new URL('../../public' + v, import.meta.url);
        expect(existsSync(file)).toBe(true);
        expect(readFileSync(file, 'utf8')).not.toMatch(/[\u3400-\u9fff]/);
        expect(existsSync(new URL('../../public' + v.replace('/en/', '/'), import.meta.url))).toBe(true);
      } else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    }
    englishProductionLines.forEach(line => walk(getEnglishProductionLineContent(line.slug)));
    expect(downloads).toBe(9); // Nine source pages expose a file download.
    for (const line of englishProductionLines) {
      const body = readFileSync(new URL(`../../public/downloads/heat-treatment-lines/en/${line.slug}.txt`, import.meta.url), 'utf8');
      expect(body.length).toBeGreaterThan(300);
      expect(body).not.toMatch(/[\u3400-\u9fff]/);
    }
  });
});
