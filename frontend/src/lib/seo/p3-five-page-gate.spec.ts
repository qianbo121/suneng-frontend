import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
vi.mock('server-only', () => ({}));
vi.mock('react', async (original) => ({ ...(await original<typeof import('react')>()), cache: (fn: unknown) => fn }));
vi.mock('next/navigation', () => ({ usePathname: () => '/zh', notFound: () => { throw new Error('404'); }, permanentRedirect: () => { throw new Error('Unexpected redirect'); } }));
import ProductPage from '@/app/[locale]/products/detail/[slug]/page';

import { TROLLEY_PUBLICATION_REVIEW } from './trolley-publication';

import { CONTINUOUS_HEAT_TREATMENT_LINE_SEO, INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO, OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO, TSINGSHAN_1250_CASE_SEO } from '@/lib/seo/page-data';

const readSource = (relativePath: string) =>
  fs.readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');

const trolleySource = readSource('../../app/[locale]/products/detail/[slug]/page.tsx');
const quoteSource = readSource('../../app/[locale]/articles/gongye-lu-baojia-canshu/page.tsx');
const decisionSource = readSource(
  '../../app/[locale]/articles/laojiu-rechuli-lu-daxiu-haishi-maixin/page.tsx',
);
const renovationServiceSource = readSource(
  '../../app/[locale]/service/furnace-renovation-overhaul/page.tsx',
) + readSource('../../components/engineering/engineering-content.ts');
const solutionSource = readSource(
  '../../app/[locale]/solutions/continuous-heat-treatment-line/page.tsx',
);
const caseSource = readSource(
  '../../components/case-studies/CaseArticlePage.tsx',
);

describe('P3 five-page publication gate', () => {
  it("does not claim an unperformed technical review in retained source files", () => {
    for(const source of [trolleySource,quoteSource,decisionSource,caseSource,solutionSource]) {
      expect(source).not.toContain('reviewedByTechnicalEngineer: true');
      expect(source).not.toContain('#technical-reviewer-tang');
    }
    expect(TROLLEY_PUBLICATION_REVIEW.date).toBe('2026-07-29');
    expect(INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.modifiedTime).toContain('2026-07-31');
    expect(OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.modifiedTime).toContain('2026-07-30');
    expect(CONTINUOUS_HEAT_TREATMENT_LINE_SEO.modifiedTime).toBe('2026-09-07T18:00:00+08:00');
    expect(TSINGSHAN_1250_CASE_SEO.modifiedTime).toContain('2026-07-31');
  });

  it('gives the quote page at least three approved facts with project boundaries', () => {
    for (const factId of ['SN-CASE-P1-014', 'SN-CASE-P0-006', 'SN-CASE-P0-004']) {
      expect(quoteSource).toContain(factId);
    }

    expect(quoteSource).toContain('不能套固定价');
    expect(quoteSource).toContain('不是标准型号参数');
    expect(quoteSource).toContain('不代表其他项目的固定价格、产能或配置');
  });

  it('gives the repair-or-replace page three approved decision references without overclaiming', () => {
    for (const factId of ['SN-CASE-P1-013', 'SN-CASE-P1-014', 'SN-CASE-P0-001']) {
      expect(decisionSource).toContain(factId);
    }

    expect(decisionSource).toContain('不能替代对当前旧炉的现场检测');
    expect(decisionSource).toContain('新建产线作为独立方案比较');
    expect(decisionSource).not.toContain('3 条 1250 mm');
  });

  it('keeps direct answers for the highest-value non-brand renovation questions', () => {
    for (const question of [
      '工业炉节能改造厂家怎么选？',
      '工业炉改造验收看哪些指标？',
      '热处理炉改造前要准备哪些资料？',
      '热处理炉控制系统升级厂家怎么选？',
      '工业炉耗电量高怎么改造？',
      '热处理炉改造周期一般多久？',
      '热处理炉节能改造能省多少电？',
      '江苏有没有做工业炉节能改造比较靠谱的厂家？',
      '停产多年的热处理炉重启评估要查什么？',
      '工业炉改造后温度还是不均怎么办？',
      '热处理炉改造会影响生产吗？',
      '热处理炉技改投资回报测算需要哪些输入？',
    ]) {
      expect(renovationServiceSource).toContain(question);
    }

    expect(decisionSource).toContain('热处理炉大修厂家怎么选？');
    expect(quoteSource).toContain('工业炉节能改造报价通常包括哪些？');
    expect(quoteSource).toContain('Q8：热处理炉节能改造多少钱？');
    expect(quoteSource).toContain('Q9：老旧工业炉改造预算怎么估算？');
    expect(quoteSource).toContain('不能把一个数字当成正式报价');
  });

  it('states explicit fit boundaries on the trolley page and retains evidence on the hub and case', () => {
    expect(trolleySource).toContain('台车炉的适用与不适用条件');
    expect(trolleySource).toContain('不宜直接选用的条件');
    expect(trolleySource).toContain('SN-CASE-P1-013');
    expect(trolleySource).toContain('SN-CASE-P1-014');

    expect(solutionSource).toContain('SN-CASE-P0-008');
    expect(solutionSource).toContain('SN-CASE-P0-006');
    expect(solutionSource).toContain('SN-CASE-P0-001');
    expect(readSource('../../../content/cases/continuous-line-renovation.md')).toContain('经济性结论需以可比运行记录复核');
    expect(caseSource).not.toContain('7,644 万元/年');
  });
});

describe('five actual route render paths', () => {
  it("retains the equipment page without withdrawn case sections or internal review labels", async () => {
    const page=await ProductPage({params:Promise.resolve({locale:'zh',slug:'trolley-furnace'})});
    const html=renderToStaticMarkup(page).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
    expect(html).toContain('<h1');
    expect(html).toContain('台车炉');
    expect(html).not.toMatch(/href="\/zh\/(case|articles|solutions)/);
    expect(html).not.toMatch(/未登记公开署名|发布复核：|内容复核：/);
  });
});
