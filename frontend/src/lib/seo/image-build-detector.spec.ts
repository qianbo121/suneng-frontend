import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const detector = fileURLToPath(
  new URL('../../../../scripts/requires-image-build.sh', import.meta.url),
);

function classifyChange(relativePath: string) {
  const repository = mkdtempSync(join(tmpdir(), 'corp-site-image-change-'));

  try {
    execFileSync('git', ['init', '-q'], { cwd: repository });
    writeFileSync(join(repository, 'README.md'), 'initial\n');
    execFileSync('git', ['add', '.'], { cwd: repository });
    execFileSync(
      'git',
      ['-c', 'user.name=CI', '-c', 'user.email=ci@example.com', 'commit', '-qm', 'initial'],
      { cwd: repository },
    );

    const target = join(repository, relativePath);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, 'changed\n');
    execFileSync('git', ['add', '.'], { cwd: repository });
    execFileSync(
      'git',
      ['-c', 'user.name=CI', '-c', 'user.email=ci@example.com', 'commit', '-qm', 'change'],
      { cwd: repository },
    );

    return spawnSync('bash', [detector, 'HEAD^', 'HEAD'], {
      cwd: repository,
      encoding: 'utf8',
    });
  } finally {
    rmSync(repository, { recursive: true, force: true });
  }
}

describe('production image change detector', () => {
  it.each([
    '.github/workflows/deploy.yml',
    'frontend/src/lib/seo/example.spec.ts',
    'docs/runbook.md',
  ])('reuses images for release-only change %s', (relativePath) => {
    const result = classifyChange(relativePath);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('existing images are reusable');
  });

  it.each([
    'frontend/src/app/page.tsx',
    'backend/src/main.ts',
    'frontend/Dockerfile',
    'pnpm-lock.yaml',
  ])('requires images for runtime change %s', (relativePath) => {
    const result = classifyChange(relativePath);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(`required by: ${relativePath}`);
  });
});
