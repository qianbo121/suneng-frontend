import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  CONTINUOUS_HEAT_TREATMENT_LINE_SEO,
  INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO,
  OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO,
  TSINGSHAN_1250_CASE_SEO,
} from '@/lib/seo/page-data';

const readSource = (relativePath: string) =>
  fs.readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');

const trolleySource = readSource('../../app/[locale]/products/detail/[slug]/page.tsx');
const quoteSource = readSource('../../app/[locale]/articles/gongye-lu-baojia-canshu/page.tsx');
const decisionSource = readSource(
  '../../app/[locale]/articles/laojiu-rechuli-lu-daxiu-haishi-maixin/page.tsx',
);
const renovationServiceSource = readSource(
  '../../app/[locale]/service/furnace-renovation-overhaul/page.tsx',
);
const solutionSource = readSource(
  '../../app/[locale]/solutions/continuous-heat-treatment-line/page.tsx',
);
const caseSource = readSource(
  '../../app/[locale]/case/anonymous-tsingshan-1250-renovation/page.tsx',
);

describe('P3 five-page publication gate', () => {
  it('shows publication review and truthful update dates without claiming an unperformed person review', () => {
    for (const source of [
      trolleySource,
      quoteSource,
      decisionSource,
      solutionSource,
      caseSource,
    ]) {
      expect(source).toContain('GeoReviewNote');
      expect(source).not.toContain('reviewedByTechnicalEngineer: true');
    }
    expect(trolleySource).not.toContain('reviewedByTechnicalEngineer: isP3TrolleyPage');
    expect(caseSource).not.toContain('#technical-reviewer-tang');

    expect(trolleySource).toContain("const P3_REVIEW_DATE = '2026-07-29'");
    expect(INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO.modifiedTime).toContain('2026-07-31');
    expect(OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO.modifiedTime).toContain(
      '2026-07-30',
    );
    expect(CONTINUOUS_HEAT_TREATMENT_LINE_SEO.modifiedTime).toContain('2026-07-29');
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
    expect(caseSource).toContain('经济性结论需以可比运行记录复核');
    expect(caseSource).not.toContain('7,644 万元/年');
  });
});
