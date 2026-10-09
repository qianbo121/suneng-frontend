import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

import { approvedProcurementPages } from '../approved-procurement-pages';
import { PRODUCT_DETAIL_SLUGS } from '../products/detail-slugs';
import { industryFurnacePageConfigs } from '@/components/products/industry-furnace-detail-data';

type CategoryRoute = { category: string; target: string };
type DetailRoute = { id: string; target: string };
const root = new URL('../../../../', import.meta.url);
const categories = JSON.parse(readFileSync(new URL('scripts/legacy-product-category-targets.json', root), 'utf8')) as { routes: CategoryRoute[] };
const details = JSON.parse(readFileSync(new URL('scripts/legacy-product-detail-targets.json', root), 'utf8')) as { routes: DetailRoute[] };
const baseline = JSON.parse(readFileSync(new URL('./__fixtures__/legacy-procurement-baseline.json', import.meta.url), 'utf8')) as Record<'equipment' | 'parts', string>;
const load = createRequire(import.meta.url);
const { JSDOM }: { JSDOM: new (html: string) => { window: { document: Document } } } =
  createRequire(load.resolve('isomorphic-dompurify'))('jsdom');
const documentOf = (html: string) => new JSDOM(html).window.document;
const additions = {
  equipment: ['gas-furnace-assessment', 'electric-resistance-furnace-assessment', 'drying-furnace-assessment', 'stainless-annealing-pickling-assessment'],
  parts: ['parts-mesh-belt', 'parts-trays-baskets', 'parts-gas-radiant', 'parts-brand-fit', 'parts-pusher-column-beam', 'parts-guide-chain', 'parts-heat-resistant-identity'],
} as const;
const originalHashes = {
  equipment: 'cd47deec017c82945a64b81e515e62369c6d1b73289af3c05afd4830fcf7c5d6',
  parts: '00ca6626315687f2b921519101f35aee75c1e2cbae2799aed23d8b811ff4c481',
} as const;

describe('procurement topic additions preserve the approved bodies and truthful purchasing scope', () => {
  it.each(['equipment', 'parts'] as const)('%s restores the exact original body after removing only its new sections', (id) => {
    const page = approvedProcurementPages[id];
    const doc = documentOf(page.html);
    expect(createHash('sha256').update(baseline[id]).digest('hex')).toBe(originalHashes[id]);
    expect(page.originalApprovedBodySha256).toBe(originalHashes[id]);
    let restored: string = page.html;
    for (const anchor of additions[id]) {
      const sections = doc.querySelectorAll(`section[id="${anchor}"]`);
      expect(sections, anchor).toHaveLength(1);
      expect(sections[0].querySelector('h2')).not.toBeNull();
      expect(sections[0].querySelector('script, style, form, img, h1')).toBeNull();
      const block = new RegExp(`<section id="${anchor}">\\n[\\s\\S]*?\\n</section>\\n`, 'g');
      expect([...restored.matchAll(block)], anchor).toHaveLength(1);
      restored = restored.replace(block, '');
    }
    expect(restored).toBe(baseline[id]);
    const originalAnchors = [...documentOf(baseline[id]).querySelectorAll('section[id]')].map((section) => section.id);
    expect(originalAnchors).toHaveLength(id === 'equipment' ? 5 : 4);
    for (const anchor of originalAnchors) expect(doc.querySelectorAll(`[id="${anchor}"]`), anchor).toHaveLength(1);
  });

  it('resolves every reviewed category and detail target to an existing public page and real section', () => {
    expect(categories.routes).toHaveLength(8);
    expect(details.routes).toHaveLength(32);
    const pages = new Map(Object.values(approvedProcurementPages).map((page) => [page.path, documentOf(page.html)]));
    const industryPageSource = readFileSync(new URL('../../components/products/IndustryFurnaceDetailPage.tsx', import.meta.url), 'utf8');
    const productRouteSource = readFileSync(new URL('../../app/[locale]/products/detail/[slug]/page.tsx', import.meta.url), 'utf8');
    for (const { target } of [...categories.routes, ...details.routes]) {
      const url = new URL(target, 'https://www.jssngyl.cn');
      expect(url.origin, target).toBe('https://www.jssngyl.cn');
      const procurementBody = pages.get(url.pathname as typeof approvedProcurementPages.equipment.path | typeof approvedProcurementPages.parts.path);
      if (procurementBody) {
        if (url.hash) expect(procurementBody.querySelectorAll(`[id="${url.hash.slice(1)}"]`), target).toHaveLength(1);
      } else {
        const route = url.pathname.match(/^\/zh\/products\/detail\/([^/]+)$/);
        expect(route, target).not.toBeNull();
        const slug = route![1];
        expect(PRODUCT_DETAIL_SLUGS.has(slug), target).toBe(true);
        if (url.hash) {
          expect(url.hash, target).toBe('#selection');
          expect(Object.hasOwn(industryFurnacePageConfigs, slug), target).toBe(true);
          expect(industryPageSource).toMatch(/<section id="selection"/);
          expect(productRouteSource).toMatch(/if \(isIndustryFurnaceSlug\(product\.slug\)\)/);
        }
      }
    }
  });

  it('keeps uncertain parts, manufacturing forms and brand-fit claims conditional on real identification', () => {
    const parts = documentOf(approvedProcurementPages.parts.html);
    const sectionText = (anchor: string) => parts.querySelector(`section[id="${anchor}"]`)!.textContent ?? '';
    const routeFor = (id: string) => details.routes.find((route) => route.id === id)?.target;
    for (const id of ['239', '240']) expect(routeFor(id)).toBe(approvedProcurementPages.parts.path + '#parts-guide-chain');
    for (const id of ['203', '204']) expect(routeFor(id)).toBe(approvedProcurementPages.parts.path + '#parts-heat-resistant-identity');
    for (const id of ['230', '231', '232']) expect(routeFor(id)).toBe(approvedProcurementPages.parts.path + '#parts-brand-fit');
    const guide = sectionText('parts-guide-chain');
    expect(guide).toMatch(/侧导轨/);
    expect(guide).toMatch(/导链槽/);
    expect(guide).toMatch(/只有[“"]导轨系列[”"]名称[\s\S]*确认[\s\S]*具体件/);
    const identity = sectionText('parts-heat-resistant-identity');
    expect(identity).toMatch(/耐热铸管/);
    expect(identity).toMatch(/耐热扎辊/);
    expect(identity).toMatch(/确认对象及名称/);
    expect(identity).toMatch(/不能[\s\S]*分类依据/);
    expect(identity).not.toMatch(/(?:耐热铸管|耐热扎辊)(?:就是|即为|等同于)/);
    expect(sectionText('parts-trays-baskets')).toMatch(/铸造、焊接或其他制造形式[\s\S]*核清/);
    const brand = sectionText('parts-brand-fit');
    expect(brand).toMatch(/丰东/);
    expect(brand).toMatch(/爱协林/);
    expect(brand).toMatch(/原厂来源、授权关系及能否替换[\s\S]*核实/);
    expect(sectionText('parts-gas-radiant')).toMatch(/燃烧器[\s\S]*另外列项核实/);
    for (const anchor of additions.parts) {
      const text = sectionText(anchor);
      expect(text, anchor).toMatch(/是否承接|可承接[的]?范围|承接范围/);
      expect(text, anchor).not.toMatch(/苏能(?:为|是)[^。]*(?:原厂|授权)|保证[^。]*(?:通用|互换|适配)|(?:全部|全系列|所有部件)[^。]*(?:已可供|现货供应)/);
    }
  });
});
