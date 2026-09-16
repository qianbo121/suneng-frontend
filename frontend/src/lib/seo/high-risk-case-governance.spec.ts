import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

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

const caseMetadata = JSON.parse(readSource('../../../content/cases/continuous-line-renovation.json'));
const caseSource = readSource(`../../../content/cases/${caseMetadata.body}`);
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
];

describe('high-risk case fact governance', () => {
  it('keeps source-confirmed project scope in withdrawn metadata', () => {
    const metadata = [
      caseMetadata.title,
      caseMetadata.summary,
      caseMetadata.publicCustomerName || '',
      caseMetadata.cover?.alt || '',
      caseMetadata.cover?.caption || '',
      JSON.stringify(caseMetadata.facts),
    ].join('\n');

    expect(caseMetadata.publicationStatus).toBe('draft');
    expect(metadata).toContain('连续退洗线');
    expect(caseMetadata.id).toBe('continuous-line-renovation');
    expect(caseMetadata.title).toBe('连续退洗线天然气改冷煤气，旧风管和烟道还能用吗？');
    expect(caseMetadata.summary).toContain('由天然气改用冷煤气');
    expect(caseMetadata.summary).toContain('助燃空气管路局部调整利旧');
    expect(caseMetadata.contentType).toBe('proposal');
    expect(caseMetadata.projectStatus).toBe('proposal');
    expect(caseMetadata.sourceSummary).toContain('不作为已制造、投运或验收结果');
    for (const claim of internalOnlyClaims) {
      expect(metadata).not.toContain(claim);
    }
    expect(metadata).not.toContain('青山');
    expect(metadata.toLowerCase()).not.toContain('tsingshan');
    expect(Number.isFinite(Date.parse(caseMetadata.dateModified))).toBe(true);
    expect(readSource('../../app/[locale]/case/anonymous-tsingshan-1250-renovation/page.tsx')).toContain(caseMetadata.slug);
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
    expect(solutionSource).toContain('/zh/case');
    expect(caseSource).toContain('3 条 1250 mm');
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
    expect(caseSource).not.toMatch(/青山|qingshan|tsingshan/iu);
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
        .replaceAll('AnonymousTsingshanCasePage', '')
        .replaceAll('包头市青山区厂前路', '包头市区地址');

      expect(source).not.toMatch(/青山/iu);
      expect(source).not.toMatch(/qingshan/iu);
      expect(source).not.toMatch(/tsingshan/iu);
    }
  });
});
