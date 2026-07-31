import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  GET as getEnergyConversionEnglishRoute,
  HEAD as headEnergyConversionEnglishRoute,
} from '@/app/en/solutions/rechuli-lu-dian-gai-ran-yure-huishou/route';
import {
  GET as getRiskCycleEnglishRoute,
  HEAD as headRiskCycleEnglishRoute,
} from '@/app/en/solutions/rechuli-lu-gaizao-fengxian-zhouqi/route';
import {
  GET as getLiningEnglishRoute,
  HEAD as headLiningEnglishRoute,
} from '@/app/en/solutions/rechuli-lu-luchen-fanxin/route';
import {
  GET as getTemperatureEnglishRoute,
  HEAD as headTemperatureEnglishRoute,
} from '@/app/en/solutions/rechuli-lu-wendu-bujun-zhenggai/route';
import { isZhOnlyPath } from '@/lib/i18n/zh-only';

const readSource = (relativePath: string) =>
  fs.readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');

const temperatureSource = readSource(
  '../../app/[locale]/solutions/rechuli-lu-wendu-bujun-zhenggai/page.tsx',
);
const riskSource = readSource(
  '../../app/[locale]/solutions/rechuli-lu-gaizao-fengxian-zhouqi/page.tsx',
);
const liningSource = readSource(
  '../../app/[locale]/solutions/rechuli-lu-luchen-fanxin/page.tsx',
);
const energySource = readSource(
  '../../app/[locale]/solutions/rechuli-lu-dian-gai-ran-yure-huishou/page.tsx',
);
const templateSource = readSource('../../components/geo-pages/GeoAuthorityGuidePage.tsx');
const blocksSource = readSource('../../components/geo-pages/GeoPageBlocks.tsx');
const faqSource = readSource('../../components/geo-pages/GeoFaqGridClient.tsx');
const renovationHubSource = readSource(
  '../../app/[locale]/service/furnace-renovation-overhaul/page.tsx',
);
const quoteParamsSource = readSource(
  '../../app/[locale]/articles/gongye-lu-baojia-canshu/page.tsx',
);
const repairOrReplaceSource = readSource(
  '../../app/[locale]/articles/laojiu-rechuli-lu-daxiu-haishi-maixin/page.tsx',
);
const globalsSource = readSource('../../app/globals.css');
const uiTemplateSource = readSource(
  '../../../../docs/seo-geo/ui-review/authority-topic-template-v1.html',
);

describe('P5 authority topic pages', () => {
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

  it('keeps every numbered section heading centered and touch targets accessible', () => {
    expect(blocksSource).toContain('<div className="text-center">');
    expect(templateSource).toContain('mx-auto mb-7 max-w-[900px] text-center');
    expect(templateSource).toContain('mx-auto max-w-[900px] text-center');
    expect(templateSource).toContain('flex min-h-11 shrink-0 items-center');
    expect(faqSource).toContain('flex min-h-11 w-full items-center');
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

  it('covers the approved lining facts while keeping internal status text off the page', () => {
    for (const marker of [
      '炉衬坏了一小块，是否只补这一块？',
      '纤维模块压缩量越大越好吗？',
      '炉衬翻新后能承诺节能多少吗？',
      'Q01',
      'Q02',
      'Q03',
      'Q06',
      '1140 型',
      '压缩量≥40%',
      '800℃',
      '热桥除外',
      '40 K',
      'reviewerName="王工"',
    ]) {
      expect(liningSource).toContain(marker);
    }
    expect(liningSource).not.toContain('页面状态：UI 审核稿');
    expect(liningSource).not.toContain('事实单元：');
    expect(liningSource).not.toContain('Dataset');
  });

  it('covers the approved energy-conversion facts and safety boundaries', () => {
    for (const marker of [
      '热处理炉电改燃一定更省钱吗？',
      '两用燃料系统关闭烧嘴供风就安全了吗？',
      '烟气温度高就适合做余热回收吗？',
      'Q04',
      'Q05',
      'SN-CASE-P1-014',
      '13×7.4×4.3 m',
      '700℃',
      '14 个温控区',
      '8820 kW',
      '空气侧断风不等于燃料侧隔离',
      'FAT 不能替代 SAT',
      'reviewerName="王工"',
    ]) {
      expect(energySource).toContain(marker);
    }
    expect(energySource).not.toContain('页面状态：UI 审核稿');
    expect(energySource).not.toContain('事实单元：');
    expect(energySource).not.toContain('Dataset');
  });

  it('builds bidirectional body links from the three existing decision pages', () => {
    for (const source of [renovationHubSource, quoteParamsSource, repairOrReplaceSource]) {
      expect(source).toContain('/zh/solutions/rechuli-lu-luchen-fanxin');
      expect(source).toContain('/zh/solutions/rechuli-lu-dian-gai-ran-yure-huishou');
    }
    for (const source of [liningSource, energySource]) {
      expect(source).toContain('/zh/service/furnace-renovation-overhaul');
      expect(source).toContain('/zh/articles/gongye-lu-baojia-canshu');
      expect(source).toContain('/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin');
    }
  });

  it('emits Article, breadcrumb, organization and FAQ JSON-LD only', () => {
    for (const source of [temperatureSource, riskSource, liningSource, energySource]) {
      expect(source).toContain('getArticleJsonLd');
      expect(source).toContain('getBreadcrumbJsonLd');
      expect(source).toContain("getOrganizationJsonLd('zh')");
      expect(source).toContain("'@type': 'Organization'");
      expect(source).toContain('getFaqJsonLd');
      expect(source).not.toContain('getDataset');
      expect(source).not.toContain('Dataset');
    }
  });

  it('returns real 404 responses for the unsupported English routes', () => {
    for (const response of [
      getTemperatureEnglishRoute(),
      headTemperatureEnglishRoute(),
      getRiskCycleEnglishRoute(),
      headRiskCycleEnglishRoute(),
      getLiningEnglishRoute(),
      headLiningEnglishRoute(),
      getEnergyConversionEnglishRoute(),
      headEnergyConversionEnglishRoute(),
    ]) {
      expect(response.status).toBe(404);
    }

    expect(isZhOnlyPath('/en/solutions/rechuli-lu-wendu-bujun-zhenggai')).toBe(true);
    expect(isZhOnlyPath('/en/solutions/rechuli-lu-gaizao-fengxian-zhouqi')).toBe(true);
    expect(isZhOnlyPath('/en/solutions/rechuli-lu-luchen-fanxin')).toBe(true);
    expect(isZhOnlyPath('/en/solutions/rechuli-lu-dian-gai-ran-yure-huishou')).toBe(true);
  });
});
