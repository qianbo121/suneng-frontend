import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getInfographic, getInfographicCards, infographicResources } from './infographics';

describe('ten supplied infographic resources', () => {
  it('has ten distinct, complete resources while preserving the original sample address', () => {
    expect(infographicResources).toHaveLength(10);
    for (const field of ['id', 'slug', 'image', 'title'] as const) {
      expect(new Set(infographicResources.map((item) => item[field])).size).toBe(10);
    }
    expect(getInfographic('mesh-belt-500-screws')?.id).toBe(-1000);
    expect(getInfographic('unknown')).toBeUndefined();
    for (const item of infographicResources) {
      expect(item.rows.length).toBeGreaterThan(0);
      expect(item.conditions.length).toBeGreaterThan(0);
      expect(item.paragraphs.length).toBeGreaterThanOrEqual(3);
      expect(item.caption).toContain('非项目实拍');
      expect(item.paragraphs.every((paragraph) => !paragraph.startsWith('#'))).toBe(true);
    }
    expect(
      getInfographicCards().every(
        (item) => item.date === '' && item.viewCount === undefined && item.title.en === '',
      ),
    ).toBe(true);
  });

  it('ships every original poster at its actual 1086 × 1448 size', () => {
    for (const item of infographicResources) {
      const png = readFileSync(resolve(process.cwd(), 'public', item.image.slice(1)));
      expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
      expect(png.readUInt32BE(16)).toBe(1086);
      expect(png.readUInt32BE(20)).toBe(1448);
    }
  });
});
