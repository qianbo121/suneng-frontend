import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  fs.readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');

const temperatureSource = readSource(
  '../../app/[locale]/solutions/rechuli-lu-wendu-bujun-zhenggai/page.tsx',
);
const riskSource = readSource(
  '../../app/[locale]/solutions/rechuli-lu-gaizao-fengxian-zhouqi/page.tsx',
);
const templateSource = readSource('../../components/geo-pages/GeoAuthorityGuidePage.tsx');
const blocksSource = readSource('../../components/geo-pages/GeoPageBlocks.tsx');
const globalsSource = readSource('../../app/globals.css');
const uiTemplateSource = readSource(
  '../../../../docs/seo-geo/ui-review/authority-topic-template-v1.html',
);

describe('P5 first-batch authority topic pages', () => {
  it('keeps the approved anchor clearance in the UI template and production stylesheet', () => {
    expect(uiTemplateSource).toContain('scroll-padding-top: 88px');
    expect(globalsSource).toContain('scroll-padding-top: 88px');
    expect(blocksSource).not.toContain('scroll-mt-24');
  });

  it('keeps the approved section sequence without adding a Dataset block', () => {
    const sequence = [
      'id="answer"',
      'id="signals"',
      'id="compare"',
      'id="evidence"',
      'id="faq"',
      'id="contact"',
    ];
    let previous = -1;
    for (const marker of sequence) {
      const current = templateSource.indexOf(marker);
      expect(current, marker).toBeGreaterThan(previous);
      previous = current;
    }
    expect(templateSource).not.toContain('Dataset');
  });

  it('covers the temperature-remediation questions and fact boundary', () => {
    for (const question of [
      '热处理炉温度不均怎么整改？',
      '热处理炉温度不均，找厂家改造要看哪些能力？',
      '工业炉改造后温度还是不均怎么办？',
    ]) {
      expect(temperatureSource).toContain(question);
    }
    expect(temperatureSource).toContain('SN-CASE-P1-013');
    expect(temperatureSource).toContain('空炉还是负载');
    expect(temperatureSource).toContain('测点数量');
    expect(temperatureSource).toContain('保温时间');
    expect(temperatureSource).toContain('仪器');
    expect(temperatureSource).toContain('标准号');
    expect(temperatureSource).not.toMatch(/SN-CASE-P0-008-F0[1-6]/);
  });

  it('covers the risk, cycle and production-impact questions and fact boundary', () => {
    for (const question of [
      '热处理炉节能改造有哪些风险？',
      '老旧热处理炉改造失败的原因是什么？',
      '热处理炉改造会影响生产吗？',
      '热处理炉节能改造停产多久？',
      '热处理炉改造周期一般多久？',
    ]) {
      expect(riskSource).toContain(question);
    }
    expect(riskSource).toContain('SN-CASE-P1-014');
    expect(riskSource).toContain('按项目单独确认');
    expect(riskSource).not.toMatch(/SN-CASE-P0-008-F0[1-6]/);
  });

  it('emits Article, breadcrumb, organization and FAQ JSON-LD only', () => {
    for (const source of [temperatureSource, riskSource]) {
      expect(source).toContain('getArticleJsonLd');
      expect(source).toContain('getBreadcrumbJsonLd');
      expect(source).toContain("getOrganizationJsonLd('zh')");
      expect(source).toContain("'@type': 'Organization'");
      expect(source).toContain('getFaqJsonLd');
      expect(source).not.toContain('getDataset');
      expect(source).not.toContain('Dataset');
    }
  });
});
