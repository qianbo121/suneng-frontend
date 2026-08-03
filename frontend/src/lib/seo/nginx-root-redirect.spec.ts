import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const nginxTemplate = readFileSync(
  new URL('../../../../nginx.prod.conf.template', import.meta.url),
  'utf8',
);

describe('public root redirect governance', () => {
  it('keeps exactly one deterministic permanent redirect from www root to Chinese home', () => {
    const matches = nginxTemplate.match(
      /location = \/ \{\s*return 308 https:\/\/\$DOMAIN\/zh;\s*\}/g,
    );

    expect(matches).toHaveLength(1);
  });
});
