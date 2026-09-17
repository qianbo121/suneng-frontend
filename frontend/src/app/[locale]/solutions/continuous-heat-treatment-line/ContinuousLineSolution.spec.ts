import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Page from './page';

vi.mock('server-only', () => ({}));
vi.mock('next/navigation', () => ({ notFound: () => { throw new Error('404'); }, usePathname: () => '/zh/solutions/continuous-heat-treatment-line' }));
// The page is withdrawn at launch; check its content as it would be published.
vi.mock('@/lib/publication-scope', async (original) => ({
  ...(await original<typeof import('@/lib/publication-scope')>()),
  TECHNICAL_CONTENT_PUBLISHED: true,
}));
const styles = readFileSync(new URL('../../../../components/engineering/EngineeringPage.module.css', import.meta.url), 'utf8');
let html: string;
const text = (markup: string) => markup.replace(/<[^>]*>/g, '');
const section = (id: string) => {
  const start = html.indexOf(`id="${id}"`);
  expect(start, `missing visible section ${id}`).toBeGreaterThan(-1);
  return html.slice(start, html.indexOf('</section>', start));
};
beforeAll(async () => {
  // Render the real page and its real shared components, excluding structured data
  // so a phrase left only in JSON cannot satisfy a visible-content requirement.
  html = renderToStaticMarkup(await Page({ params: Promise.resolve({ locale: 'zh' }) }))
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
});

describe('continuous heat-treatment line rendered page', () => {
  it('keeps one visible title and a complete decision journey', () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    for (const id of ['fit', 'process', 'selection-table', 'experience', 'checkpoints', 'project-evidence', 'faq', 'resources', 'inquiry']) section(id);
    expect(text(html)).toContain('连续热处理生产线解决方案');
  });
  it('renders a semantic selection table with conditions and real equipment links', () => {
    const table = section('selection-table');
    expect(table).toContain('<thead>'); expect(table).toContain('<tbody>');
    expect(table.match(/scope="col"/g)).toHaveLength(4);
    for (const name of ['工件／材料', '热处理需求', '可了解的生产线', '进一步确认']) expect(text(table)).toContain(name);
    expect(table).toContain('/zh/products/detail/copper-wire-annealing-line');
    expect(html).not.toContain('/case/copper');
  });
  it('retains all eleven project references and their design-versus-result limits', () => {
    const evidence = section('project-evidence');
    expect(evidence.match(/<article\b/g)).toHaveLength(11);
    for (const phrase of ['RCWT-75/45-9/6', '750 t/d', '500 kg/h', '均不是实际日产量', '不代表当前设备的统一规格或实际验收结果']) expect(text(evidence)).toContain(phrase);
  });
  it('shows three delivery checks with scope, quality and acceptance criteria', () => {
    const checks = section('checkpoints');
    expect(checks.match(/<article\b/g)).toHaveLength(3);
    for (const phrase of ['供货范围', '质量与产能', '验收与资料', '按合同范围']) expect(text(checks)).toContain(phrase);
    expect(styles).toMatch(/\.cards \{[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  });
  it('gives the main project a direct title, scope and complete detail entrance', () => {
    const experience = section('experience');
    for (const phrase of ['济宁支重轮热处理生产线', '项目需求', '主要设备', '苏能参与']) expect(text(experience)).toContain(phrase);
    expect(experience).toContain('href="/zh/case/jining-support-roller-heat-treatment-line"');
  });
  it("retains a described reference image in the archived component", () => {
    const experience=section('experience');
    expect(experience).toMatch(/alt="[^"]+"/);
    expect(experience).toContain('<img');
  });
  it('connects the historical evidence to all three real case pages', () => {
    const evidence = section('project-evidence');
    for (const slug of ['anonymous-tsingshan-1250-renovation', 'henan-annealing-solution-line', 'jining-support-roller-heat-treatment-line']) expect(evidence).toContain(`href="/zh/case/${slug}"`);
  });
  it('renders the real shared inquiry form with exactly the four customer fields', () => {
    const form = section('inquiry');
    for (const name of ['direction', 'problem', 'identity', 'contact']) expect(form.match(new RegExp(`name="${name}"`, 'g'))).toHaveLength(1);
    expect(form).toContain('type="submit"');
    expect(text(form)).toContain('联系方式');
  });
  it('keeps process steps in ordered sequences with process-dependent limits', () => {
    const process = section('process');
    expect(process.match(/<ol\b/g)).toHaveLength(3);
    for (const phrase of ['加热保温', '淬火', '回火', '实际流程按材质、热处理要求和输送方式确定']) expect(text(process)).toContain(phrase);
  });
  it('keeps hero wrapping and actions able to wrap at narrow desktop widths', () => {
    expect(html).toContain('<wbr/>');
    expect(styles).toMatch(/\.actions \{[^}]*flex-wrap: wrap/);
    expect(styles).not.toMatch(/\.hero h1 \{[^}]*white-space: nowrap/);
  });
  it('keeps only the third question open by default using native keyboard controls', () => {
    const faqs = section('faq');
    const details = [...faqs.matchAll(/<details\b([^>]*)>([\s\S]*?)<\/details>/g)];
    expect(details).toHaveLength(4);
    expect(details.map((match) => match[1].includes('open=""'))).toEqual([false, false, true, false]);
    expect(faqs.match(/<summary>/g)).toHaveLength(4);
  });
  it("keeps live capacity and acceptance news without the withdrawn quotation guide", () => {
    const resources=section('resources');
    expect(resources.match(/<article\b/g)).toHaveLength(2);
    for(const term of ['产能','验收'])expect(text(resources)).toContain(term);
    expect(resources).not.toContain('/zh/articles/gongye-lu-baojia-canshu');
  });
  it('keeps horizontal table scrolling within its own region and a mobile layout', () => {
    expect(styles).toContain('overflow-x: auto');
    expect(styles).toContain('@media (max-width: 767px)');
    expect(section('selection-table')).toContain('aria-label="生产线选型表，可横向滚动"');
  });
  it('names table and content regions and keeps every anchor connected', () => {
    expect(section('selection-table')).toContain('tabindex="0"');
    for (const match of html.matchAll(/href="#([^"]+)"/g)) expect(html).toContain(`id="${match[1]}"`);
    expect(section('resources')).toContain('aria-labelledby="resources-title"');
  });
  it("omits removed source labels and unperformed technical signoff", () => {
    expect(html).not.toContain('aria-label="资料更新与来源"');
    expect(text(html)).not.toMatch(/未登记公开署名|发布复核：|内容复核：|技术审核：苏能技术部/);
  });
});
