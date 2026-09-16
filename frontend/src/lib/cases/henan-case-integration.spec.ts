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
  it("preserves the withdrawn Henan manuscript and its project classification", () => {
    const web=JSON.parse(read(website+'.json'));
    expect(web.publicationStatus).toBe('draft');
    expect(web.contentType).toBe('experience');
    expect(web.reviewer).toBeUndefined();
    expect(read(website+'.md')).toContain('不作成果数字结论');
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
