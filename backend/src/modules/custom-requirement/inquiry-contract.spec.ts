import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  INQUIRY_CONTRACT_VERSION,
  supportsInquiryContract,
  supportsShujuInquiryConsumer,
} from '@/modules/custom-requirement/inquiry-contract';
import { AppController } from '@/app.controller';

const repoRoot = resolve(process.cwd(), '..');

describe('inquiry release contract', () => {
  it('recognizes only V2-or-newer direct and wrapped health payloads', () => {
    expect(INQUIRY_CONTRACT_VERSION).toBe(2);
    expect(supportsInquiryContract({ inquiryContractVersion: 2 })).toBe(true);
    expect(supportsInquiryContract({ data: { inquiryContractVersion: 3 } })).toBe(true);
    expect(supportsInquiryContract({ data: { inquiryContractVersion: 1 } })).toBe(false);
    expect(supportsInquiryContract({ status: 'ok' })).toBe(false);
    expect(new AppController().getHealth().inquiryContractVersion).toBe(2);
  });

  it('accepts Shuju only after V2 migration and the exact cutover are ready', () => {
    const ready = {
      ok: true,
      inquiry_consumer_contract_version: 2,
      inquiry_mode: 'new_web_only',
      inquiry_start_after_id: 41,
      inquiry_cutover_initialized: true,
      inquiry_cutover_ready: true,
    };

    expect(supportsShujuInquiryConsumer(ready, 41)).toBe(true);
    expect(supportsShujuInquiryConsumer({ ...ready, inquiry_start_after_id: 40 }, 41)).toBe(false);
    expect(supportsShujuInquiryConsumer({ ...ready, inquiry_cutover_ready: false }, 41)).toBe(
      false,
    );
    expect(supportsShujuInquiryConsumer({ ok: true }, 41)).toBe(false);
  });

  it('checks the candidate image before migration and requires V2 health in production', () => {
    const deploy = readFileSync(resolve(repoRoot, 'deploy.sh'), 'utf8');
    const compose = readFileSync(resolve(repoRoot, 'docker-compose.prod.yml'), 'utf8');
    const adminMarker = readFileSync(
      resolve(repoRoot, 'admin/public/inquiry-contract-version.txt'),
      'utf8',
    );
    const imageGate = 'node backend/dist/src/inquiry-contract-gate.js image';
    const healthGate =
      'node backend/dist/src/inquiry-contract-gate.js health http://127.0.0.1:3001/api/health';

    expect(deploy).toContain(imageGate);
    expect(deploy.indexOf(imageGate)).toBeLessThan(deploy.indexOf('prisma migrate deploy'));
    expect(deploy).toContain('admin image does not support inquiry contract V2');
    expect(deploy.indexOf('admin image does not support inquiry contract V2')).toBeLessThan(
      deploy.indexOf('prisma migrate deploy'),
    );
    expect(deploy).toContain('inquiry-contract-gate.js health');
    expect(deploy).toContain('inquiry-contract-gate.js shuju-health');
    expect(deploy).toContain('Shuju V2 consumer is not ready at the frozen inquiry cutover');
    expect(deploy.indexOf('inquiry-contract-gate.js shuju-health')).toBeLessThan(
      deploy.indexOf('prisma migrate deploy'),
    );
    expect(compose).toContain(healthGate);
    expect(compose).toContain('/usr/share/nginx/html/inquiry-contract-version.txt');
    expect(compose).not.toContain('r.statusCode === 200 ? 0 : 1');
    expect(adminMarker.trim()).toBe('2');
  });

  it('forbids whole-stack legacy rollback after email-only inquiries are enabled', () => {
    const runbook = readFileSync(resolve(repoRoot, 'DEPLOY.md'), 'utf8');

    expect(runbook).toContain('禁止按下面的旧流程整体切回旧版 backend、admin 或数炬镜像');
    expect(runbook).toContain('只回退 frontend');
    expect(runbook).toContain('完整重扫');
    expect(runbook).toContain('不得恢复迁移前数据库');
    expect(runbook).toContain('先升级数炬并完成切换点初始化');
  });

  it('activates the V2 Nginx route before replacing the public frontend', () => {
    const deploy = readFileSync(resolve(repoRoot, 'deploy.sh'), 'utf8');
    const migration = deploy.indexOf('prisma migrate deploy');
    const backendAdminStart = deploy.indexOf('up -d backend admin');
    const backendHealthGate = deploy.indexOf('if [ "$backend_healthy" -ne 1 ]');
    const adminHealthGate = deploy.indexOf('if [ "$admin_healthy" -ne 1 ]');
    const routePreloadReload = deploy.indexOf('nginx -s reload');
    const frontendStart = deploy.indexOf('up -d frontend');
    const frontendHealthGate = deploy.indexOf('if [ "$frontend_healthy" -ne 1 ]');
    const finalNginxReload = deploy.lastIndexOf('nginx -s reload');

    expect(deploy.indexOf('nginx_container_id=')).toBeLessThan(migration);
    expect(backendAdminStart).toBeGreaterThan(migration);
    expect(backendHealthGate).toBeGreaterThan(backendAdminStart);
    expect(adminHealthGate).toBeGreaterThan(backendHealthGate);
    expect(routePreloadReload).toBeGreaterThan(adminHealthGate);
    expect(frontendStart).toBeGreaterThan(routePreloadReload);
    expect(frontendHealthGate).toBeGreaterThan(frontendStart);
    expect(finalNginxReload).toBeGreaterThan(frontendHealthGate);
    expect(finalNginxReload).toBeGreaterThan(routePreloadReload);
    expect(deploy).not.toMatch(/compose[^\n]* up -d\s*$/m);
  });

  it('keeps no-cache releases inside the same guarded deployment entrypoint', () => {
    const deploy = readFileSync(resolve(repoRoot, 'deploy.sh'), 'utf8');
    const runbook = readFileSync(resolve(repoRoot, 'DEPLOY.md'), 'utf8');
    const cacheSection = runbook.split('### 4.1')[1]?.split('### 4.2')[0] ?? '';

    expect(deploy).toContain('DEPLOY_FORCE_NO_CACHE_BUILD:-0');
    expect(deploy).toContain('build --no-cache "$service"');
    expect(runbook).toContain('DEPLOY_FORCE_NO_CACHE_BUILD=1 ./deploy.sh');
    expect(cacheSection).not.toMatch(/docker compose[^\n]* up -d/);
  });
});
