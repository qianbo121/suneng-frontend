import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repositoryRoot = resolve(__dirname, '../../../..');
const backendRoot = resolve(repositoryRoot, 'backend');
const seedSource = readFileSync(resolve(backendRoot, 'prisma/seed.ts'), 'utf8');

describe('content seed administrator safety contract', () => {
  it('has no administrator model, role, password hashing, or account bootstrap path', () => {
    expect(seedSource).not.toMatch(/\badminUser\b/);
    expect(seedSource).not.toMatch(/\bAdminRole\b/);
    expect(seedSource).not.toMatch(/\bseedAdminUser\b/);
    expect(seedSource).not.toContain('bcryptjs');
  });

  it('keeps the destructive production seed fail-closed', () => {
    expect(seedSource).toContain("process.env.NODE_ENV === 'production'");
    expect(seedSource).toContain("process.env.ALLOW_DESTRUCTIVE_SEED !== '1'");
    expect(seedSource).toContain('Refusing to run the destructive seed');
  });

  it('does not publish known default administrator credentials in active source or docs', () => {
    const protectedFiles = [
      resolve(backendRoot, 'prisma/seed.ts'),
      resolve(backendRoot, 'src/modules/auth/dto/login.dto.ts'),
      resolve(backendRoot, 'src/modules/auth/dto/change-password.dto.ts'),
      resolve(backendRoot, 'src/modules/admin-user/dto/create-admin-user.dto.ts'),
      resolve(repositoryRoot, 'docs/database-init.md'),
      resolve(repositoryRoot, 'docs/prelaunch-checklist.md'),
    ];
    const forbiddenCredentials = [
      ['admin', '123456'].join(''),
      ['editor', '123456'].join(''),
      ['newAdmin', '123456'].join(''),
    ];

    for (const file of protectedFiles) {
      const content = readFileSync(file, 'utf8');
      for (const credential of forbiddenCredentials) {
        expect(content).not.toContain(credential);
      }
    }
  });
});
