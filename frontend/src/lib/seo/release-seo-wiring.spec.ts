import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { inlineStaticEnv } from 'next/dist/lib/inline-static-env';
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


const tongjiName = 'NEXT_PUBLIC_BAIDU_TONGJI_ID';
const fixtureTongjiId = '0123456789abcdef0123456789abcdef';
const frontendDockerfile = readFileSync(new URL('frontend/Dockerfile', root), 'utf8');
const tongjiGuard = frontendDockerfile.match(/^RUN node -e '([^'\n]+)'$/m)?.[1];

function candidateBuildScript(workflow: string): string {
  const script = workflow.match(/- name: Build candidate outside production[\s\S]*?run: \|\n([\s\S]*?)(?=\n      - name:)/)?.[1];
  if (!script) throw new Error('Missing real candidate build step');
  return script.split('\n').map((line) => line.replace(/^          /, '')).join('\n');
}

describe('Baidu statistics public build identifier', () => {
  it.each(['prepare-frontend.yml', 'prepare-release.yml'])('reads the public repository variable and passes the identifier in %s', (file) => {
    const workflow = readFileSync(new URL(`.github/workflows/${file}`, root), 'utf8');
    expect(workflow).toContain(tongjiName + ': ${' + '{ vars.' + tongjiName + ' }}');
    expect(workflow).not.toContain('secrets.' + tongjiName);
    expect(workflow).toContain(`--build-arg "${tongjiName}=$${tongjiName}"`);
    expect(frontendDockerfile).toContain(`ARG ${tongjiName}`);
    expect(frontendDockerfile).toContain(`ENV ${tongjiName}=\${${tongjiName}}`);
    expect(frontendDockerfile.indexOf('RUN node -e')).toBeLessThan(frontendDockerfile.indexOf('pnpm --dir frontend build'));
  });

  it.each(['', 'disabled', fixtureTongjiId, fixtureTongjiId.toUpperCase()])('accepts the permitted public value %j in the actual Docker guard', (value) => {
    expect(tongjiGuard).toBeTruthy();
    const result = spawnSync(process.execPath, ['-e', tongjiGuard!], { env: { NODE_ENV: 'test', [tongjiName]: value }, encoding: 'utf8' });
    expect(result.status).toBe(0);
  });

  it.each(['a'.repeat(31), 'a'.repeat(33), 'g'.repeat(32), 'disabled ', 'false', ` ${fixtureTongjiId}`, 'https://hm.baidu.com/hm.js?value', '";globalThis.injected=true;//'])('rejects an invalid value without echoing it: %j', (value) => {
    const result = spawnSync(process.execPath, ['-e', tongjiGuard!], { env: { NODE_ENV: 'test', [tongjiName]: value }, encoding: 'utf8' });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('Invalid public Baidu Tongji identifier');
    expect(result.stderr).not.toContain(value);
  });

  it.each(['frontend', 'backend'])('the real unified build shell gives the public argument only to frontend: %s', (component) => {
    const workflow = readFileSync(new URL('.github/workflows/prepare-release.yml', root), 'utf8');
    // Capture argv through a shell function; no Docker build or external command runs.
    const script = 'docker() { printf "%s\n" "$@"; }\nbash() { :; }\n' + candidateBuildScript(workflow);
    const result = spawnSync('/bin/bash', ['-c', script], {
      env: {
        NODE_ENV: 'test',
        COMPONENT: component,
        [tongjiName]: fixtureTongjiId,
        NEXT_PUBLIC_BAIDU_SITE_VERIFICATION: '',
        NEXT_PUBLIC_BING_SITE_VERIFICATION: '',
        NEXT_PUBLIC_360_SITE_VERIFICATION: '',
        NEXT_PUBLIC_SOGOU_SITE_VERIFICATION: '',
        SOURCE_COMMIT: '0'.repeat(40),
        IMAGE_TAG: 'fixture-not-built',
      },
      encoding: 'utf8',
    });
    expect(result.status, result.stderr).toBe(0);
    const args = result.stdout.trim().split('\n');
    expect(args).toContain(`${component}/Dockerfile`);
    expect(args.includes(`${tongjiName}=${fixtureTongjiId}`)).toBe(component === 'frontend');
  });

  it('keeps the actually used compose build path configurable without adding a runtime override', () => {
    const compose = readFileSync(new URL('docker-compose.prod.yml', root), 'utf8');
    const deploy = readFileSync(new URL('deploy.sh', root), 'utf8');
    const frontend = compose.split('\n  frontend:\n')[1].split('\n  admin:\n')[0];
    expect(deploy).toContain('docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build "$service"');
    expect(frontend.split('\n    labels:')[0]).toContain(`${tongjiName}: \${${tongjiName}:-}`);
    expect(frontend.split('\n    environment:')[1]).not.toContain(tongjiName);
  });

  it.each([undefined, '', 'disabled', fixtureTongjiId])('Next really inlines the unchanged component selection for %j', async (value) => {
    const original = process.env[tongjiName];
    const distDir = mkdtempSync(join(tmpdir(), 'tongji-build-fixture-'));
    try {
      if (value === undefined) delete process.env[tongjiName];
      else process.env[tongjiName] = value;
      mkdirSync(join(distDir, 'server'));
      mkdirSync(join(distDir, 'static'));
      const component = readFileSync(new URL('frontend/src/components/seo/BaiduAnalytics.tsx', root), 'utf8');
      const declarations = ['DEFAULT_BAIDU_TONGJI_ID', 'BAIDU_TONGJI_ID', 'BAIDU_TONGJI_ENABLED']
        .map((name) => component.match(new RegExp(`^const ${name} = .+;$`, 'm'))?.[0]);
      expect(declarations.every(Boolean)).toBe(true);
      writeFileSync(join(distDir, 'static', 'tongji-aaaaaaaaaaaaaaaa.js'), declarations.join('\n') + '\nglobalThis.fixtureId = BAIDU_TONGJI_ID; globalThis.fixtureEnabled = BAIDU_TONGJI_ENABLED;');
      // Use the installed Next production inliner, on these isolated fixture files only.
      await inlineStaticEnv({ distDir, config: { env: {} } as Parameters<typeof inlineStaticEnv>[0]['config'] });
      const chunk = readFileSync(join(distDir, 'static', readdirSync(join(distDir, 'static'))[0]), 'utf8');
      const browser = { process: { env: {} }, fixtureId: '', fixtureEnabled: false };
      runInNewContext(chunk, browser);
      expect(browser.fixtureId).toBe(value || 'aecc3dcdd0269720537a44fc963eddbb');
      expect(browser.fixtureEnabled).toBe(value !== 'disabled');
      if (value) expect(chunk).not.toContain(`process.env.${tongjiName}`);
    } finally {
      if (original === undefined) delete process.env[tongjiName];
      else process.env[tongjiName] = original;
      rmSync(distDir, { recursive: true, force: true });
    }
  });
});
