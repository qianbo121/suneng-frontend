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
const origins = [
  ['HTTP apex/www', 'jssngyl.cn ${DOMAIN}', '80'],
  ['HTTPS apex', 'jssngyl.cn', '443 ssl'],
  ['HTTPS canonical', '${DOMAIN}', '443 ssl'],
] as const;
const ledger = JSON.parse(readFileSync(new URL('docs/acquisition-repair-20261004/legacy-news-mappings.json', root), 'utf8')) as {
  mappingCount: number; originalNewsBodyRestored: boolean; preservedProductMapSha256: string;
  mappings: Array<{ oldId: number; oldUrl: string; oldTitle: string; archiveTimestamp: string; archiveReplayUrl: string;
    originalUrlAndTimestampVerified: boolean; newRequestPath: string; newTarget: string; newCanonical: string;
    newObservedStatus: number; newNoindex: boolean; originalNewsBodyRestored: boolean; mappingIntent: string; limits: string[];
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

describe('verified original-PHP news equipment continuity', () => {
  it('permits only the three approved news IDs and the existing news default', () => {
    expect([...newsMap().entries()].sort()).toEqual([['default', '/zh/news'], ...approved].sort());
  });

  it.each(approved)('news %s continues to its verified equipment type on every public origin', (id, path) => {
    expect(newsMap().get(id)).toBe(path);
    for (const [, serverName, listen] of origins) {
      const body = locationBody(publicBlock(serverName, listen), '/news/shownews.php');
      expect(body).toBe('return 301 https://www.jssngyl.cn$legacy_news_path;');
      expect(body).not.toMatch(/\$(args|arg_id|query_string|request_uri|is_args|legacy_product_path)\b/);
    }
  });

  it.each(['', '44', '150', '186', '999999', '038', '38x', '%33%38'])('unapproved or nonexact news ID %s stays at the news fallback', (id) => {
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

  it('preserves the complete pre-change 33-product map byte for byte', () => {
    const hash = createHash('sha256').update(mapBody('legacy_product_path')[0]).digest('hex');
    expect(hash).toBe('df128b9c0e816d85f1ee11c29fbfdfbeff62ec86d8bdb9f565c27b2d1a38b9b8');
    expect(ledger.preservedProductMapSha256).toBe(hash);
  });

  it('binds each approved ID to exact archived identity without claiming article restoration', () => {
    expect(ledger.mappingCount).toBe(3);
    expect(ledger.originalNewsBodyRestored).toBe(false);
    expect(ledger.mappings.map((row) => [String(row.oldId), row.newRequestPath]).sort()).toEqual([...approved].sort());
    for (const row of ledger.mappings) {
      expect(row.oldUrl).toBe('http://jssngyl.cn/news/shownews.php?id=' + row.oldId);
      expect(row.archiveTimestamp).toMatch(/^\d{14}$/);
      expect(row.archiveReplayUrl).toBe('https://web.archive.org/web/' + row.archiveTimestamp + '/' + row.oldUrl);
      expect(row.originalUrlAndTimestampVerified).toBe(true);
      expect(row.oldTitle).not.toBe('');
      expect(row.newTarget).toBe('https://www.jssngyl.cn' + row.newRequestPath);
      expect(row.newCanonical).toBe(row.newTarget);
      expect(row.newObservedStatus).toBe(200);
      expect(row.newNoindex).toBe(false);
      expect(row.originalNewsBodyRestored).toBe(false);
      expect(row.mappingIntent).toBe('same-equipment-type-only');
      expect(row.limits.length).toBeGreaterThan(0);
      for (const key of ['originalArticleTextSha256', 'originalArticleHtmlSha256', 'originalResponseSha256'] as const) {
        expect(row.sourceEvidence[key]).toMatch(/^[a-f0-9]{64}$/);
      }
    }
  });
});
