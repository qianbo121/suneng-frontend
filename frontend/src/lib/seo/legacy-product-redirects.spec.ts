import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { approvedProcurementPages } from '../approved-procurement-pages';

const root = new URL('../../../../', import.meta.url);
const nginx = readFileSync(new URL('nginx.prod.conf.template', root), 'utf8');
const verifiedProducts = [
  ['150', '/zh/products/detail/trolley-furnace'],
  ['152', '/zh/products/detail/trolley-furnace'],
  ['154', '/zh/products/detail/trolley-furnace'],
  ['166', '/zh/products/detail/mesh-belt-furnace'],
  ['167', '/zh/products/detail/mesh-belt-furnace'],
  ['168', '/zh/products/detail/mesh-belt-furnace'],
  ['169', '/zh/products/detail/mesh-belt-furnace'],
  ['123', '/zh/products/detail/trolley-furnace'],
  ['125', '/zh/products/detail/trolley-furnace'],
  ['142', '/zh/products/detail/trolley-furnace'],
  ['143', '/zh/products/detail/trolley-furnace'],
  ['147', '/zh/products/detail/trolley-furnace'],
  ['156', '/zh/products/detail/trolley-furnace'],
  ['158', '/zh/products/detail/trolley-furnace'],
  ['242', '/zh/products/detail/trolley-furnace'],
  ['164', '/zh/products/detail/mesh-belt-furnace'],
  ['165', '/zh/products/detail/mesh-belt-furnace'],
  ['159', '/zh/products/detail/mesh-belt-furnace'],
  ['160', '/zh/products/detail/mesh-belt-furnace'],
  ['161', '/zh/products/detail/mesh-belt-furnace'],
  ['162', '/zh/products/detail/mesh-belt-furnace'],
  ['163', '/zh/products/detail/mesh-belt-furnace'],
  ['170', '/zh/products/detail/mesh-belt-furnace'],
  ['171', '/zh/products/detail/mesh-belt-furnace'],
  ['172', '/zh/products/detail/mesh-belt-furnace'],
  ['173', '/zh/products/detail/mesh-belt-furnace'],
  ['141', '/zh/products/detail/pit-furnace'],
  ['175', '/zh/products/detail/bell-furnace'],
  ['177', '/zh/products/detail/bell-furnace'],
] as const;
const verifiedWorkshopPages = ['186', '187', '188', '189'].map((id) => [id, '/zh/about#delivery'] as const);
const verifiedAnnealingFurnaces = ['193', '194', '195', '196'].map((id) => [id, '/zh/products/detail/annealing-solution-line'] as const);
const approvedUiProcurementMappings = [
  ['122', '/zh/articles/special-industrial-furnace-procurement-assessment#room-gas-forging-regenerative-assessment'],
  ['124', '/zh/articles/special-industrial-furnace-procurement-assessment#room-gas-forging-regenerative-assessment'],
  ['132', '/zh/articles/special-industrial-furnace-procurement-assessment#room-gas-forging-regenerative-assessment'],
  ['136', '/zh/articles/special-industrial-furnace-procurement-assessment#room-gas-forging-regenerative-assessment'],
  ['137', '/zh/articles/special-industrial-furnace-procurement-assessment#room-gas-forging-regenerative-assessment'],
  ['138', '/zh/articles/special-industrial-furnace-procurement-assessment#room-gas-forging-regenerative-assessment'],
  ['139', '/zh/articles/special-industrial-furnace-procurement-assessment#room-gas-forging-regenerative-assessment'],
  ['140', '/zh/articles/special-industrial-furnace-procurement-assessment#room-gas-forging-regenerative-assessment'],
  ['144', '/zh/articles/special-industrial-furnace-procurement-assessment#solution-nitriding-atmosphere-assessment'],
  ['145', '/zh/articles/special-industrial-furnace-procurement-assessment#solution-nitriding-atmosphere-assessment'],
  ['146', '/zh/articles/special-industrial-furnace-procurement-assessment#solution-nitriding-atmosphere-assessment'],
  ['148', '/zh/articles/special-industrial-furnace-procurement-assessment#solution-nitriding-atmosphere-assessment'],
  ['149', '/zh/articles/special-industrial-furnace-procurement-assessment#solution-nitriding-atmosphere-assessment'],
  ['151', '/zh/articles/special-industrial-furnace-procurement-assessment#solution-nitriding-atmosphere-assessment'],
  ['153', '/zh/articles/special-industrial-furnace-procurement-assessment#solution-nitriding-atmosphere-assessment'],
  ['155', '/zh/articles/special-industrial-furnace-procurement-assessment#solution-nitriding-atmosphere-assessment'],
  ['157', '/zh/articles/special-industrial-furnace-procurement-assessment#solution-nitriding-atmosphere-assessment'],
  ['174', '/zh/articles/special-industrial-furnace-procurement-assessment#large-bell-assessment'],
  ['176', '/zh/articles/special-industrial-furnace-procurement-assessment#large-bell-assessment'],
  ['178', '/zh/articles/special-industrial-furnace-procurement-assessment#oven-preheat-curing-assessment'],
  ['179', '/zh/articles/special-industrial-furnace-procurement-assessment#oven-preheat-curing-assessment'],
  ['180', '/zh/articles/special-industrial-furnace-procurement-assessment#oven-preheat-curing-assessment'],
  ['181', '/zh/articles/special-industrial-furnace-procurement-assessment#oven-preheat-curing-assessment'],
  ['182', '/zh/articles/special-industrial-furnace-procurement-assessment#spheroidizing-assessment'],
  ['183', '/zh/articles/special-industrial-furnace-procurement-assessment#spheroidizing-assessment'],
  ['184', '/zh/articles/special-industrial-furnace-procurement-assessment#spheroidizing-assessment'],
  ['185', '/zh/articles/special-industrial-furnace-procurement-assessment#spheroidizing-assessment'],
  ['205', '/zh/service/industrial-furnace-parts-purchasing#parts-heating'],
  ['206', '/zh/service/industrial-furnace-parts-purchasing#parts-baskets-welded'],
  ['207', '/zh/service/industrial-furnace-parts-purchasing#parts-baskets-welded'],
  ['208', '/zh/service/industrial-furnace-parts-purchasing#parts-baskets-welded'],
  ['209', '/zh/service/industrial-furnace-parts-purchasing#parts-baskets-welded'],
  ['210', '/zh/service/industrial-furnace-parts-purchasing#parts-baskets-welded'],
  ['211', '/zh/service/industrial-furnace-parts-purchasing#parts-baskets-welded'],
  ['212', '/zh/service/industrial-furnace-parts-purchasing#parts-heating'],
  ['213', '/zh/service/industrial-furnace-parts-purchasing#parts-heating'],
  ['214', '/zh/service/industrial-furnace-parts-purchasing#parts-heating'],
  ['215', '/zh/service/industrial-furnace-parts-purchasing#parts-heating'],
  ['216', '/zh/service/industrial-furnace-parts-purchasing#parts-heating'],
  ['217', '/zh/service/industrial-furnace-parts-purchasing#parts-heating'],
  ['218', '/zh/service/industrial-furnace-parts-purchasing#parts-fans-shafts'],
  ['219', '/zh/service/industrial-furnace-parts-purchasing#parts-cover-motor-guide'],
  ['220', '/zh/service/industrial-furnace-parts-purchasing#parts-fans-shafts'],
  ['221', '/zh/service/industrial-furnace-parts-purchasing#parts-fans-shafts'],
  ['222', '/zh/service/industrial-furnace-parts-purchasing#parts-fans-shafts'],
  ['223', '/zh/service/industrial-furnace-parts-purchasing#parts-fans-shafts'],
  ['224', '/zh/service/industrial-furnace-parts-purchasing#parts-fans-shafts'],
  ['225', '/zh/service/industrial-furnace-parts-purchasing#parts-cover-motor-guide'],
  ['226', '/zh/service/industrial-furnace-parts-purchasing#parts-fans-shafts'],
  ['227', '/zh/service/industrial-furnace-parts-purchasing#parts-heating'],
  ['228', '/zh/service/industrial-furnace-parts-purchasing#parts-heating'],
  ['241', '/zh/service/industrial-furnace-parts-purchasing#parts-cover-motor-guide'],
  ['243', '/zh/articles/special-industrial-furnace-procurement-assessment#oven-preheat-curing-assessment'],
  ['244', '/zh/articles/special-industrial-furnace-procurement-assessment#oven-preheat-curing-assessment'],
  ['245', '/zh/articles/special-industrial-furnace-procurement-assessment#oven-preheat-curing-assessment'],
] as const;
const verifiedMappings = [...verifiedProducts, ...verifiedWorkshopPages, ...verifiedAnnealingFurnaces, ...approvedUiProcurementMappings];
const continuedMappings = [["126", "/zh/products/detail/trolley-furnace#selection"], ["127", "/zh/articles/special-industrial-furnace-procurement-assessment#drying-furnace-assessment"], ["128", "/zh/articles/special-industrial-furnace-procurement-assessment#drying-furnace-assessment"], ["129", "/zh/products/detail/trolley-furnace#selection"], ["130", "/zh/products/detail/trolley-furnace#selection"], ["131", "/zh/products/detail/trolley-furnace#selection"], ["133", "/zh/articles/special-industrial-furnace-procurement-assessment#gas-furnace-assessment"], ["134", "/zh/products/detail/trolley-furnace#selection"], ["135", "/zh/products/detail/trolley-furnace#selection"], ["190", "/zh/articles/special-industrial-furnace-procurement-assessment#stainless-annealing-pickling-assessment"], ["191", "/zh/articles/special-industrial-furnace-procurement-assessment#stainless-annealing-pickling-assessment"], ["192", "/zh/articles/special-industrial-furnace-procurement-assessment#stainless-annealing-pickling-assessment"], ["197", "/zh/service/industrial-furnace-parts-purchasing#parts-mesh-belt"], ["198", "/zh/service/industrial-furnace-parts-purchasing#parts-trays-baskets"], ["199", "/zh/service/industrial-furnace-parts-purchasing#parts-trays-baskets"], ["200", "/zh/service/industrial-furnace-parts-purchasing#parts-gas-radiant"], ["201", "/zh/service/industrial-furnace-parts-purchasing#parts-gas-radiant"], ["202", "/zh/service/industrial-furnace-parts-purchasing#parts-gas-radiant"], ["203", "/zh/service/industrial-furnace-parts-purchasing#parts-heat-resistant-identity"], ["204", "/zh/service/industrial-furnace-parts-purchasing#parts-heat-resistant-identity"], ["229", "/zh/service/industrial-furnace-parts-purchasing#parts-heating"], ["230", "/zh/service/industrial-furnace-parts-purchasing#parts-brand-fit"], ["231", "/zh/service/industrial-furnace-parts-purchasing#parts-brand-fit"], ["232", "/zh/service/industrial-furnace-parts-purchasing#parts-brand-fit"], ["233", "/zh/service/industrial-furnace-parts-purchasing#parts-pusher-column-beam"], ["234", "/zh/service/industrial-furnace-parts-purchasing#parts-pusher-column-beam"], ["235", "/zh/service/industrial-furnace-parts-purchasing#parts-pusher-column-beam"], ["236", "/zh/service/industrial-furnace-parts-purchasing#parts-trays-baskets"], ["237", "/zh/service/industrial-furnace-parts-purchasing#parts-pusher-column-beam"], ["238", "/zh/service/industrial-furnace-parts-purchasing#parts-pusher-column-beam"], ["239", "/zh/service/industrial-furnace-parts-purchasing#parts-guide-chain"], ["240", "/zh/service/industrial-furnace-parts-purchasing#parts-guide-chain"]] as const;
const allVerifiedMappings = [...verifiedMappings, ...continuedMappings];
const verifiedDirectoryIds = ['123', '125', '142', '143', '147', '156', '158', '242', '164', '165', '159', '160', '161', '162', '163', '170', '171', '172', '173', '141', '175', '177'] as const;
const mappingLedger = JSON.parse(readFileSync(new URL('docs/acquisition-repair-20261004/legacy-product-mappings.json', root), 'utf8')) as {
  mappingCount: number;
  mappings: Array<{ oldId: number; oldUrl: string; oldTitle: string; newRequestPath: string; sourceType?: string; mappingIntent?: string; originalDetailBodyRestored?: boolean; newRulePublished?: boolean; targetFragment?: string; targetBodySha256?: string; newStatus?: number | null; newNoindex?: boolean | null; publicationState?: string;
    sourceAnchors?: Array<{ originalHref: string; sourceOldUrl: string; anchorVisibleText: string; originalHtmlFileSha256: string }> }>;
};

