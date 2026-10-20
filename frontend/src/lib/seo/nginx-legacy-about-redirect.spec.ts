import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const root = new URL('../../../../', import.meta.url);
const production = readFileSync(new URL('nginx.prod.conf.template', root), 'utf8');
const development = readFileSync(new URL('nginx.conf', root), 'utf8');
const serverBlocks = (config: string) => [...config.matchAll(/^  server \{\n([\s\S]*?)^  \}/gm)].map((match) => match[1]);
const publicHosts = ['jssngyl.cn ${DOMAIN}', 'jssngyl.cn', '${DOMAIN}'];

function exactLocation(server: string, path: string): string {
  const marker = `    location = ${path} {`;
  expect(server.split(marker)).toHaveLength(2);
  return server.split(marker)[1].split('}')[0];
}

describe('legacy about directories use one permanent canonical redirect', () => {
  it.each(publicHosts)('handles both directory forms on the production host block %s', (hosts) => {
    const servers = serverBlocks(production).filter((server) => server.includes(`server_name ${hosts};`));
    expect(servers).toHaveLength(1);
    for (const path of ['/about', '/about/']) {
      expect(exactLocation(servers[0], path).trim()).toBe(
        'return 301 https://www.jssngyl.cn/zh/about$is_args$args;',
      );
    }
  });

  it('keeps the public HTTP fallback configuration consistent', () => {
    const servers = serverBlocks(development).filter((server) => server.includes('server_name jssngyl.cn www.jssngyl.cn;'));
    expect(servers).toHaveLength(1);
    for (const path of ['/about', '/about/']) {
      expect(exactLocation(servers[0], path).trim()).toBe(
        'return 301 https://www.jssngyl.cn/zh/about$is_args$args;',
      );
    }
  });

  it('does not apply the new redirects to other hosts or unknown descendants', () => {
    for (const [config, expectedCount] of [[production, 3], [development, 1]] as const) {
      const affected = serverBlocks(config).filter((server) => server.includes('location = /about {'));
      expect(affected).toHaveLength(expectedCount);
      expect(config).not.toMatch(/location\s+(?:\^~\s+)?\/about\/?\s*\{/);
    }
  });
});
