import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { TSINGSHAN_1250_CASE_SEO } from '@/lib/seo/page-data';

const readSource = (relativePath: string) =>
  fs.readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');

const sourceRoot = fileURLToPath(new URL('../../', import.meta.url));
const collectSourceFiles = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = `${directory}/${entry.name}`;
    if (entry.isDirectory()) {
      return collectSourceFiles(entryPath);
    }
    return /\.(?:ts|tsx|json)$/.test(entry.name) ? [entryPath] : [];
  });

const caseSource = readSource(
  '../../app/[locale]/case/anonymous-tsingshan-1250-renovation/page.tsx',
);
const solutionSource = readSource(
  '../../app/[locale]/solutions/continuous-heat-treatment-line/page.tsx',
);
const unrelatedPublicSources = [
  readSource('../../app/[locale]/service/furnace-renovation-overhaul/page.tsx'),
  readSource('../../app/[locale]/partner/page.tsx'),
  readSource('../../app/[locale]/solutions/rechuli-lu-changjia/page.tsx'),
  readSource('../../app/[locale]/solutions/jiangsu-gongye-lu-changjia/page.tsx'),
];

const internalOnlyClaims = [
  '63.7 元/吨',
  '120 万吨/年',
  '7,644 万元/年',
  'GB 28665-2012',
];

const legacyRouteToken = 'anonymous-tsingshan-1250-renovation';
const allowedLegacyRouteFiles = [
  '/app/[locale]/case/anonymous-tsingshan-1250-renovation/page.tsx',
  '/app/en/case/anonymous-tsingshan-1250-renovation/route.ts',
];

describe('high-risk case fact governance', () => {
  it('publishes only source-confirmed project scope in indexable metadata', () => {
    const metadata = [
      TSINGSHAN_1250_CASE_SEO.title,
      TSINGSHAN_1250_CASE_SEO.description,
      TSINGSHAN_1250_CASE_SEO.ogTitle,
      TSINGSHAN_1250_CASE_SEO.ogDescription,
    ].join('\n');

    expect(metadata).toContain('3 条 1250mm');
    expect(metadata).toContain('运行核验方法');
    for (const claim of internalOnlyClaims) {
      expect(metadata).not.toContain(claim);
    }
    expect(metadata).not.toContain('青山');
    expect(metadata.toLowerCase()).not.toContain('tsingshan');
    expect(TSINGSHAN_1250_CASE_SEO.modifiedTime).toContain('2026-07-31');
  });

  it('keeps unverified economic and emissions outcomes off the public case page', () => {
    expect(caseSource).toContain('3 条 1250 mm');
    expect(caseSource).toContain('经济性结论需以可比运行记录复核');
    expect(caseSource).toContain('未经验证的方案测算不作为对外结果');
    expect(caseSource).toContain('以有资质第三方检测或正式验收报告为准');

    for (const claim of internalOnlyClaims) {
      expect(caseSource).not.toContain(claim);
    }
    expect(caseSource).not.toContain('项目测算型结果案例');
    expect(caseSource).not.toContain('30–45 个工作日');
    expect(caseSource).not.toContain('4–6 个月');
    expect(caseSource).not.toContain('30–60 天');
    expect(caseSource).not.toContain('技术准确、公司允许、客户允许');
    expect(caseSource).not.toContain('三道审核');
  });

  it('allows a bounded summary on the hub but prevents unrelated-page duplication', () => {
    expect(solutionSource).toContain('3 条 1250 mm');
    expect(solutionSource).toContain('冷煤气总设计量 17150 Nm³/h');
    expect(solutionSource).toContain('以上只对应本项目燃料与设备边界');
    expect(solutionSource).not.toContain('7,644 万元');
    expect(solutionSource).not.toContain('63.7 元/吨');
    expect(solutionSource).not.toContain('120 万吨/年');

    for (const source of unrelatedPublicSources) {
      expect(source).not.toContain('7,644 万元');
      expect(source).not.toContain('63.7 元/吨');
      expect(source).not.toContain('120 万吨/年');
    }
  });

  it('retains customer anonymity and confines identity-like route tokens to the frozen URL', () => {
    const sourceFiles = collectSourceFiles(sourceRoot).filter(
      (filePath) => !filePath.endsWith('/high-risk-case-governance.spec.ts'),
    );
    const pathsWithIdentityTokens = sourceFiles
      .map((filePath) => filePath.slice(sourceRoot.length))
      .filter((relativePath) => /(?:tsingshan|qingshan)/iu.test(relativePath));

    expect(pathsWithIdentityTokens).toEqual(allowedLegacyRouteFiles);

    for (const filePath of sourceFiles) {
      const source = fs
        .readFileSync(filePath, 'utf8')
        .replaceAll(legacyRouteToken, '')
        .replaceAll('TSINGSHAN_1250_CASE_SEO', '')
        .replaceAll('AnonymousTsingshanCasePage', '');

      expect(source).not.toMatch(/青山/iu);
      expect(source).not.toMatch(/qingshan/iu);
      expect(source).not.toMatch(/tsingshan/iu);
    }
  });
});
