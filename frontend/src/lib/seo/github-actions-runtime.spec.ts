import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const workflows = ['ci.yml', 'deploy.yml'].map((name) => ({
  name,
  source: readFileSync(new URL(`../../../../.github/workflows/${name}`, import.meta.url), 'utf8'),
}));

const minimumMajors = new Map([
  ['actions/checkout', 7],
  ['actions/setup-node', 7],
  ['pnpm/action-setup', 6],
]);

describe('GitHub Actions runtime governance', () => {
  it.each(workflows)('$name uses Node 24-compatible action majors', ({ source }) => {
    for (const [action, minimumMajor] of minimumMajors) {
      const matches = [...source.matchAll(new RegExp(`${action.replace('/', '\\/')}@v(\\d+)`, 'g'))];

      expect(matches.length).toBeGreaterThan(0);
      for (const match of matches) {
        expect(Number(match[1])).toBeGreaterThanOrEqual(minimumMajor);
      }
    }
  });
});
