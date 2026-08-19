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


/**
 * 造一串提交，返回仓库路径与各提交的 SHA。
 * 用来验「基线不是 HEAD^ 而是上次成功部署的提交」这件事。
 */
function repositoryWithCommits(files: string[]) {
  const repository = mkdtempSync(join(tmpdir(), 'corp-site-image-range-'));
  const git = (...args: string[]) =>
    execFileSync('git', ['-c', 'user.name=CI', '-c', 'user.email=ci@example.com', ...args], {
      cwd: repository,
      encoding: 'utf8',
    }).trim();

  git('init', '-q');
  writeFileSync(join(repository, 'README.md'), 'initial\n');
  git('add', '.');
  git('commit', '-qm', 'initial');
  const shas = [git('rev-parse', 'HEAD')];

  for (const relativePath of files) {
    const target = join(repository, relativePath);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, 'changed\n');
    git('add', '.');
    git('commit', '-qm', `change ${relativePath}`);
    shas.push(git('rev-parse', 'HEAD'));
  }
  return { repository, shas };
}

function runDetector(repository: string, base: string, head: string) {
  return spawnSync('bash', [detector, base, head], { cwd: repository, encoding: 'utf8' });
}

describe('production image change detector', () => {
  it.each([
    '.github/workflows/deploy.yml',
    'nginx.prod.conf.template',
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

  it('sees an image-relevant change that happened before the previous commit', () => {
    // 2026-08-19 实录：后端改动那次部署超时、从没构建；
    // 下一个提交只改了工作流文件。若基线取 HEAD^，就只看见"只改工作流"，
    // 判定跳过构建——后端改动凭空消失。基线必须是上次成功部署的提交。
    const { repository, shas } = repositoryWithCommits([
      'backend/src/main.ts', // 需要重建镜像
      '.github/workflows/deploy.yml', // 在跳过清单里
    ]);
    try {
      // 取 HEAD^ 当基线：只看见工作流改动 → 误判为不用构建
      const narrow = runDetector(repository, 'HEAD^', 'HEAD');
      expect(narrow.status).toBe(1);

      // 取"上次成功部署的提交"当基线：后端改动重新可见 → 必须构建
      const correct = runDetector(repository, shas[0], 'HEAD');
      expect(correct.status).toBe(0);
      expect(correct.stdout).toContain('backend/src/main.ts');
    } finally {
      rmSync(repository, { recursive: true, force: true });
    }
  });

  it('still skips when nothing image-relevant changed across the whole range', () => {
    const { repository, shas } = repositoryWithCommits([
      'docs/runbook.md',
      '.github/workflows/ci.yml',
      'README.md',
    ]);
    try {
      const result = runDetector(repository, shas[0], 'HEAD');
      expect(result.status).toBe(1);
      expect(result.stdout).toContain('No production image inputs changed');
    } finally {
      rmSync(repository, { recursive: true, force: true });
    }
  });

  it('fails safe and builds when the baseline commit is unavailable', () => {
    // 浅克隆里基线提交常常不在本地；这时宁可多构建一次，也不能默认"不用构建"
    const { repository } = repositoryWithCommits(['backend/src/main.ts']);
    try {
      const result = runDetector(repository, '0000000000000000000000000000000000000000', 'HEAD');
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('comparison history is unavailable');
    } finally {
      rmSync(repository, { recursive: true, force: true });
    }
  });
});