// Read the checked-in configuration, never reconstruct it from a test fixture.
// This is a static routing contract; actual Nginx -t / HTTP checks are separate.
function serverBlocks(source: string) {
  const blocks: string[] = [];
  for (const match of source.matchAll(/(?:^|\n)\s*server\s*\{/g)) {
    const start = match.index! + match[0].length;
    let depth = 1;
    let end = start;
    for (; end < source.length && depth; end++) {
      if (source[end] === '{') depth++;
      if (source[end] === '}') depth--;
    }
    if (depth !== 0) throw new Error('Unclosed server block');
    blocks.push(source.slice(start, end - 1));
  }
  return blocks;
}

const publicHosts = [
  ['HTTP apex/www', 'jssngyl.cn ${DOMAIN}', '80'],
  ['HTTPS apex', 'jssngyl.cn', '443 ssl'],
  ['HTTPS canonical', '${DOMAIN}', '443 ssl'],
] as const;

function publicBlock(serverName: string, listen: string) {
  const matches = serverBlocks(nginx).filter((block) =>
    block.includes('server_name ' + serverName + ';') &&
    block.includes('listen ' + listen + ';'));
  expect(matches).toHaveLength(1);
  return matches[0];
}

function locationBody(block: string, legacy: string) {
  const marker = 'location = ' + legacy + ' {';
  const pieces = block.split(marker);
  expect(pieces).toHaveLength(2);
  return pieces[1].split('}')[0].trim();
}

function productMap() {
  const maps = [...nginx.matchAll(/map\s+\$arg_id\s+\$legacy_product_path\s*\{([\s\S]*?)\}/g)];
  expect(maps).toHaveLength(1);
  const rows = maps[0][1].split('\n').map((line) => line.trim()).filter(Boolean);
  const entries = rows.map((row) => {
    const match = row.match(/^(default|\d+)\s+(\/[a-z0-9/-]+|"\/zh\/[a-z0-9/-]+#[a-z0-9-]+");$/);
    expect(match, 'Only exact decimal IDs and one default are permitted: ' + row).not.toBeNull();
    return [match![1], match![2].replace(/^"|"$/g, '')] as const;
  });
  expect(new Set(entries.map(([id]) => id)).size).toBe(entries.length);
  return new Map(entries);
}

describe('verified original-PHP product redirects', () => {
  it('permits exactly the approved known IDs and preserves the existing catalog default', () => {
    expect([...productMap().entries()].sort()).toEqual([
      ['default', '/zh/products'],
      ...allVerifiedMappings,
    ].sort());
  });

  it.each(verifiedProducts)('old product %s maps to its verified equipment type', (id, target) => {
    expect(productMap().get(id)).toBe(target);
    for (const [, serverName, listen] of publicHosts) {
      const body = locationBody(publicBlock(serverName, listen), '/product/showproduct.php');
      expect(body).toBe('return 301 https://www.jssngyl.cn$legacy_product_path;');
      expect(body).not.toMatch(/\$(args|arg_id|query_string|request_uri|is_args)\b/);
    }
  });

  it.each(verifiedWorkshopPages)('old workshop %s reaches the existing company delivery section', (id, target) => {
    expect(productMap().get(id)).toBe(target);
    for (const [, serverName, listen] of publicHosts) {
      expect(locationBody(publicBlock(serverName, listen), '/product/showproduct.php'))
        .toBe('return 301 https://www.jssngyl.cn$legacy_product_path;');
    }
    const row = mappingLedger.mappings.find((entry) => String(entry.oldId) === id)!;
    expect(row.oldTitle).toBe('设备制作车间');
    expect(row.sourceType).toBe('original-directory-photo-company-anchor');
    expect(row.mappingIntent).toBe('photo-company-intent');
    expect(row.sourceAnchors).toHaveLength(1);
    for (const anchor of row.sourceAnchors ?? []) {
      expect(new URL(anchor.originalHref, anchor.sourceOldUrl).href).toBe(row.oldUrl);
      expect(new URL(row.oldUrl).hostname).toBe('jssngyl.cn');
      expect(anchor.anchorVisibleText).toBe('设备制作车间');
      expect(anchor.originalHtmlFileSha256).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  it.each(verifiedAnnealingFurnaces)('old stainless annealing furnace %s retains thermal-section procurement intent', (id, target) => {
    expect(productMap().get(id)).toBe(target);
    for (const [, serverName, listen] of publicHosts) {
      expect(locationBody(publicBlock(serverName, listen), '/product/showproduct.php'))
        .toBe('return 301 https://www.jssngyl.cn$legacy_product_path;');
    }
    const row = mappingLedger.mappings.find((entry) => String(entry.oldId) === id)!;
    expect(row.oldTitle).toBe('不锈钢连续退火酸洗退火炉设备');
    expect(row.sourceType).toBe('original-directory-thermal-section-procurement-anchor');
    expect(row.mappingIntent).toBe('stainless-continuous-annealing-thermal-section-procurement-intent');
    expect(row.originalDetailBodyRestored).toBe(false);
    expect(row.newRulePublished).toBe(false);
    expect(row.sourceAnchors).toHaveLength(1);
    for (const anchor of row.sourceAnchors ?? []) {
      expect(new URL(anchor.originalHref, anchor.sourceOldUrl).href).toBe(row.oldUrl);
      expect(new URL(row.oldUrl).hostname).toBe('jssngyl.cn');
      expect(anchor.anchorVisibleText).toBe(row.oldTitle);
      expect(anchor.originalHtmlFileSha256).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  it.each(approvedUiProcurementMappings)('approved old product %s reaches the exact procurement family without publication claims', (id, path) => {
    expect(productMap().get(id)).toBe(path);
    const row = mappingLedger.mappings.find((entry) => String(entry.oldId) === id)!;
    expect(row.oldUrl).toBe('http://jssngyl.cn/product/showproduct.php?id=' + id);
    expect(row.oldTitle).not.toBe('');
    expect(row.targetFragment).toBe(new URL('https://www.jssngyl.cn' + path).hash.slice(1));
    expect(row.targetBodySha256).toMatch(/^[a-f0-9]{64}$/);
    expect(row.originalDetailBodyRestored).toBe(false);
    expect(row.newRulePublished).toBe(false);
    expect(row.newStatus).toBeNull();
    expect(row.newNoindex).toBeNull();
    expect(row.publicationState).toBe('approved-candidate-awaiting-three-target-publication-and-edge-release');
    for (const [, serverName, listen] of publicHosts) {
      expect(locationBody(publicBlock(serverName, listen), '/product/showproduct.php'))
        .toBe('return 301 https://www.jssngyl.cn$legacy_product_path;');
    }
  });

  it('points every approved family fragment at the exact approved source body', () => {
    for (const [id, path] of approvedUiProcurementMappings) {
      const target = new URL('https://www.jssngyl.cn' + path);
      const page = Object.values(approvedProcurementPages).find((item) => item.path === target.pathname);
      expect(page, 'No approved page for old product ' + id).toBeDefined();
      if (!page) throw new Error('Missing approved procurement page');
      expect(createHash('sha256').update(page.html).digest('hex')).toBe(page.sha256);
      const fragment = target.hash.slice(1);
      expect(page.html.match(new RegExp('id="' + fragment + '"', 'g'))).toHaveLength(1);
      expect(mappingLedger.mappings.find((row) => String(row.oldId) === id)?.targetBodySha256).toBe(page.originalApprovedBodySha256);
    }
  });

  it('adds only the approved 56 rows to the already published 45-rule template', () => {
    let baseline = nginx.replace(/  map \$arg_class2 \$legacy_product_category_path \{\n[\s\S]*?\n  \}\n\n/, '');
    for (const [, serverName, listen] of publicHosts) {
      const block = publicBlock(serverName, listen);
      const prefix = listen === '443 ssl' && serverName === '${DOMAIN}' ? '' : 'https://www.jssngyl.cn';
      const restored = block
        .replaceAll('return 301 https://www.jssngyl.cn$legacy_product_category_path;', 'return 301 ' + prefix + '/zh/products;')
        .replace(/^[ \t]*location = \/product\/ \{\n[ \t]*return 301 https:\/\/www\.jssngyl\.cn\/zh\/products;\n[ \t]*\}\n\n/gm, '');
      baseline = baseline.replace(block, restored);
    }
    for (const [id, target] of continuedMappings) {
      const line = '    ' + id + ' "' + target + '";\n';
      expect(baseline.split(line)).toHaveLength(2);
      baseline = baseline.replace(line, '');
    }
    for (const [id, path] of approvedUiProcurementMappings) {
      const line = '    ' + id + ' "' + path + '";\n';
      expect(baseline.split(line)).toHaveLength(2);
      baseline = baseline.replace(line, '');
    }
    baseline = baseline.replace('    43 /zh/news/annealing-furnace-metal-semiconductor-selection;\n', '');
    expect(createHash('sha256').update(baseline).digest('hex'))
      .toBe('2dd0aa587f170e7ed3d67aaf211022c0365ec8efcda713e95d1d9fc9cbbfa7dc');
    expect(approvedUiProcurementMappings).toHaveLength(55);
    expect(new Set(approvedUiProcurementMappings.map(([, path]) => new URL('https://www.jssngyl.cn' + path).hash)).size).toBe(9);
  });

  it('keeps the mapping ledger consistent and binds new IDs to exact original directory links', () => {
    expect(mappingLedger.mappingCount).toBe(verifiedMappings.length);
    expect(mappingLedger.mappings.map((row) => [String(row.oldId), row.newRequestPath]).sort()).toEqual([...verifiedMappings].sort());
    const directoryRows = mappingLedger.mappings.filter((row) => row.sourceType === 'original-directory-anchor');
    expect(directoryRows.map((row) => String(row.oldId)).sort()).toEqual([...verifiedDirectoryIds].sort());
    for (const row of directoryRows) {
      expect(row.sourceAnchors?.length).toBeGreaterThan(0);
      for (const anchor of row.sourceAnchors ?? []) {
        expect(new URL(anchor.originalHref, anchor.sourceOldUrl).href).toBe(row.oldUrl);
        expect(anchor.anchorVisibleText).toContain(row.oldTitle);
        expect(anchor.originalHtmlFileSha256).toMatch(/^[a-f0-9]{64}$/);
      }
    }
  });

  it.each(['', '246', '999999', '1500', '0150', '%31%35%30', '1860', '0186', '%31%38%36', '1220', '0122', '%31%32%32', '2050', '0205', '%32%30%35', '1930', '0193', '%31%39%33'])(
    'unverified or nonexact ID %s retains the catalog fallback',
    (id) => {
      const map = productMap();
      expect(map.has(id)).toBe(false);
      expect(map.get('default')).toBe('/zh/products');
    },
  );

  it.each(publicHosts)('%s keeps other historical routes and unknown-PHP rejection', (_label, serverName, listen) => {
    const block = publicBlock(serverName, listen);
    const prefix = listen === '443 ssl' && serverName === '${DOMAIN}' ? '' : 'https://www.jssngyl.cn';
    for (const [legacy, target] of [
      ['/contact/show.php', '/zh/contact'],
      ['/about/show.php', '/zh/about'],
      ['/news/index.php', '/zh/news'],
      ['/index.php', '/zh'],
      ['/news/news.php', '/zh/news'],
    ]) {
      const body = locationBody(block, legacy);
      expect(body).toBe('return 301 ' + prefix + target + ';');
      expect(body).not.toContain('$legacy_product_path');
    }
    for (const path of ['/product/product.php', '/product/index.php']) {
      expect(locationBody(block, path)).toBe('return 301 https://www.jssngyl.cn$legacy_product_category_path;');
    }
    expect(locationBody(block, '/news/shownews.php')).toBe('return 301 https://www.jssngyl.cn$legacy_news_path;');
    const unknown = block.split('location ~ \\.php$ {').slice(1);
    expect(unknown).toHaveLength(1);
    expect(unknown[0].split('}')[0].trim()).toBe('return 404;');
  });

  it('substitutes only domain placeholders so the new Nginx variable survives both launch paths', () => {
    const compose = readFileSync(new URL('docker-compose.prod.yml', root), 'utf8');
    const deploy = readFileSync(new URL('deploy.sh', root), 'utf8');
    expect(compose).toContain("envsubst '$$DOMAIN $$ADMIN_DOMAIN'");
    expect(deploy).toContain("NGINX_SUBST_VARS=$DOMAIN $ADMIN_DOMAIN");
    expect(deploy).toContain('envsubst "$NGINX_SUBST_VARS"');
  });
});
