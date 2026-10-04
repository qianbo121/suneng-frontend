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
] as const;

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
    const match = row.match(/^(default|\d+)\s+(\/[a-z0-9/-]+);$/);
    expect(match, 'Only exact decimal IDs and one default are permitted: ' + row).not.toBeNull();
    return [match![1], match![2]] as const;
  });
  expect(new Set(entries.map(([id]) => id)).size).toBe(entries.length);
  return new Map(entries);
}

describe('seven verified original-PHP product redirects', () => {
  it('permits exactly seven known IDs and preserves the existing catalog default', () => {
    expect([...productMap().entries()].sort()).toEqual([
      ['default', '/zh/products'],
      ...verifiedProducts,
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

  it.each(['', '151', '153', '155', '165', '170', '1500', '0150', '%31%35%30'])(
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
      ['/news/shownews.php', '/zh/news'],
      ['/news/news.php', '/zh/news'],
    ]) {
      const body = locationBody(block, legacy);
      expect(body).toBe('return 301 ' + prefix + target + ';');
      expect(body).not.toContain('$legacy_product_path');
    }
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
