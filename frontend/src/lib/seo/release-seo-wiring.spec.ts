import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const root = new URL('../../../../', import.meta.url);

describe('search-related production wiring', () => {
  it.each(['prepare-frontend.yml', 'prepare-release.yml'])('passes all four public ownership values in %s', (file) => {
    const workflow = readFileSync(new URL(`.github/workflows/${file}`, root), 'utf8');
    const dockerfile = readFileSync(new URL('frontend/Dockerfile', root), 'utf8');
    for (const engine of ['BAIDU', 'BING', '360', 'SOGOU']) {
      const name = `NEXT_PUBLIC_${engine}_SITE_VERIFICATION`;
      expect(workflow).toContain(name + ': ${' + '{ vars.' + name + ' || secrets.' + name + ' }}');
      expect(workflow).toContain(`--build-arg "${name}=$${name}"`);
      expect(dockerfile).toContain(`ARG ${name}`);
      expect(dockerfile).toContain(`ENV ${name}=\${${name}}`);
    }
  });
  it('rejects unknown PHP paths in all three website hosts while preserving exact legacy mappings', () => {
    const nginx = readFileSync(new URL('nginx.prod.conf.template', root), 'utf8');
    const generic = [...nginx.matchAll(/location ~ \\\.php\$ \{([\s\S]*?)\}/g)];
    expect(generic).toHaveLength(3);
    for (const [, body] of generic) {
      expect(body).toContain('return 404;');
      expect(body).not.toContain('301');
    }
    for (const legacy of ['/product/showproduct.php', '/product/product.php', '/news/shownews.php', '/news/news.php']) {
      const blocks = nginx.split(`location = ${legacy} {`).slice(1);
      expect(blocks).toHaveLength(3);
      for (const block of blocks) expect(block.split('}')[0]).toContain('return 301');
    }
  });
});
