import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  getInfographic,
  getInfographicCards,
  getInfographicImageSrcSet,
  infographicResources,
} from './infographics';

describe('ten supplied infographic resources', () => {
  it('keeps the original ten resources and allows further distinct resources', () => {
    expect(infographicResources.map((item) => item.id)).toEqual(
      expect.arrayContaining(Array.from({ length: 10 }, (_, index) => -1000 + index)),
    );
    for (const field of ['id', 'slug', 'image', 'title'] as const) {
      expect(new Set(infographicResources.map((item) => item[field])).size).toBe(
        infographicResources.length,
      );
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

  it('uses the generated display paths for every poster', () => {
    for (const item of infographicResources) {
      const base = item.image.slice(0, -'.png'.length);
      expect(getInfographicImageSrcSet(item.image)).toBe(
        `${base}-768w.webp 768w, ${base}-1086w.webp 1086w`,
      );
    }
  });
});
