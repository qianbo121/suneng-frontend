import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const dockerfiles = ['frontend/Dockerfile', 'backend/Dockerfile', 'admin/Dockerfile'];

describe('production Docker dependency context', () => {
  it.each(dockerfiles)('%s provides Prisma schema before workspace install', (relativePath) => {
    const source = readFileSync(new URL(`../../../../${relativePath}`, import.meta.url), 'utf8');
    const schemaCopy = source.indexOf(
      'COPY backend/prisma/schema.prisma ./backend/prisma/schema.prisma',
    );
    const workspaceInstall = source.indexOf('pnpm install --frozen-lockfile');

    expect(schemaCopy).toBeGreaterThan(-1);
    expect(workspaceInstall).toBeGreaterThan(schemaCopy);
    expect(source).toContain('type=cache,id=pnpm-store');
  });
});
