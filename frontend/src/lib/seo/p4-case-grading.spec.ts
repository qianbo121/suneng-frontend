import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  fs.readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');

const sharedCaseSource = readSource(
  '../../components/case-studies/AuthorizedProjectCasePage.tsx',
);
const jiningSource = readSource(
  '../../app/[locale]/case/jining-support-roller-heat-treatment-line/page.tsx',
);
const henanSource = readSource(
  '../../app/[locale]/case/henan-annealing-solution-line/page.tsx',
);
const measuredCaseSource = readSource(
  '../../app/[locale]/case/anonymous-tsingshan-1250-renovation/page.tsx',
);

describe('P4 case publication grades', () => {
  it('labels Jining and Henan as B-grade project records with no fabricated result claims', () => {
    for (const source of [jiningSource, henanSource]) {
      expect(source).toContain("caseClassification: 'B 级项目经验记录'");
      expect(source).toContain('不作成果数字结论');
      expect(source).toContain('reviewedByTechnicalEngineer: true');
    }

    expect(jiningSource).toContain('性能验收结果');
    expect(henanSource).toContain('实际能耗、产量、成材率、表面质量与验收结果');
  });

  it('keeps the high-risk case explicitly measurement-based instead of overstating a full A grade', () => {
    expect(measuredCaseSource).toContain('项目测算型结果案例');
    expect(measuredCaseSource).toContain('非客户财务审计结果');
    expect(measuredCaseSource).not.toContain('A 级结果案例');
  });

  it('renders case classification, result disclosure and reviewer information visibly', () => {
    expect(sharedCaseSource).toContain('案例分级');
    expect(sharedCaseSource).toContain('data.caseClassification');
    expect(sharedCaseSource).toContain('data.resultDisclosure');
    expect(sharedCaseSource).toContain('GeoReviewNote');
  });
});
