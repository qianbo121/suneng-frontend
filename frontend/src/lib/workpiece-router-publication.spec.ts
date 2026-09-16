import { describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
vi.mock('server-only', () => ({}));
import { getWorkpieceRouterPublicCatalog } from './workpiece-router-public.server';
import { WorkpieceRouter } from '@/components/home/WorkpieceRouter';
import finalDirectionsJson from '../../../data/workpiece-router/industry-final-directions.json';
import publicSnapshot from '../../../data/workpiece-router/industry-public-direction-snapshot.json';

describe('homepage finalized directions', () => {
  it('keeps confirmed display content separate from the formal publication state', () => {
    const catalog = getWorkpieceRouterPublicCatalog();
    expect(publicSnapshot.publicBaselineVersion).toBeNull();
    expect(publicSnapshot.rules).toHaveLength(0);
    expect(catalog.publicDirectionExamplesEnabled).toBe(false);
    expect(catalog.standardDirectionsByWorkpiece).toEqual(finalDirectionsJson.directions);
    expect(catalog.categories.flatMap((category) => category.cards)).toHaveLength(45);
  });

  it('renders both directions and retains their complete conditions in expanded details for all 45 workpieces', () => {
    const catalog = getWorkpieceRouterPublicCatalog();
    for (const category of catalog.categories) {
      for (const card of category.cards) {
        const html = renderToStaticMarkup(createElement(WorkpieceRouter, {
          catalog: { ...catalog, defaultCategoryId: category.id, defaultWorkpieceId: card.id },
        }));
        const entry = catalog.standardDirectionsByWorkpiece[card.id];
        expect(html).not.toContain('设备方向需工程判断');
        expect(html).not.toContain('正在读取行业常见方向');
        expect(html.match(/典型工况与设备方向/g)).toHaveLength(1);
        expect(html.match(/<details\b/g)).toHaveLength(1);
        expect(html).toMatch(/<details[^>]*\sopen(?:\s|=|>)/);
        for (const example of entry.examples) {
          expect(html).toContain(`<h5>${example.condition}</h5>`);
          expect(html).toContain(`<strong>${example.direction}</strong>`);
          expect(html.split(example.boundary!).length - 1).toBe(1);
        }
      }
    }
  });

  it('keeps an engineering fallback when no finalized or published directions are available', () => {
    const catalog = { ...getWorkpieceRouterPublicCatalog(), standardDirectionsByWorkpiece: {} };
    const html = renderToStaticMarkup(createElement(WorkpieceRouter, { catalog }));
    expect(html).toContain('设备方向需工程判断');
    expect(html).not.toContain('行业常见设备方向');
  });
});
