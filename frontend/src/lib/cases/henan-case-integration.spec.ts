import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import DOMPurify from 'isomorphic-dompurify';
import { prepareCaseBody } from './content';

// A focused handoff check for the reviewed article, not an engineering approval.

const website = path.join(process.cwd(), 'content/cases/henan-annealing-solution');
const read = (file: string) => fs.readFileSync(file, 'utf8');

const dom = (markdown: string) => DOMPurify.sanitize(prepareCaseBody(markdown).html, { RETURN_DOM_FRAGMENT: true });

function assertTable(markdown: string) {
  const table = dom(markdown).querySelector('table');
  expect(table, 'must actually render a table').not.toBeNull();
  const headers = [...table!.querySelectorAll('thead th')];
  expect(headers).toHaveLength(2);
  expect(headers.every((cell) => cell.textContent?.trim())).toBe(true);
  for (const row of table!.querySelectorAll('tbody tr')) expect(row.children).toHaveLength(2);
}

describe('Henan case reviewed artifact handoff', () => {
  it("publishes the owner-approved Henan manuscript with its project classification", () => {
    const web=JSON.parse(read(website+'.json'));
    expect(web.publicationStatus).toBe('published');
    expect(web.contentType).toBe('experience');
    // Owner approval is recorded in the public-case allowlist, not as a named reviewer.
    expect(web.reviewer).toBeUndefined();
    expect(read(website+'.md')).toContain('不作成果数字结论');
  });

  it("keeps the owner's review edits: no internal quotation remark, safety provisions stated, cover labelled", () => {
    const web=JSON.parse(read(website+'.json'));
    const body=read(website+'.md');
    expect(body).not.toContain('现存报价');
    for (const provision of ['火焰检测', '熄火保护', '快速切断阀', '氮气吹扫', '防爆膜', '应急电源', '不属于含氢保护气氛的光亮退火'])
      expect(body).toContain(provision);
    expect(web.cover.caption).toBe('参考图，非项目现场照片');
    expect(web.relatedLinks.map((link: { href: string }) => link.href)).toEqual(['/zh/products/detail/annealing-solution-line']);
    expect(body).not.toMatch(/历史价格|电气范围口径/);
  });

  it("carries the same approved edits in the English copy", () => {
    const english = path.join(process.cwd(), 'content/cases-en/henan-annealing-solution');
    const copy = JSON.parse(read(english + '.json'));
    const body = read(english + '.md');
    expect(body).not.toMatch(/Existing quotations|historical prices|electrical-scope wording/);
    for (const provision of ['flame detection', 'flame-failure protection', 'quick-shut-off', 'purged with nitrogen', 'rupture disc', 'emergency power supply', 'not bright annealing under a hydrogen-bearing protective atmosphere', 'acid-fume treatment'])
      expect(body).toContain(provision);
    expect(copy.coverCaption).toBe('Reference image, not a project-site photo.');
    expect(`${body}\n${JSON.stringify(copy)}`).not.toMatch(/localhost|127\.0\.0\.1|\/Users\/|QZB170726|Qianye|Xuchang|RMB|yuan/i);
  });

  it("does not expose private delivery records through the archived website metadata", () => {
    const web=JSON.parse(read(website+'.json'));
    expect(web.slug).toBe('henan-annealing-solution-line');
    for(const field of ['sourceReview','artifactHashes','technicalReviewer','publication'])expect(web[field]).toBeUndefined();
  });

  it('renders both table headers and preserves values using the website parser', () => {
    const body = read(`${website}.md`);
    assertTable(body);
    const table = dom(body).querySelector('table')!;
    expect([...table.querySelectorAll('thead th')].map((c) => c.textContent?.trim())).toEqual(['参数', '2017年技术附件中的条件']);
    expect(table.querySelectorAll('tbody tr')).toHaveLength(8);
    expect(dom(body).textContent).not.toContain('**');
    expect(dom(body).querySelectorAll('h1')).toHaveLength(0);
  });

  it('rejects the reported empty-header and broken-export examples', () => {
    expect(() => assertTable('| 参数项目记录 | |\n| --- | --- |\n| 炉长 | 130 m |')).toThrow();
    expect(() => assertTable('| 参数 | 值 |\n\n| --- | --- |\n\n| 炉长 | 130 m |')).toThrow();
    assertTable('| 参数 | 值 |\n| --- | --- |\n| 炉长 | 130 m |');
  });

  it('keeps public content free of local links and internal evidence', () => {
    const meta = JSON.parse(read(`${website}.json`));
    const body = read(`${website}.md`);
    const text = `${body}\n${JSON.stringify(meta)}`;
    expect(text).not.toMatch(/localhost|127\.0\.0\.1|\/Users\/|sourceReview|artifactHashes|1100万元|1033万元|QZB170726|武汉乾冶|乾冶众联/);
    for (const link of dom(body).querySelectorAll('a')) expect(link.getAttribute('href')).toMatch(/^(#|\/zh\/|https:\/\/www\.outokumpu\.com\/)/);
    expect(meta.cover.src).toBe('/images/products/annealing-solution-line/remaining-batch-v1/03-workpiece-8b1942ed56b3.png');
  });
});
