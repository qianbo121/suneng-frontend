import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  fs.readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');

const solutionSource = readSource(
  '../../app/[locale]/solutions/continuous-heat-treatment-line/page.tsx',
);
const jiningSource = readSource(
  '../../app/[locale]/case/jining-support-roller-heat-treatment-line/page.tsx',
);
const henanSource = readSource(
  '../../app/[locale]/case/henan-annealing-solution-line/page.tsx',
);
const productSource = readSource('../../constants/static-products.ts');
const aboutSource = readSource('../../components/about/AboutZhContent.tsx');
const certificateSource = readSource('../../constants/certificates.ts');
const manufacturerSolutionSource = readSource(
  '../../app/[locale]/solutions/rechuli-lu-changjia/page.tsx',
);

describe('GEO fact publication boundaries', () => {
  it('publishes F07–F17 as project parameters without turning design values into actual results', () => {
    expect(jiningSource).toContain('最大设计处理能力');
    expect(jiningSource).toContain('方案折算约 30 件/h');
    expect(jiningSource).toContain('不是实际验收产能');

    expect(henanSource).toContain('带宽 480–750 mm、厚度 1.6–4.0 mm');
    expect(henanSource).toContain('1300℃，不是带钢目标温度');
    expect(henanSource).toContain('设计 TV 约 190 m·mm/min');

    expect(solutionSource).toContain('速度 50–300 mm/min');
    expect(solutionSource).not.toContain('速度 30–300 mm/min');
    expect(solutionSource).toContain('均不是实际日产量');
    expect(solutionSource).toContain('NOx 以现场检测为准');
  });

  it('keeps F18–F21 as project-scheme facts with calculation and test boundaries', () => {
    expect(productSource).toContain('项目方案配置：铜合金线材室式电加热退火炉');
    expect(productSource).toContain('典型 GCr15 曲线和组织指标不作为该项目验收实绩');
    expect(productSource).toContain('助燃空气 250–300℃为设计目标，不是实测值');
    expect(productSource).toContain('0.18×0.114×60×50=61.56 kg/h');
  });

  it('removes unverified employee and certificate claims from public content', () => {
    expect(aboutSource).not.toContain("['150+', '员工']");
    expect(aboutSource).not.toContain('ISO 14001');
    expect(aboutSource).not.toContain('ISO 45001');
    expect(certificateSource).not.toContain("id: 'iso-14001'");
    expect(certificateSource).not.toContain("id: 'iso-45001'");
    expect(certificateSource).not.toContain("id: 'qualification-work-safety-standardization'");
    expect(certificateSource).not.toContain("id: 'qualification-contract-credit-aaa-2024'");
    expect(manufacturerSolutionSource).not.toContain('ISO 14001');
    expect(manufacturerSolutionSource).not.toContain('ISO 45001');
    expect(manufacturerSolutionSource).not.toContain('ISO 9001 / 14001 / 45001');
    expect(manufacturerSolutionSource).toContain('03824Q60289R3S');
    expect(manufacturerSolutionSource).toContain('2027-01-11');
  });
});
