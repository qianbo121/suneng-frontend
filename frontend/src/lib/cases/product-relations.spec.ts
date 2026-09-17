import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi, afterEach } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({ ...(await original<typeof import('react')>()), cache: (fn: () => unknown) => { let value: unknown; return () => value ??= fn(); } }));
import * as source from './server';

import { caseProductRelations, getEntryCases, productConnectionName } from './product-relations';
import { EntryCaseEvidence } from '@/components/case-studies/CaseEvidenceLinks';
import { BuyerSelectionGuide } from '@/components/products/BuyerSelectionGuide';
import { buyerSelectionGuides } from '@/lib/buyer-selection-guides';
import { REVIEWED_PUBLIC_CASES } from './public-case-allowlist';

afterEach(() => vi.restoreAllMocks());

describe('reviewed product and case connections', () => {
  it("retains all archived product mappings while connecting only approved records", () => {
    expect(caseProductRelations).toHaveLength(148);
    expect(new Set(caseProductRelations.map(x=>x.caseId)).size).toBe(148);
    const approvedIds = new Set(REVIEWED_PUBLIC_CASES.map((item) => item.id));
    expect(source.getPublicCases().map((item) => item.id).sort()).toEqual([...approvedIds].sort());
    for(const row of caseProductRelations)for(const product of row.products) {
      expect(productConnectionName(product,'zh')).toBeTruthy();
      for(const locale of ['zh','en'] as const)
        for (const item of getEntryCases('/products/detail/'+product,locale))
          expect(approvedIds.has(item.id), `${product} ${locale} ${item.id}`).toBe(true);
    }
    for (const locale of ['zh','en'] as const)
      expect(getEntryCases('/products/detail/annealing-solution-line',locale).map((item) => item.id)).toEqual(['henan-annealing-solution']);
  });
  it("omits withdrawn recommendation sections in both languages", () => {
    for(const locale of ['zh','en'] as const) {
      expect(getEntryCases('/products/detail/trolley-furnace',locale)).toEqual([]);
      expect(renderToStaticMarkup(createElement(EntryCaseEvidence,{entryPath:'/products/detail/trolley-furnace',locale}))).toBe('');
    }
  });
  it('preserves technical distinctions found by the engineering review', () => {
    const item = (number: number) => caseProductRelations.find((record) => record.number === number)!;
    expect(item(147).products).toEqual(['roller-hearth-furnace']);
    expect(item(16).products).not.toContain('multi-furnace-quench-cell');
    expect(item(87).products).not.toContain('multi-furnace-quench-cell');
    expect(item(129).products).not.toContain('mesh-belt-furnace');
    expect(item(128).entry).toBe('/service/furnace-renovation-overhaul');
    for (const number of [11, 15, 19, 96, 97, 115, 124, 125]) expect(item(number).products).toEqual([]);
    for (const number of [5, 24, 30, 61, 64, 78, 79, 80, 118, 121, 122, 126, 130, 133, 146]) {
      expect(item(number).scope).toBe('interface');
      expect(item(number).note?.zh).toBeTruthy();
      expect(item(number).note?.en).toBeTruthy();
    }
  });
  it("does not replace withdrawn cards with placeholders or empty disclosure areas", () => {
    for(const entryPath of ['/products/detail/pit-furnace','/products/detail/nonexistent','/service/furnace-renovation-overhaul'])
      for(const locale of ['zh','en'] as const)
        expect(renderToStaticMarkup(createElement(EntryCaseEvidence,{entryPath,locale}))).toBe('');
  });
  it("retains three guide sources while hiding their withdrawn public sections", () => {
    expect(Object.keys(buyerSelectionGuides)).toHaveLength(3);
    for(const guideKey of Object.keys(buyerSelectionGuides))for(const locale of ['zh','en'] as const)
      expect(renderToStaticMarkup(createElement(BuyerSelectionGuide,{guideKey,locale}))).toBe('');
  });
});
