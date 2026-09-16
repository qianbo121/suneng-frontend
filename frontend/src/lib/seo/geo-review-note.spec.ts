import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GeoReviewNote } from '@/components/geo-pages/GeoPageBlocks';

describe('visible source review attribution', () => {
  it('renders an existing reviewer alongside the source and date', () => {
    const html = renderToStaticMarkup(createElement(GeoReviewNote, {
      modifiedDate: '2026-09-11', sourceNote: '测试资料来源', reviewerName: '王工',
    }));
    expect(html).toContain('资料复核：');
    expect(html).toContain('王工');
    expect(html).toContain('测试资料来源');
    expect(html).toMatch(/datetime="2026-09-11"/i);
  });

  it('does not invent a reviewer or expose an internal pending notice', () => {
    for (const reviewerName of [undefined, '', '   ']) {
      const html = renderToStaticMarkup(createElement(GeoReviewNote, {
        modifiedDate: '2026-09-11', reviewerName,
      }));
      expect(html).not.toContain('资料复核：');
      expect(html).not.toMatch(/王工|未登记|待审核/);
    }
  });
});
