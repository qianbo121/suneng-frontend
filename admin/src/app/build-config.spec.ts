import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('admin production build configuration', () => {
  it('lets the bundler avoid circular vendor chunks', () => {
    const config = readFileSync(new URL('../../vite.config.ts', import.meta.url), 'utf8');

    expect(config).not.toContain('manualChunks');
    expect(config).not.toContain('vendor-react');
  });
});
