import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import content from './production-lines/copper-wire-annealing-line.json';
import { isZhOnlyPath } from './i18n/zh-only';
import {
  copperWireChecklistDownload,
  copperWireChecklistGroups,
  copperWireChecklistPath,
  getCopperWireChecklistText,
} from './copper-wire-inquiry-checklist';

describe('copper wire inquiry preparation checklist', () => {
  it('keeps three groups and nine unique preparation items', () => {
    expect(copperWireChecklistGroups).toHaveLength(3);
    expect(copperWireChecklistGroups.every((group) => group.items.length === 3)).toBe(true);
    expect(
      new Set(copperWireChecklistGroups.flatMap((group) => group.items.map((item) => item.id)))
        .size,
    ).toBe(9);
  });

  it('keeps the downloadable original URL and matches all reviewed on-page content', () => {
    const download = readFileSync(
      resolve(process.cwd(), 'public', copperWireChecklistDownload.slice(1)),
      'utf8',
    );
    expect(download).toBe(getCopperWireChecklistText());
    expect(download).toContain('镀层及漆膜线材须另行评估');
    expect(download).toContain('含氧铜与高温含氢气氛存在材料损伤风险');
    expect(download).toContain('不作为设备选型、报价或验收依据');
  });

  it('keeps the source resource link and enables its completed English equivalent', () => {
    const technical = content.sections.faq.relatedGroups.find((group) => group.id === 'technical');
    expect(technical?.links[0].href).toBe(copperWireChecklistPath);
    expect(isZhOnlyPath(copperWireChecklistPath)).toBe(false);
  });
});
