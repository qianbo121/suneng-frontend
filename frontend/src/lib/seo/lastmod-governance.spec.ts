import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import contentRevisionEvidence from './content-revision-evidence.json';

const REPO_ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
const PAGE_DATA_PATH = 'frontend/src/lib/seo/page-data.ts';

const routeFilesBySeoExport: Record<string, string> = {
  FURNACE_RENOVATION_OVERHAUL_SEO:
    'frontend/src/app/[locale]/service/furnace-renovation-overhaul/page.tsx',
  INDUSTRIAL_FURNACE_QUOTE_PARAMS_SEO:
    'frontend/src/app/[locale]/articles/gongye-lu-baojia-canshu/page.tsx',
  OLD_HEAT_TREATMENT_FURNACE_REPAIR_OR_REPLACE_SEO:
    'frontend/src/app/[locale]/articles/laojiu-rechuli-lu-daxiu-haishi-maixin/page.tsx',
  TEMPERATURE_UNIFORMITY_REMEDIATION_SEO:
    'frontend/src/app/[locale]/solutions/rechuli-lu-wendu-bujun-zhenggai/page.tsx',
  FURNACE_RENOVATION_RISK_CYCLE_GUIDE_SEO:
    'frontend/src/app/[locale]/solutions/rechuli-lu-gaizao-fengxian-zhouqi/page.tsx',
  FURNACE_LINING_RENOVATION_GUIDE_SEO:
    'frontend/src/app/[locale]/solutions/rechuli-lu-luchen-fanxin/page.tsx',
  FURNACE_ENERGY_CONVERSION_HEAT_RECOVERY_SEO:
    'frontend/src/app/[locale]/solutions/rechuli-lu-dian-gai-ran-yure-huishou/page.tsx',
  FURNACE_CONTROL_SYSTEM_UPGRADE_SEO:
    'frontend/src/app/[locale]/solutions/rechuli-lu-kongzhi-xitong-shengji/page.tsx',
  FURNACE_RESTART_RELOCATION_REMANUFACTURING_SEO:
    'frontend/src/app/[locale]/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan/page.tsx',
};

function git(args: string[]) {
  return execFileSync('git', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
}

function readGitFile(ref: string, relativePath: string) {
  try {
    return git(['show', `${ref}:${relativePath}`]);
  } catch {
    return null;
  }
}

function extractModifiedTimes(source: string) {
  const times = new Map<string, string>();
  const exportPattern = /export const ([A-Z0-9_]+)[^=]*= \{([\s\S]*?)\n\};/g;

  for (const match of source.matchAll(exportPattern)) {
    const modifiedTime = match[2].match(/modifiedTime:\s*'([^']+)'/)?.[1];
    if (modifiedTime) times.set(match[1], modifiedTime);
  }

  return times;
}

function contentFingerprint(source: string) {
  return source
    .replace(/const relatedLinks = \[[\s\S]*?\n\s*\];/g, '')
    .replace(/^\s*const \w+Path = ['"][^'"]+['"];\s*$/gm, '')
    .replace(/\s+/g, '');
}

function comparisonRef() {
  const pageDataStatus = git(['status', '--porcelain', '--', PAGE_DATA_PATH]).trim();
  return pageDataStatus ? 'HEAD' : 'HEAD^';
}

type ContentRevisionEvidence = {
  commit: string;
  modifiedTime: string;
  files: string[];
  bodySha256: Record<string, string>;
};

// Metadata can be reconciled after its substantive body was committed separately.
// Accept only the exact recorded commit time and unchanged, verifiable body files;
// this does not permit an arbitrary newer date or a link-only revision.
function hasVerifiedHistoricalRevision(
  evidence: ContentRevisionEvidence | undefined,
  currentTime: string,
) {
  if (!evidence || currentTime !== evidence.modifiedTime || !evidence.files.length) return false;
  // The original body commit is local provenance, outside main's history.
  // Its timestamp and exact files were verified before recording these hashes.
  // A shallow checkout can validate that frozen evidence without fetching an
  // unrelated work branch; full-history checkouts also verify the commit itself.
  for (const file of evidence.files) {
    const currentPath = path.join(REPO_ROOT, file);
    if (!fs.existsSync(currentPath)) return false;
    const digest = createHash('sha256').update(fs.readFileSync(currentPath)).digest('hex');
    if (digest !== evidence.bodySha256[file]) return false;
  }
  const hasCommit = spawnSync('git', ['cat-file', '-e', `${evidence.commit}^{commit}`], {
    cwd: REPO_ROOT, stdio: 'ignore',
  }).status === 0;
  if (!hasCommit) return true;
  const commitTime = git(['show', '-s', '--format=%cI', evidence.commit]).trim();
  if (currentTime !== commitTime) return false;

  let substantiveChange = false;
  for (const relativePath of evidence.files) {
    const committed = readGitFile(evidence.commit, relativePath);
    const currentPath = path.join(REPO_ROOT, relativePath);
    if (committed === null || !fs.existsSync(currentPath)) return false;
    if (fs.readFileSync(currentPath, 'utf8') !== committed) return false;
    const parent = readGitFile(`${evidence.commit}^`, relativePath);
    if (parent === null || contentFingerprint(parent) !== contentFingerprint(committed)) {
      substantiveChange = true;
    }
  }
  return substantiveChange;
}

