import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repositoryRoot = resolve(__dirname, '../../../..');
const backendRoot = resolve(repositoryRoot, 'backend');
const seedSource = readFileSync(resolve(backendRoot, 'prisma/seed.ts'), 'utf8');

function collectFiles(directory: string, extensions: Set<string>): string[] {
  const ignoredDirectories = new Set(['.git', '.next', 'artifacts', 'dist', 'node_modules']);

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      return ignoredDirectories.has(entry.name) ? [] : collectFiles(path, extensions);
    }

    const extension = entry.name.slice(entry.name.lastIndexOf('.'));
    return extensions.has(extension) ? [path] : [];
  });
}

describe('content seed administrator safety contract', () => {
  it('has no administrator model, role, password hashing, or account bootstrap path', () => {
    const executableSeedFiles = collectFiles(
      resolve(backendRoot, 'prisma'),
      new Set(['.cjs', '.js', '.mjs', '.ts']),
    );

    expect(executableSeedFiles).toContain(resolve(backendRoot, 'prisma/seed.ts'));
    for (const file of executableSeedFiles) {
      const content = readFileSync(file, 'utf8');
      expect(content).not.toMatch(/admin_?user/i);
      expect(content).not.toMatch(/\bAdminRole\b/i);
      expect(content).not.toMatch(/\bpasswordHash\b/i);
      expect(content).not.toMatch(/\bseedAdminUser\b/i);
      expect(content).not.toContain('bcryptjs');
    }
  });

  it('pins Prisma to the reviewed content seed entrypoint', () => {
    const prismaConfig = readFileSync(resolve(backendRoot, 'prisma.config.ts'), 'utf8');
    expect(prismaConfig).toContain("seed: 'ts-node --project tsconfig.json prisma/seed.ts'");
  });

  it('keeps the destructive production seed fail-closed', () => {
    expect(seedSource).toContain("process.env.NODE_ENV === 'production'");
    expect(seedSource).toContain("process.env.ALLOW_DESTRUCTIVE_SEED !== '1'");
    expect(seedSource).toContain('Refusing to run the destructive seed');
  });

  it('does not publish known default administrator credentials in active source or docs', () => {
    const protectedFiles = collectFiles(
      repositoryRoot,
      new Set(['.cjs', '.js', '.json', '.md', '.mjs', '.ts', '.tsx', '.yaml', '.yml']),
    );
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
