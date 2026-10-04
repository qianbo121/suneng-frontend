import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const root = new URL('../../../../', import.meta.url);
const nginx = readFileSync(new URL('nginx.prod.conf.template', root), 'utf8');
const approved = [
  ['38', '/zh/products/detail/trolley-furnace'],
  ['39', '/zh/products/detail/trolley-furnace'],
  ['41', '/zh/products/detail/mesh-belt-furnace'],
] as const;
const approvedQuestions = [
  ['25', '/zh/news/mesh-belt-furnace-oil-fume-treatment-checklist'],
  ['37', '/zh/news/mesh-belt-furnace-carbon-cleaning-review'],
  ['40', '/zh/news/mesh-belt-furnace-quality-tracking-checklist'],
  ['42', '/zh/news/gas-trolley-furnace-operation-maintenance-documents'],
  ['44', '/zh/news/mesh-belt-quenching-furnace-principle-process-checklist'],
] as const;
const allApproved = [...approved, ...approvedQuestions];
const approvedQuestionBodies = [
  [25, '93020b979b7325ba76226d20197f76784d8527c570b7758a999b4ab087433c3a', '915cae0852d118a6271d9792611995acc4d7d3ebc0be8d239cd9ae31c4749ed1'],
  [37, 'f240b1fcef80caa7e9ee7595ec6a7e80c2ead2e92a613ce0e9bb9f173640a43b', 'f28cd6b409172bb09069fa7e871f72dfb264bfa45015de787828d8d086732420'],
  [40, '7fad6e299efc5b3a57e6776ebc45194c31267679659e02bf6b2d3c5d3850c43f', '8dc2d6274073e6c2cab677c177106c63db7ce8b9dbce49b94e57a012aa72e442'],
  [42, '217016968d02fa3ffec1ea34b0789d4eb2835d6154985270a17bbd9c4af7677c', 'bcb363612bfa014ba97c05f243f2ee77081e5335e45f85d2029126c485e6386f'],
  [44, '7e99b633cc16627db8ba1ac9888c37e0617b156a699011ea203112a2403ee2e9', '77b9ce2a0be4dc707b44b2cb81cd6ff912382a20c5656e02f5f3b8a13b714600'],
] as const;
const origins = [
  ['HTTP apex/www', 'jssngyl.cn ${DOMAIN}', '80'],
  ['HTTPS apex', 'jssngyl.cn', '443 ssl'],
  ['HTTPS canonical', '${DOMAIN}', '443 ssl'],
] as const;
const ledger = JSON.parse(readFileSync(new URL('docs/acquisition-repair-20261004/legacy-news-mappings.json', root), 'utf8')) as {
  mappingCount: number; originalNewsBodyRestored: boolean; preservedProductMapSha256: string;
  newQuestionMappingIds: number[]; currentPublishedTotalMappingsBeforeThisChange: number; candidateTotalMappings: number;
  mappings: Array<{ oldId: number; oldUrl: string; oldTitle: string; archiveTimestamp: string; archiveReplayUrl: string;
    originalUrlAndTimestampVerified: boolean; newRequestPath: string; newTarget: string; newCanonical: string;
    newObservedStatus: number | null; newNoindex: boolean | null; originalNewsBodyRestored: boolean; mappingIntent: string; limits: string[];
    newTitle?: string; newCategoryId?: number; newObservedAt?: string | null; publicationState?: string;
    reviewedReplacementBodyPublished?: boolean; newLegacyRedirectDeployed?: boolean;
    reviewedReplacement?: { draftSha256: string; htmlSha256: string; contentEquivalentToApprovedPreview: boolean;
      bodyAndUiApprovedAccordingToTrustedParent: boolean; scope: { language: string; newImages: boolean; externalChannels: boolean } };
    sourceEvidence: { originalArticleTextSha256: string; originalArticleHtmlSha256: string; originalResponseSha256: string } }>;
};

// Inspect the real checked-in configuration; these are static contracts, not Nginx execution.
function mapBody(variable: string) {
  const matches = [...nginx.matchAll(new RegExp('map\\s+\\$arg_id\\s+\\$' + variable + '\\s*\\{([\\s\\S]*?)\\}', 'g'))];
  expect(matches).toHaveLength(1);
  return matches[0];
}

function newsMap() {
  const entries = mapBody('legacy_news_path')[1].trim().split('\n').map((row) => {
    const match = row.trim().match(/^(default|\d+)\s+(\/zh\/[a-z0-9/-]+);$/);
    expect(match, 'Only exact decimal IDs and a single default are allowed: ' + row).not.toBeNull();
    return [match![1], match![2]] as const;
  });
  expect(new Set(entries.map(([id]) => id)).size).toBe(entries.length);
  return new Map(entries);
}

