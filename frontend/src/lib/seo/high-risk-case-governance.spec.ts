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
const serviceSource = readSource(
  '../../app/[locale]/service/furnace-renovation-overhaul/page.tsx',
);
const publicSources = [
  caseSource,
  serviceSource,
  readSource('../../app/[locale]/partner/page.tsx'),
  readSource('../../app/[locale]/solutions/rechuli-lu-changjia/page.tsx'),
  readSource('../../app/[locale]/solutions/jiangsu-gongye-lu-changjia/page.tsx'),
];

const unapprovedClaims = [
  '青山',
  '青山系',
  '1250mm',
  '1,250mm',
  '7,644',
  '7644 万元',
  '7644万元',
  '63.7',
  '120 万吨',
  '120万吨',
  '30-45 个工作日',
  '4-6 个月',
  '30-60 天',
];

const unapprovedEmissionsClaims = [
  'NOx 排放达标',
  '满足 GB',
  '满足相关国家标准',
  '通过环保验收',
  '超低排放',
  '50mg',
];

const legacyRouteToken = 'anonymous-tsingshan-1250-renovation';
const allowedLegacyRouteFiles = [
  '/app/[locale]/case/anonymous-tsingshan-1250-renovation/page.tsx',
  '/app/en/case/anonymous-tsingshan-1250-renovation/route.ts',
];
const forbiddenSourcePatterns = [
  /青山/iu,
  /qingshan/iu,
  /tsingshan/iu,
  /1,?250\s*(?:mm|毫米)/iu,
  /7,?644\s*万元?/iu,
  /63\.7\s*元/iu,
  /120\s*万吨/iu,
  /1,?200,?000\s*吨/iu,
  /1\.2\s*mt/iu,
  /30\s*(?:-|~|—|至)\s*45\s*个?工作日/iu,
  /4\s*(?:-|~|—|至)\s*6\s*个?月/iu,
  /30\s*(?:-|~|—|至)\s*60\s*天/iu,
  /NOx\s*排放达标/iu,
  /满足\s*GB/iu,
  /满足相关国家标准/iu,
  /通过环保验收/iu,
  /超低排放/iu,
  /50\s*mg/iu,
];

describe('high-risk case fact governance', () => {
  it('keeps unapproved customer and performance claims out of indexable metadata', () => {
    const metadata = [
      TSINGSHAN_1250_CASE_SEO.title,
      TSINGSHAN_1250_CASE_SEO.description,
      TSINGSHAN_1250_CASE_SEO.ogTitle,
      TSINGSHAN_1250_CASE_SEO.ogDescription,
    ].join('\n');

    for (const claim of unapprovedClaims) {
      expect(metadata).not.toContain(claim);
    }
    expect(metadata.toLowerCase()).not.toContain('tsingshan');
    expect(TSINGSHAN_1250_CASE_SEO.modifiedTime).toContain('2026-07-29');
  });

  it('does not publish the pending QingShan scale, benefit, cycle, or emissions claims', () => {
    for (const claim of unapprovedClaims) {
      for (const source of publicSources) {
        expect(source).not.toContain(claim);
      }
    }

    for (const claim of unapprovedEmissionsClaims) {
      for (const source of publicSources) {
        expect(source).not.toContain(claim);
      }
    }

    expect(caseSource).not.toContain('技术准确、公司允许、客户允许');
    expect(caseSource).not.toContain('三道审核');
    expect(serviceSource).not.toContain('三道审核');
    expect(caseSource).toContain('本页不以设计目标代替检测结论');
    expect(caseSource).toContain('本页不披露未经授权');
    expect(serviceSource).toContain('本页不披露未经授权');
  });

  it('keeps source-wide content free of fingerprint combinations outside the frozen legacy URL', () => {
    const sourceFiles = collectSourceFiles(sourceRoot).filter(
      (filePath) => !filePath.endsWith('/high-risk-case-governance.spec.ts'),
    );
    const pathsWithIdentityTokens = sourceFiles
      .map((filePath) => filePath.slice(sourceRoot.length))
      .filter((relativePath) => /(?:tsingshan|qingshan|1250)/iu.test(relativePath));

    expect(pathsWithIdentityTokens).toEqual(allowedLegacyRouteFiles);

    for (const filePath of sourceFiles) {
      const source = fs
        .readFileSync(filePath, 'utf8')
        .replaceAll(legacyRouteToken, '')
        .replaceAll('TSINGSHAN_1250_CASE_SEO', '')
        .replaceAll('AnonymousTsingshanCasePage', '');

      for (const pattern of forbiddenSourcePatterns) {
        expect(source).not.toMatch(pattern);
      }

      const fingerprintCount = [
        /1,?250/iu,
        /120\s*万吨/iu,
        /13\s*区/iu,
        /S7-1500/iu,
        /ET200SP/iu,
        /7,?644/iu,
        /63\.7/iu,
      ].filter((pattern) => pattern.test(source)).length;
      expect(fingerprintCount).toBeLessThan(2);
    }
  });
});
