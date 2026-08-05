import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const workflow = readFileSync(
  new URL('../../../../.github/workflows/deploy.yml', import.meta.url),
  'utf8',
);
const deployScript = readFileSync(new URL('../../../../deploy.sh', import.meta.url), 'utf8');

describe('production deployment concurrency', () => {
  it('serializes GitHub deploy jobs without cancelling an active SSH deployment', () => {
    expect(workflow).toMatch(
      /concurrency:\s+# Production deploys[\s\S]*group: production-deploy\s+cancel-in-progress: false/,
    );
  });

  it('locks before CI mutates the production working tree', () => {
    const lock = workflow.indexOf('exec 9>"$lock_file"');
    const extract = workflow.indexOf('tar -xzf deploy-source.tgz -C "$tmp_dir"');
    const sync = workflow.indexOf('rsync -a --no-owner --no-group --delete');

    expect(lock).toBeGreaterThan(-1);
    expect(extract).toBeGreaterThan(lock);
    expect(sync).toBeGreaterThan(lock);
    expect(workflow).toContain('flock -w 1800 9');
    expect(workflow).toContain('export DEPLOY_LOCK_HELD=1');
  });

  it('uses the same lock for direct deploy.sh invocations', () => {
    expect(deployScript).toContain(
      'DEPLOY_LOCK_FILE="${DEPLOY_LOCK_FILE:-/var/lock/corp-site-deploy.lock}"',
    );
    expect(deployScript).toContain('if [ "${DEPLOY_LOCK_HELD:-0}" != "1" ]');
    expect(deployScript).toContain('flock -w "${DEPLOY_LOCK_TIMEOUT_SECONDS:-1800}" 9');
  });

  it('preserves server ownership and forwards the image-build decision', () => {
    expect(workflow).toContain('rsync -a --no-owner --no-group --delete');
    expect(workflow).toContain('deploy_skip_build: ${{ steps.image_changes.outputs.skip_build }}');
    expect(workflow).toContain(
      'DEPLOY_SKIP_BUILD=${{ needs.build.outputs.deploy_skip_build }}',
    );
  });

  it('fails image builds before deployment when disk is unsafe', () => {
    expect(deployScript).toContain('DEPLOY_MIN_FREE_GB:-12');
    expect(deployScript).toContain('Refusing image build: at least ${min_free_gb}GB');
    expect(deployScript).toContain('for service in backend frontend admin');
    expect(deployScript).toContain('build "$service"');
  });
});
