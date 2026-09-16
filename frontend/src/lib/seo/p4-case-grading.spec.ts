import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  // Match the request cache used by the real page; do not reload all case
  // articles on each render in this read-only disclosure check.
  cache: (fn: () => unknown) => {
    let value: unknown;
    return () => (value ??= fn());
  },
}));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('404'); } }));
import { CaseArticlePage } from '@/components/case-studies/CaseArticlePage';
import { getPublicCases } from '@/lib/cases/server';

const read = (name: string) => fs.readFileSync(fileURLToPath(new URL(`../../../content/cases/${name}`, import.meta.url)), 'utf8');
describe('case publication boundaries after article migration', () => {
  it('retains result disclosure without turning project records into accepted results', () => {
    // Source review: the two proposals have no delivery/acceptance evidence.
    // Henan also has a separately published participation record. Keep the
    // original safety boundary without promoting proposals to experience.
    for (const [name, classification] of [
      ['jining-support-roller', 'proposal'],
      ['continuous-line-renovation', 'proposal'],
      ['henan-annealing-solution', 'experience'],
    ]) {
      const body = read(`${name}.md`);
      const meta = JSON.parse(read(`${name}.json`));
      expect(meta.contentType).toBe(classification);
      expect(meta.projectStatus).toBe(classification);
      expect(body).toContain(classification === 'proposal'
        ? '本文所引原件不构成设备已交付或验收通过的证明'
        : '不作成果数字结论');
      expect(meta.reviewer).toBeUndefined();
    }
    expect(read('jining-support-roller.md')).toContain('不是实际验收产能');
    expect(read('jining-support-roller.md')).toContain('两种回火值需要统一采用依据');
    expect(read('henan-annealing-solution.md')).toContain('实际能耗、产量、成材率、表面质量与验收结果');
  });
  it('retains the bounded retrofit record and verification requirements', () => {
    const body = read('continuous-line-renovation.md');
    expect(body).toContain('连续退洗线');
    expect(body).toContain('不代表三条线已经完成改造或通过验收');
    expect(body).toContain('经济性结论需以可比运行记录复核');
    expect(body).not.toContain('项目测算型结果案例');
    expect(body).not.toContain('A 级结果案例');
  });
});

// These checks render the actual article component and body; merely keeping a
// label in a source file or in JSON cannot satisfy the publication gate.
describe('visible case classification, results and review', () => {
  it("keeps unapproved sources archived and refuses their public article pages", () => {
    expect(getPublicCases().map((item) => item.slug)).toEqual(['henan-annealing-solution-line']);
    for(const name of ['jining-support-roller','continuous-line-renovation','rt4-75-6-proposal']) {
      const item=JSON.parse(read(name+'.json'));
      expect(item.publicationStatus).toBe('draft');
      expect(()=>renderToStaticMarkup(createElement(CaseArticlePage,{slug:item.slug,searchParams:{}}))).toThrow('404');
    }
  });
  it("renders the owner-approved Henan experience with its visible classification boundary", () => {
    const item=JSON.parse(read('henan-annealing-solution.json'));
    expect(item.publicationStatus).toBe('published');
    const html=renderToStaticMarkup(createElement(CaseArticlePage,{slug:item.slug,searchParams:{}}));
    expect(html).toContain(item.title);
    // The reading page keeps the lead's evidence boundary visible.
    expect(html).toContain('方案参数不代表实际产量或验收结果');
  });
});
