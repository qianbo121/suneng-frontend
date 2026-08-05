import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const dockerfiles = ['frontend/Dockerfile', 'backend/Dockerfile', 'admin/Dockerfile'];
const backendDockerfile = readFileSync(
  new URL('../../../../backend/Dockerfile', import.meta.url),
  'utf8',
);
const productionCompose = readFileSync(
  new URL('../../../../docker-compose.prod.yml', import.meta.url),
  'utf8',
);

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

  it('starts the backend from the path copied into the runtime image', () => {
    const runtimeEntry = 'backend/dist/src/main.js';

    expect(backendDockerfile).toContain(`CMD ["node", "${runtimeEntry}"]`);
    expect(productionCompose).toContain(`command: node ${runtimeEntry}`);
    expect(productionCompose).not.toContain('command: node dist/src/main.js');
  });
});
