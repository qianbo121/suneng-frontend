import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

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
const verifiedMappings = [...verifiedProducts, ...verifiedWorkshopPages, ...verifiedAnnealingFurnaces];
const verifiedDirectoryIds = ['123', '125', '142', '143', '147', '156', '158', '242', '164', '165', '159', '160', '161', '162', '163', '170', '171', '172', '173', '141', '175', '177'] as const;
const mappingLedger = JSON.parse(readFileSync(new URL('docs/acquisition-repair-20261004/legacy-product-mappings.json', root), 'utf8')) as {
  mappingCount: number;
  mappings: Array<{ oldId: number; oldUrl: string; oldTitle: string; newRequestPath: string; sourceType?: string; mappingIntent?: string; originalDetailBodyRestored?: boolean; newRulePublished?: boolean;
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
    const match = row.match(/^(default|\d+)\s+(\/[a-z0-9/-]+|"\/zh\/about#delivery");$/);
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
      ...verifiedMappings,
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

  it.each(['', '139', '148', '149', '151', '153', '155', '174', '176', '999999', '1500', '0150', '%31%35%30', '1860', '0186', '%31%38%36', '122', '124', '132', '136', '137', '138', '192', '197', '1930', '0193', '%31%39%33'])(
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
      ['/product/index.php', '/zh/products'],
      ['/news/index.php', '/zh/news'],
      ['/index.php', '/zh'],
      ['/product/product.php', '/zh/products'],
      ['/news/news.php', '/zh/news'],
    ]) {
      const body = locationBody(block, legacy);
      expect(body).toBe('return 301 ' + prefix + target + ';');
      expect(body).not.toContain('$legacy_product_path');
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