function publicBlock(serverName: string, listen: string) {
  const blocks: string[] = [];
  for (const match of nginx.matchAll(/(?:^|\n)\s*server\s*\{/g)) {
    const start = match.index! + match[0].length;
    let depth = 1;
    let end = start;
    for (; end < nginx.length && depth; end++) {
      if (nginx[end] === '{') depth++;
      if (nginx[end] === '}') depth--;
    }
    expect(depth).toBe(0);
    blocks.push(nginx.slice(start, end - 1));
  }
  const matches = blocks.filter((block) => block.includes('server_name ' + serverName + ';') && block.includes('listen ' + listen + ';'));
  expect(matches).toHaveLength(1);
  return matches[0];
}

function locationBody(block: string, path: string) {
  const matches = block.split('location = ' + path + ' {');
  expect(matches).toHaveLength(2);
  return matches[1].split('}')[0].trim();
}

describe('verified original-PHP news continuity', () => {
  it('permits only the eight approved news IDs and the existing news default', () => {
    expect([...newsMap().entries()].sort()).toEqual([['default', '/zh/news'], ...allApproved].sort());
  });

  it.each(allApproved)('news %s continues to its approved destination on every public origin', (id, path) => {
    expect(newsMap().get(id)).toBe(path);
    for (const [, serverName, listen] of origins) {
      const body = locationBody(publicBlock(serverName, listen), '/news/shownews.php');
      expect(body).toBe('return 301 https://www.jssngyl.cn$legacy_news_path;');
      expect(body).not.toMatch(/\$(args|arg_id|query_string|request_uri|is_args|legacy_product_path)\b/);
    }
  });

  it.each(['', '43', '150', '186', '999999', '038', '38x', '%33%38', '025', '37x', '%33%37'])('unapproved or nonexact news ID %s stays at the news fallback', (id) => {
    expect(newsMap().has(id)).toBe(false);
    expect(newsMap().get('default')).toBe('/zh/news');
  });

  it.each(origins)('%s keeps news mapping isolated from directories, products and unknown PHP', (_label, serverName, listen) => {
    const block = publicBlock(serverName, listen);
    const prefix = listen === '443 ssl' && serverName === '${DOMAIN}' ? '' : 'https://www.jssngyl.cn';
    for (const path of ['/news/index.php', '/news/news.php']) {
      expect(locationBody(block, path)).toBe('return 301 ' + prefix + '/zh/news;');
    }
    expect(locationBody(block, '/product/showproduct.php')).toBe('return 301 https://www.jssngyl.cn$legacy_product_path;');
    for (const path of ['/product/product.php', '/product/index.php']) {
      expect(locationBody(block, path)).toBe('return 301 ' + prefix + '/zh/products;');
    }
    expect(block.match(/\$legacy_news_path\b/g)).toHaveLength(1);
    const unknown = block.split('location ~ \\.php$ {').slice(1);
    expect(unknown).toHaveLength(1);
    expect(unknown[0].split('}')[0].trim()).toBe('return 404;');
  });

  it('preserves the pre-news 33-product map apart from the four later approved thermal-section entries', () => {
    const historicalMap = mapBody('legacy_product_path')[0]
      .replace(/^    19[3-6] \/zh\/products\/detail\/annealing-solution-line;\n/gm, '');
    const hash = createHash('sha256').update(historicalMap).digest('hex');
    expect(hash).toBe('df128b9c0e816d85f1ee11c29fbfdfbeff62ec86d8bdb9f565c27b2d1a38b9b8');
    expect(ledger.preservedProductMapSha256).toBe(hash);
  });

  it('binds each approved ID to exact archived identity without claiming article restoration', () => {
    expect(ledger.mappingCount).toBe(8);
    expect(ledger.originalNewsBodyRestored).toBe(false);
    expect(ledger.mappings.map((row) => [String(row.oldId), row.newRequestPath]).sort()).toEqual([...allApproved].sort());
    for (const row of ledger.mappings) {
      expect(row.oldUrl).toBe('http://jssngyl.cn/news/shownews.php?id=' + row.oldId);
      expect(row.archiveTimestamp).toMatch(/^\d{14}$/);
      expect(row.archiveReplayUrl).toBe('https://web.archive.org/web/' + row.archiveTimestamp + '/' + row.oldUrl);
      expect(row.originalUrlAndTimestampVerified).toBe(true);
      expect(row.oldTitle).not.toBe('');
      expect(row.newTarget).toBe('https://www.jssngyl.cn' + row.newRequestPath);
      expect(row.newCanonical).toBe(row.newTarget);
      if (approved.some(([id]) => id === String(row.oldId))) {
        expect(row.newObservedStatus).toBe(200);
        expect(row.newNoindex).toBe(false);
        expect(row.mappingIntent).toBe('same-equipment-type-only');
      }
      expect(row.originalNewsBodyRestored).toBe(false);
      expect(row.limits.length).toBeGreaterThan(0);
      for (const key of ['originalArticleTextSha256', 'originalArticleHtmlSha256', 'originalResponseSha256'] as const) {
        expect(row.sourceEvidence[key]).toMatch(/^[a-f0-9]{64}$/);
      }
    }
  });

  it('keeps the five reviewed question targets separate from existing equipment continuity', () => {
    expect(ledger.newQuestionMappingIds).toEqual([25, 37, 40, 42, 44]);
    expect(ledger.currentPublishedTotalMappingsBeforeThisChange).toBe(36);
    expect(ledger.candidateTotalMappings).toBe(41);
    const rows = ledger.mappings.filter((row) => row.mappingIntent === 'same-question-reviewed-replacement');
    expect(rows.map((row) => [String(row.oldId), row.newRequestPath]).sort()).toEqual([...approvedQuestions].sort());
    for (const [id, draftSha256, htmlSha256] of approvedQuestionBodies) {
      const row = rows.find((item) => item.oldId === id)!;
      expect(row.newTitle).not.toBe('');
      expect(row.newCategoryId).toBe(1);
      expect(row.newObservedAt).toBeNull();
      expect(row.newObservedStatus).toBeNull();
      expect(row.newNoindex).toBeNull();
      expect(row.publicationState).toBe('pending-target-publication-and-edge-release');
      expect(row.reviewedReplacementBodyPublished).toBe(false);
      expect(row.newLegacyRedirectDeployed).toBe(false);
      expect(row.reviewedReplacement).toMatchObject({
        draftSha256, htmlSha256, contentEquivalentToApprovedPreview: true,
        bodyAndUiApprovedAccordingToTrustedParent: true,
        scope: { language: 'zh', newImages: false, externalChannels: false },
      });
    }
  });
});