describe('lastmod content governance', () => {
  it('verifies historical corrections against their actual committed body and timestamp', () => {
    for (const evidence of Object.values(contentRevisionEvidence)) {
      expect(hasVerifiedHistoricalRevision(evidence, evidence.modifiedTime)).toBe(true);
      expect(hasVerifiedHistoricalRevision(evidence, '2026-09-29T00:00:00+08:00')).toBe(false);
      expect(hasVerifiedHistoricalRevision({ ...evidence, files: [] }, evidence.modifiedTime)).toBe(false);
      expect(hasVerifiedHistoricalRevision({ ...evidence, bodySha256: {} }, evidence.modifiedTime)).toBe(false);
    }
  });

  it('treats path constants and related-link cards as link-only changes', () => {
    const before = `
      const contactPath = '/zh/contact';
      const relatedLinks = [
        { title: '联系', href: contactPath, text: '提交参数。' },
      ];
      const directAnswer = '先核对工况。';
    `;
    const after = `
      const contactPath = '/zh/contact';
      const authorityPath = '/zh/solutions/authority';
      const relatedLinks = [
        { title: '联系', href: contactPath, text: '提交参数。' },
        { title: '权威主题', href: authorityPath, text: '查看判断方法。' },
      ];
      const directAnswer = '先核对工况。';
    `;

    expect(contentFingerprint(after)).toBe(contentFingerprint(before));
  });

  it('recognizes visible conclusion changes as substantive content', () => {
    const before = "const directAnswer = '先核对工况。';";
    const after = "const directAnswer = '先核对工况、测量条件和验收边界。';";

    expect(contentFingerprint(after)).not.toBe(contentFingerprint(before));
  });

  it('does not advance an existing page lastmod for link-only changes', () => {
    const baseRef = comparisonRef();
    const previousPageData = readGitFile(baseRef, PAGE_DATA_PATH);
    expect(previousPageData, `Unable to read ${PAGE_DATA_PATH} from ${baseRef}`).not.toBeNull();

    const currentPageData = fs.readFileSync(path.join(REPO_ROOT, PAGE_DATA_PATH), 'utf8');
    const previousTimes = extractModifiedTimes(previousPageData!);
    const currentTimes = extractModifiedTimes(currentPageData);
    const violations: string[] = [];

    for (const [seoExport, routePath] of Object.entries(routeFilesBySeoExport)) {
      const previousTime = previousTimes.get(seoExport);
      const currentTime = currentTimes.get(seoExport);

      // A newly created page legitimately starts with publishedTime === modifiedTime.
      if (!previousTime || !currentTime) continue;

      const previousTimestamp = new Date(previousTime).getTime();
      const currentTimestamp = new Date(currentTime).getTime();

      // Corrections that restore an older truthful date are allowed.
      if (currentTimestamp <= previousTimestamp) continue;

      const previousRoute = readGitFile(baseRef, routePath);
      const currentRoutePath = path.join(REPO_ROOT, routePath);

      // A route absent from the comparison ref is a new page, not a freshness update.
      if (!previousRoute || !fs.existsSync(currentRoutePath)) continue;

      const currentRoute = fs.readFileSync(currentRoutePath, 'utf8');
      const evidence = (contentRevisionEvidence as Record<string, ContentRevisionEvidence>)[seoExport];
      if (
        contentFingerprint(previousRoute) === contentFingerprint(currentRoute) &&
        !hasVerifiedHistoricalRevision(evidence, currentTime)
      ) {
        violations.push(`${seoExport} -> ${routePath}`);
      }
    }

    expect(
      violations,
      'Existing pages may advance modifiedTime only when visible content changes; relatedLinks and path constants do not count.',
    ).toEqual([]);
  });
});
